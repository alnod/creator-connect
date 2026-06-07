
CREATE TABLE public.creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  craft TEXT NOT NULL,
  area TEXT NOT NULL,
  rate INTEGER NOT NULL,
  image_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.creators TO anon, authenticated;
GRANT ALL ON public.creators TO service_role;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators are publicly readable" ON public.creators FOR SELECT USING (true);

CREATE TABLE public.creator_busy_dates (
  creator_id TEXT NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  busy_date DATE NOT NULL,
  PRIMARY KEY (creator_id, busy_date)
);
GRANT SELECT ON public.creator_busy_dates TO anon, authenticated;
GRANT ALL ON public.creator_busy_dates TO service_role;
ALTER TABLE public.creator_busy_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Busy dates are publicly readable" ON public.creator_busy_dates FOR SELECT USING (true);

CREATE TABLE public.booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  hours INTEGER NOT NULL CHECK (hours BETWEEN 1 AND 24),
  venue TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.booking_requests TO anon, authenticated;
GRANT ALL ON public.booking_requests TO service_role;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit booking requests" ON public.booking_requests FOR INSERT WITH CHECK (true);

CREATE TABLE public.booking_request_creators (
  request_id UUID NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','conflict')),
  PRIMARY KEY (request_id, creator_id)
);
GRANT INSERT ON public.booking_request_creators TO anon, authenticated;
GRANT ALL ON public.booking_request_creators TO service_role;
ALTER TABLE public.booking_request_creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can pin creators to their request" ON public.booking_request_creators FOR INSERT WITH CHECK (true);

-- Seed creators
INSERT INTO public.creators (id, name, craft, area, rate, image_key, sort_order) VALUES
  ('nadia', 'Nadia Wanjiku', 'Afrobeats DJ', 'Westlands', 80000, 'creator-1', 1),
  ('elena', 'Elena Achieng', 'DJ + Live Sax', 'Kilimani', 145000, 'creator-2', 2),
  ('theo',  'Theo Mwangi',  'Corporate Emcee', 'CBD · Bilingual EN/SW', 110000, 'creator-3', 3);

-- Seed busy dates relative to today
INSERT INTO public.creator_busy_dates (creator_id, busy_date)
SELECT 'nadia', (CURRENT_DATE + d) FROM unnest(ARRAY[2,5,9,14,21]) d
UNION ALL
SELECT 'elena', (CURRENT_DATE + d) FROM unnest(ARRAY[1,6,7,12,19,28]) d
UNION ALL
SELECT 'theo',  (CURRENT_DATE + d) FROM unnest(ARRAY[3,4,11,17,24]) d;
