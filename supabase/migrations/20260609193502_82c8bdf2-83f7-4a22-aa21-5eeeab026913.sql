
-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'creator');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2. Link creators to auth users
ALTER TABLE public.creators
  ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN email text;
CREATE UNIQUE INDEX creators_auth_user_id_unique ON public.creators(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- 3. Auto-create profile on signup + bootstrap admin role for the founding admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'alnodmunene@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Auto-link to creator row if their email matches a pre-seeded creator email
  UPDATE public.creators
  SET auth_user_id = NEW.id
  WHERE lower(email) = lower(NEW.email) AND auth_user_id IS NULL;

  -- If they were linked to a creator, grant creator role
  IF EXISTS (SELECT 1 FROM public.creators WHERE auth_user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'creator')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- 5. RLS for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Booking access: admins see all; creators see requests they were pinged for
CREATE POLICY "Admins read all booking requests" ON public.booking_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update booking requests" ON public.booking_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators read pings for their requests" ON public.booking_requests
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.booking_request_creators brc
      JOIN public.creators c ON c.id = brc.creator_id
      WHERE brc.request_id = booking_requests.id AND c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins read all request creators" ON public.booking_request_creators
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators read their own assignments" ON public.booking_request_creators
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.creators c WHERE c.id = booking_request_creators.creator_id AND c.auth_user_id = auth.uid())
  );
CREATE POLICY "Creators update their own assignment" ON public.booking_request_creators
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.creators c WHERE c.id = booking_request_creators.creator_id AND c.auth_user_id = auth.uid())
  );

CREATE POLICY "Admins read status events" ON public.booking_status_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators read status events for their requests" ON public.booking_status_events
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.booking_request_creators brc
      JOIN public.creators c ON c.id = brc.creator_id
      WHERE brc.request_id = booking_status_events.request_id AND c.auth_user_id = auth.uid()
    )
  );

-- 7. Allow admins to manage creators
CREATE POLICY "Admins update creators" ON public.creators
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
