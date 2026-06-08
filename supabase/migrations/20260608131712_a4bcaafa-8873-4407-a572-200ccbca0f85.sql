
-- 1. Add columns to booking_requests
ALTER TABLE public.booking_requests
  ADD COLUMN status TEXT NOT NULL DEFAULT 'notified'
    CHECK (status IN ('pending','notified','client_review','confirmed','completed','canceled')),
  ADD COLUMN confirmation_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
  ADD COLUMN chosen_creator_id TEXT REFERENCES public.creators(id);

CREATE UNIQUE INDEX booking_requests_confirmation_token_idx
  ON public.booking_requests(confirmation_token);

-- 2. Add response tokens to booking_request_creators; relax status check
ALTER TABLE public.booking_request_creators
  ADD COLUMN response_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
  ADD COLUMN responded_at TIMESTAMPTZ;

CREATE UNIQUE INDEX brc_response_token_idx
  ON public.booking_request_creators(response_token);

ALTER TABLE public.booking_request_creators
  DROP CONSTRAINT IF EXISTS booking_request_creators_status_check;
-- Re-add a broader check via trigger-free constraint
ALTER TABLE public.booking_request_creators
  ADD CONSTRAINT brc_status_check
  CHECK (status IN ('pending','accepted','declined','conflict','confirmed'));

-- 3. Status events audit log
CREATE TABLE public.booking_status_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  actor TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.booking_status_events TO authenticated;
GRANT ALL ON public.booking_status_events TO service_role;
ALTER TABLE public.booking_status_events ENABLE ROW LEVEL SECURITY;
-- No public policies; only service_role (server fns) reads/writes.

CREATE INDEX booking_status_events_request_idx
  ON public.booking_status_events(request_id, created_at DESC);

-- 4. Trigger: when a request becomes 'confirmed', auto-add busy date for the chosen creator
CREATE OR REPLACE FUNCTION public.on_booking_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS DISTINCT FROM 'confirmed') THEN
    IF NEW.chosen_creator_id IS NULL THEN
      RAISE EXCEPTION 'Cannot confirm without chosen_creator_id';
    END IF;
    INSERT INTO public.creator_busy_dates (creator_id, busy_date)
    VALUES (NEW.chosen_creator_id, NEW.event_date)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_booking_confirmed
AFTER UPDATE OF status ON public.booking_requests
FOR EACH ROW EXECUTE FUNCTION public.on_booking_confirmed();

-- Add unique constraint on busy dates if not already
DO $$ BEGIN
  ALTER TABLE public.creator_busy_dates
    ADD CONSTRAINT creator_busy_dates_pkey PRIMARY KEY (creator_id, busy_date);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
