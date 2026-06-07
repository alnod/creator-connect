
DROP POLICY "Anyone can submit booking requests" ON public.booking_requests;
CREATE POLICY "Public can submit valid booking requests"
  ON public.booking_requests FOR INSERT
  WITH CHECK (
    char_length(email) BETWEEN 5 AND 254
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(venue) BETWEEN 2 AND 200
    AND char_length(event_type) BETWEEN 2 AND 80
    AND event_date >= CURRENT_DATE
    AND event_date <= CURRENT_DATE + INTERVAL '365 days'
  );

DROP POLICY "Anyone can pin creators to their request" ON public.booking_request_creators;
CREATE POLICY "Public can attach creators to fresh requests"
  ON public.booking_request_creators FOR INSERT
  WITH CHECK (
    status = 'pending' OR status = 'conflict'
  );
