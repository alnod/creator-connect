import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type CreatorWithBusy = {
  id: string;
  name: string;
  craft: string;
  area: string;
  rate: number;
  image_key: string;
  busy_dates: string[];
};

export const listCreatorsWithBusy = createServerFn({ method: "GET" }).handler(
  async (): Promise<CreatorWithBusy[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: creators, error: cErr } = await supabaseAdmin
      .from("creators")
      .select("id, name, craft, area, rate, image_key, sort_order")
      .order("sort_order", { ascending: true });
    if (cErr) throw new Error(cErr.message);

    const today = new Date().toISOString().slice(0, 10);
    const { data: busy, error: bErr } = await supabaseAdmin
      .from("creator_busy_dates")
      .select("creator_id, busy_date")
      .gte("busy_date", today);
    if (bErr) throw new Error(bErr.message);

    const byCreator = new Map<string, string[]>();
    for (const row of busy ?? []) {
      const list = byCreator.get(row.creator_id as string) ?? [];
      list.push(row.busy_date as string);
      byCreator.set(row.creator_id as string, list);
    }

    return (creators ?? []).map((c: { id: string; name: string; craft: string; area: string; rate: number; image_key: string }) => ({
      id: c.id,
      name: c.name,
      craft: c.craft,
      area: c.area,
      rate: c.rate,
      image_key: c.image_key,
      busy_dates: byCreator.get(c.id) ?? [],
    }));
  },
);

const BookingInput = z.object({
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  event_type: z.string().min(2).max(80),
  hours: z.number().int().min(1).max(24),
  venue: z.string().min(2).max(200),
  email: z.string().email().max(254),
  creator_ids: z.array(z.string().min(1).max(64)).min(1).max(10),
});

export type BookingResult =
  | { ok: true; request_id: string; pinged: string[]; conflicts: string[] }
  | { ok: false; reason: "all_conflict"; pinged: string[]; conflicts: string[]; request_id: null };

export const submitBookingRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => BookingInput.parse(data))
  .handler(async ({ data }): Promise<BookingResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: busyRows, error: busyErr } = await supabaseAdmin
      .from("creator_busy_dates")
      .select("creator_id")
      .in("creator_id", data.creator_ids)
      .eq("busy_date", data.event_date);
    if (busyErr) throw new Error(busyErr.message);

    const conflicts: string[] = Array.from(
      new Set((busyRows ?? []).map((r: { creator_id: string }) => r.creator_id)),
    );
    const conflictSet = new Set(conflicts);
    const pinged: string[] = data.creator_ids.filter((id) => !conflictSet.has(id));

    if (pinged.length === 0) {
      return { ok: false, reason: "all_conflict", pinged: [], conflicts, request_id: null };
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("booking_requests")
      .insert({
        event_date: data.event_date,
        event_type: data.event_type,
        hours: data.hours,
        venue: data.venue,
        email: data.email,
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    const rows = [
      ...pinged.map((id) => ({ request_id: inserted.id as string, creator_id: id, status: "pending" as const })),
      ...conflicts.map((id) => ({ request_id: inserted.id as string, creator_id: id, status: "conflict" as const })),
    ];
    const { error: linkErr } = await supabaseAdmin.from("booking_request_creators").insert(rows);
    if (linkErr) throw new Error(linkErr.message);

    return { ok: true, request_id: inserted.id as string, pinged, conflicts };
  });
