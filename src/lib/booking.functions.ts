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
  | { ok: true; request_id: string; confirmation_token: string; pinged: string[]; conflicts: string[] }
  | { ok: false; reason: "all_conflict"; pinged: string[]; conflicts: string[]; request_id: null; confirmation_token: null };

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
      return { ok: false, reason: "all_conflict", pinged: [], conflicts, request_id: null, confirmation_token: null };
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("booking_requests")
      .insert({
        event_date: data.event_date,
        event_type: data.event_type,
        hours: data.hours,
        venue: data.venue,
        email: data.email,
        status: "notified",
      })
      .select("id, confirmation_token")
      .single();
    if (insErr) throw new Error(insErr.message);

    const rows = [
      ...pinged.map((id) => ({ request_id: inserted.id as string, creator_id: id, status: "pending" as const })),
      ...conflicts.map((id) => ({ request_id: inserted.id as string, creator_id: id, status: "conflict" as const })),
    ];
    const { error: linkErr } = await supabaseAdmin.from("booking_request_creators").insert(rows);
    if (linkErr) throw new Error(linkErr.message);

    await supabaseAdmin.from("booking_status_events").insert({
      request_id: inserted.id as string,
      event: "notified",
      actor: data.email,
      meta: { pinged_count: pinged.length, conflicts_count: conflicts.length },
    });

    return {
      ok: true,
      request_id: inserted.id as string,
      confirmation_token: inserted.confirmation_token as string,
      pinged,
      conflicts,
    };
  });

// -----------------------------------------------------------------------------
// Client status page
// -----------------------------------------------------------------------------

export type CreatorResponseRow = {
  creator_id: string;
  creator_name: string;
  craft: string;
  area: string;
  image_key: string;
  status: string;
  responded_at: string | null;
};

export type RequestDetail = {
  id: string;
  event_date: string;
  event_type: string;
  hours: number;
  venue: string;
  email: string;
  status: string;
  chosen_creator_id: string | null;
  created_at: string;
  creators: CreatorResponseRow[];
  events: { event: string; created_at: string; meta_json: string }[];
};

export const getRequestByToken = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string().min(10).max(80) }).parse(data))
  .handler(async ({ data }): Promise<RequestDetail | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req, error } = await supabaseAdmin
      .from("booking_requests")
      .select("id, event_date, event_type, hours, venue, email, status, chosen_creator_id, created_at")
      .eq("confirmation_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!req) return null;

    const [{ data: brc }, { data: creators }, { data: events }] = await Promise.all([
      supabaseAdmin
        .from("booking_request_creators")
        .select("creator_id, status, responded_at")
        .eq("request_id", req.id as string),
      supabaseAdmin.from("creators").select("id, name, craft, area, image_key"),
      supabaseAdmin
        .from("booking_status_events")
        .select("event, created_at, meta")
        .eq("request_id", req.id as string)
        .order("created_at", { ascending: true }),
    ]);

    const cMap = new Map((creators ?? []).map((c: { id: string }) => [c.id, c]));
    const creatorRows: CreatorResponseRow[] = (brc ?? []).map((r: { creator_id: string; status: string; responded_at: string | null }) => {
      const c = cMap.get(r.creator_id) as { name?: string; craft?: string; area?: string; image_key?: string } | undefined;
      return {
        creator_id: r.creator_id,
        creator_name: c?.name ?? r.creator_id,
        craft: c?.craft ?? "",
        area: c?.area ?? "",
        image_key: c?.image_key ?? "",
        status: r.status,
        responded_at: r.responded_at,
      };
    });

    return {
      id: req.id as string,
      event_date: req.event_date as string,
      event_type: req.event_type as string,
      hours: req.hours as number,
      venue: req.venue as string,
      email: req.email as string,
      status: req.status as string,
      chosen_creator_id: (req.chosen_creator_id as string | null) ?? null,
      created_at: req.created_at as string,
      creators: creatorRows,
      events: (events ?? []).map((e: { event: string; created_at: string; meta: unknown }) => ({
        event: e.event,
        created_at: e.created_at,
        meta_json: JSON.stringify(e.meta ?? {}),
      })),
    };
  });

// -----------------------------------------------------------------------------
// Creator response page (magic-link)
// -----------------------------------------------------------------------------

export type CreatorResponseContext = {
  request_id: string;
  confirmation_token: string;
  creator_id: string;
  creator_name: string;
  current_status: string;
  request: {
    event_date: string;
    event_type: string;
    hours: number;
    venue: string;
    status: string;
  };
} | null;

export const getResponseContext = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string().min(10).max(80) }).parse(data))
  .handler(async ({ data }): Promise<CreatorResponseContext> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("booking_request_creators")
      .select("creator_id, status, request_id")
      .eq("response_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const [{ data: req }, { data: c }] = await Promise.all([
      supabaseAdmin
        .from("booking_requests")
        .select("event_date, event_type, hours, venue, status, confirmation_token")
        .eq("id", row.request_id as string)
        .single(),
      supabaseAdmin.from("creators").select("name").eq("id", row.creator_id as string).single(),
    ]);
    if (!req || !c) return null;
    return {
      request_id: row.request_id as string,
      confirmation_token: req.confirmation_token as string,
      creator_id: row.creator_id as string,
      creator_name: c.name as string,
      current_status: row.status as string,
      request: {
        event_date: req.event_date as string,
        event_type: req.event_type as string,
        hours: req.hours as number,
        venue: req.venue as string,
        status: req.status as string,
      },
    };
  });

export const respondToRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      token: z.string().min(10).max(80),
      action: z.enum(["accept", "decline"]),
    }).parse(data),
  )
  .handler(async ({ data }): Promise<{ ok: true; status: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("booking_request_creators")
      .select("request_id, creator_id, status")
      .eq("response_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Invalid or expired link.");
    if (row.status !== "pending") {
      throw new Error(`You already responded (${row.status}).`);
    }
    const newStatus = data.action === "accept" ? "accepted" : "declined";

    const { error: uErr } = await supabaseAdmin
      .from("booking_request_creators")
      .update({ status: newStatus, responded_at: new Date().toISOString() })
      .eq("response_token", data.token);
    if (uErr) throw new Error(uErr.message);

    // If first acceptance, bump request to client_review
    if (newStatus === "accepted") {
      const { data: reqRow } = await supabaseAdmin
        .from("booking_requests")
        .select("status")
        .eq("id", row.request_id as string)
        .single();
      if (reqRow && reqRow.status === "notified") {
        await supabaseAdmin
          .from("booking_requests")
          .update({ status: "client_review" })
          .eq("id", row.request_id as string);
        await supabaseAdmin.from("booking_status_events").insert({
          request_id: row.request_id as string,
          event: "client_review",
          actor: row.creator_id as string,
          meta: { trigger: "first_acceptance" },
        });
      }
    }

    await supabaseAdmin.from("booking_status_events").insert({
      request_id: row.request_id as string,
      event: `creator_${newStatus}`,
      actor: row.creator_id as string,
      meta: {},
    });

    return { ok: true, status: newStatus };
  });

// -----------------------------------------------------------------------------
// Client actions: confirm / cancel
// -----------------------------------------------------------------------------

export const confirmBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      token: z.string().min(10).max(80),
      creator_id: z.string().min(1).max(64),
    }).parse(data),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req, error } = await supabaseAdmin
      .from("booking_requests")
      .select("id, status")
      .eq("confirmation_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!req) throw new Error("Booking not found.");
    if (req.status === "confirmed") throw new Error("Already confirmed.");
    if (req.status === "canceled") throw new Error("Booking was canceled.");

    const { data: brc } = await supabaseAdmin
      .from("booking_request_creators")
      .select("status")
      .eq("request_id", req.id as string)
      .eq("creator_id", data.creator_id)
      .maybeSingle();
    if (!brc || brc.status !== "accepted") {
      throw new Error("That creator hasn't accepted this request.");
    }

    const { error: u1 } = await supabaseAdmin
      .from("booking_requests")
      .update({ status: "confirmed", chosen_creator_id: data.creator_id })
      .eq("id", req.id as string);
    if (u1) throw new Error(u1.message);

    await supabaseAdmin
      .from("booking_request_creators")
      .update({ status: "confirmed" })
      .eq("request_id", req.id as string)
      .eq("creator_id", data.creator_id);

    await supabaseAdmin.from("booking_status_events").insert({
      request_id: req.id as string,
      event: "confirmed",
      actor: "client",
      meta: { creator_id: data.creator_id },
    });

    return { ok: true };
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token: z.string().min(10).max(80) }).parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req, error } = await supabaseAdmin
      .from("booking_requests")
      .select("id, status")
      .eq("confirmation_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!req) throw new Error("Booking not found.");
    if (req.status === "confirmed") throw new Error("Cannot cancel a confirmed booking from this link.");

    await supabaseAdmin.from("booking_requests").update({ status: "canceled" }).eq("id", req.id as string);
    await supabaseAdmin.from("booking_status_events").insert({
      request_id: req.id as string,
      event: "canceled",
      actor: "client",
      meta: {},
    });
    return { ok: true };
  });

// -----------------------------------------------------------------------------
// Admin feed
// -----------------------------------------------------------------------------

export type AdminFeedItem = {
  id: string;
  status: string;
  event_date: string;
  event_type: string;
  venue: string;
  email: string;
  created_at: string;
  confirmation_token: string;
  pinged_count: number;
  accepted_count: number;
  declined_count: number;
  creator_links: { creator_id: string; creator_name: string; status: string; response_token: string }[];
};

export const listAdminFeed = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ key: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }): Promise<AdminFeedItem[]> => {
    const expected = process.env.ADMIN_DASHBOARD_KEY;
    if (!expected || data.key !== expected) {
      throw new Error("Unauthorized.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reqs, error } = await supabaseAdmin
      .from("booking_requests")
      .select("id, status, event_date, event_type, venue, email, created_at, confirmation_token")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    if (!reqs || reqs.length === 0) return [];
    const ids = reqs.map((r: { id: string }) => r.id);
    const [{ data: brc }, { data: creators }] = await Promise.all([
      supabaseAdmin
        .from("booking_request_creators")
        .select("request_id, creator_id, status, response_token")
        .in("request_id", ids),
      supabaseAdmin.from("creators").select("id, name"),
    ]);
    const cMap = new Map((creators ?? []).map((c: { id: string; name: string }) => [c.id, c.name]));
    const byReq = new Map<string, { creator_id: string; status: string; response_token: string }[]>();
    for (const r of brc ?? []) {
      const list = byReq.get(r.request_id as string) ?? [];
      list.push({ creator_id: r.creator_id as string, status: r.status as string, response_token: r.response_token as string });
      byReq.set(r.request_id as string, list);
    }

    return reqs.map((r: { id: string; status: string; event_date: string; event_type: string; venue: string; email: string; created_at: string; confirmation_token: string }) => {
      const list = byReq.get(r.id) ?? [];
      const pinged = list.filter((x) => x.status !== "conflict");
      return {
        id: r.id,
        status: r.status,
        event_date: r.event_date,
        event_type: r.event_type,
        venue: r.venue,
        email: r.email,
        created_at: r.created_at,
        confirmation_token: r.confirmation_token,
        pinged_count: pinged.length,
        accepted_count: list.filter((x) => x.status === "accepted" || x.status === "confirmed").length,
        declined_count: list.filter((x) => x.status === "declined").length,
        creator_links: pinged.map((x) => ({
          creator_id: x.creator_id,
          creator_name: cMap.get(x.creator_id) ?? x.creator_id,
          status: x.status,
          response_token: x.response_token,
        })),
      };
    });
  });
