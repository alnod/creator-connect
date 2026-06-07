import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export type CreatorWithBusy = {
  id: string;
  name: string;
  craft: string;
  area: string;
  rate: number;
  image_key: string;
  busy_dates: string[]; // ISO yyyy-mm-dd
};

export const listCreatorsWithBusy = createServerFn({ method: "GET" }).handler(
  async (): Promise<CreatorWithBusy[]> => {
    const { data: creators, error: cErr } = await supabase
      .from("creators")
      .select("id, name, craft, area, rate, image_key, sort_order")
      .order("sort_order", { ascending: true });
    if (cErr) throw new Error(cErr.message);

    const today = new Date().toISOString().slice(0, 10);
    const { data: busy, error: bErr } = await supabase
      .from("creator_busy_dates")
      .select("creator_id, busy_date")
      .gte("busy_date", today);
    if (bErr) throw new Error(bErr.message);

    const byCreator = new Map<string, string[]>();
    for (const row of busy ?? []) {
      const list = byCreator.get(row.creator_id) ?? [];
      list.push(row.busy_date as string);
      byCreator.set(row.creator_id, list);
    }

    return (creators ?? []).map((c) => ({
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

export const submitBookingRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => BookingInput.parse(data))
  .handler(async ({ data }) => {
    // Determine which creators are actually free that day
    const { data: busyRows, error: busyErr } = await supabase
      .from("creator_busy_dates")
      .select("creator_id")
      .in("creator_id", data.creator_ids)
      .eq("busy_date", data.event_date);
    if (busyErr) throw new Error(busyErr.message);

    const conflictSet = new Set((busyRows ?? []).map((r) => r.creator_id as string));
    const pinged = data.creator_ids.filter((id) => !conflictSet.has(id));

    if (pinged.length === 0) {
      return {
        ok: false as const,
        reason: "all_conflict" as const,
        conflicts: Array.from(conflictSet),
        pinged: [],
        request_id: null,
      };
    }

    const { data: inserted, error: insErr } = await supabase
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
      ...pinged.map((id) => ({ request_id: inserted.id, creator_id: id, status: "pending" as const })),
      ...Array.from(conflictSet).map((id) => ({
        request_id: inserted.id,
        creator_id: id,
        status: "conflict" as const,
      })),
    ];
    const { error: linkErr } = await supabase.from("booking_request_creators").insert(rows);
    if (linkErr) throw new Error(linkErr.message);

    return {
      ok: true as const,
      request_id: inserted.id as string,
      pinged,
      conflicts: Array.from(conflictSet),
    };
  });
