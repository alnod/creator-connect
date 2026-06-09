import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Me = {
  user_id: string;
  email: string;
  display_name: string | null;
  roles: ("admin" | "creator")[];
  creator: { id: string; name: string } | null;
};

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Me> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const [{ data: profile }, { data: roleRows }, { data: creator }] = await Promise.all([
      supabaseAdmin.from("profiles").select("email, display_name").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
      supabaseAdmin.from("creators").select("id, name").eq("auth_user_id", userId).maybeSingle(),
    ]);
    return {
      user_id: userId,
      email: profile?.email ?? (context.claims.email as string) ?? "",
      display_name: profile?.display_name ?? null,
      roles: (roleRows ?? []).map((r: { role: "admin" | "creator" }) => r.role),
      creator: creator ? { id: creator.id as string, name: creator.name as string } : null,
    };
  });

async function requireRole(userId: string, role: "admin" | "creator"): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();
  if (!data) throw new Error("Forbidden.");
}

// ----- Creator dashboard -----

export type MyAssignment = {
  request_id: string;
  confirmation_token: string;
  response_token: string;
  status: string; // brc status
  request_status: string;
  event_date: string;
  event_type: string;
  hours: number;
  venue: string;
  client_email: string;
  created_at: string;
};

export const listMyAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyAssignment[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: creator } = await supabaseAdmin
      .from("creators")
      .select("id")
      .eq("auth_user_id", context.userId)
      .maybeSingle();
    if (!creator) return [];
    const { data: brc, error } = await supabaseAdmin
      .from("booking_request_creators")
      .select("request_id, status, response_token")
      .eq("creator_id", creator.id as string);
    if (error) throw new Error(error.message);
    if (!brc || brc.length === 0) return [];
    const reqIds = brc.map((r: { request_id: string }) => r.request_id);
    const { data: reqs } = await supabaseAdmin
      .from("booking_requests")
      .select("id, status, event_date, event_type, hours, venue, email, created_at, confirmation_token")
      .in("id", reqIds)
      .order("created_at", { ascending: false });
    const reqMap = new Map((reqs ?? []).map((r: { id: string }) => [r.id, r]));
    return brc.flatMap((b: { request_id: string; status: string; response_token: string }) => {
      const r = reqMap.get(b.request_id) as
        | { status: string; event_date: string; event_type: string; hours: number; venue: string; email: string; created_at: string; confirmation_token: string }
        | undefined;
      if (!r) return [];
      return [{
        request_id: b.request_id,
        confirmation_token: r.confirmation_token,
        response_token: b.response_token,
        status: b.status,
        request_status: r.status,
        event_date: r.event_date,
        event_type: r.event_type,
        hours: r.hours,
        venue: r.venue,
        client_email: r.email,
        created_at: r.created_at,
      }];
    });
  });

export const respondAsCreator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      request_id: z.string().uuid(),
      action: z.enum(["accept", "decline"]),
    }).parse(data),
  )
  .handler(async ({ data, context }): Promise<{ ok: true; status: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: creator } = await supabaseAdmin
      .from("creators")
      .select("id")
      .eq("auth_user_id", context.userId)
      .maybeSingle();
    if (!creator) throw new Error("No creator profile linked to this account.");

    const { data: row } = await supabaseAdmin
      .from("booking_request_creators")
      .select("status")
      .eq("request_id", data.request_id)
      .eq("creator_id", creator.id as string)
      .maybeSingle();
    if (!row) throw new Error("Assignment not found.");
    if (row.status !== "pending") throw new Error(`Already responded (${row.status}).`);

    const newStatus = data.action === "accept" ? "accepted" : "declined";
    await supabaseAdmin
      .from("booking_request_creators")
      .update({ status: newStatus, responded_at: new Date().toISOString() })
      .eq("request_id", data.request_id)
      .eq("creator_id", creator.id as string);

    if (newStatus === "accepted") {
      const { data: reqRow } = await supabaseAdmin
        .from("booking_requests")
        .select("status")
        .eq("id", data.request_id)
        .single();
      if (reqRow && reqRow.status === "notified") {
        await supabaseAdmin.from("booking_requests").update({ status: "client_review" }).eq("id", data.request_id);
        await supabaseAdmin.from("booking_status_events").insert({
          request_id: data.request_id,
          event: "client_review",
          actor: creator.id as string,
          meta: { trigger: "first_acceptance", via: "dashboard" },
        });
      }
    }
    await supabaseAdmin.from("booking_status_events").insert({
      request_id: data.request_id,
      event: `creator_${newStatus}`,
      actor: creator.id as string,
      meta: { via: "dashboard" },
    });
    return { ok: true, status: newStatus };
  });

// ----- Admin dashboard -----

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

export const adminListFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminFeedItem[]> => {
    await requireRole(context.userId, "admin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reqs, error } = await supabaseAdmin
      .from("booking_requests")
      .select("id, status, event_date, event_type, venue, email, created_at, confirmation_token")
      .order("created_at", { ascending: false })
      .limit(100);
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

export type CreatorLinkRow = {
  id: string;
  name: string;
  craft: string;
  email: string | null;
  linked: boolean;
  linked_email: string | null;
};

export const adminListCreators = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CreatorLinkRow[]> => {
    await requireRole(context.userId, "admin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: creators } = await supabaseAdmin
      .from("creators")
      .select("id, name, craft, email, auth_user_id")
      .order("sort_order", { ascending: true });
    if (!creators) return [];
    const linkedIds = (creators as { auth_user_id: string | null }[])
      .map((c) => c.auth_user_id)
      .filter((x): x is string => !!x);
    let emailMap = new Map<string, string>();
    if (linkedIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .in("id", linkedIds);
      emailMap = new Map((profiles ?? []).map((p: { id: string; email: string }) => [p.id, p.email]));
    }
    return (creators as { id: string; name: string; craft: string; email: string | null; auth_user_id: string | null }[]).map((c) => ({
      id: c.id,
      name: c.name,
      craft: c.craft,
      email: c.email,
      linked: !!c.auth_user_id,
      linked_email: c.auth_user_id ? emailMap.get(c.auth_user_id) ?? null : null,
    }));
  });

export const adminAssignCreatorEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      creator_id: z.string().min(1).max(64),
      email: z.string().email().max(254),
    }).parse(data),
  )
  .handler(async ({ data, context }): Promise<{ ok: true; invited: boolean; linked: boolean }> => {
    await requireRole(context.userId, "admin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    // Update creator's email
    const { error: uErr } = await supabaseAdmin
      .from("creators")
      .update({ email })
      .eq("id", data.creator_id);
    if (uErr) throw new Error(uErr.message);

    // Try to find an existing auth user with this email; if present, link immediately
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("creators").update({ auth_user_id: existing.id as string }).eq("id", data.creator_id);
      await supabaseAdmin.from("user_roles").insert({ user_id: existing.id as string, role: "creator" }).select();
      return { ok: true, invited: false, linked: true };
    }

    // Otherwise send an invite (creates auth user; trigger will auto-link on signup-completion)
    const { error: invErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    if (invErr) throw new Error(invErr.message);
    return { ok: true, invited: true, linked: false };
  });

export const adminUpdateRequestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      request_id: z.string().uuid(),
      status: z.enum(["completed", "canceled"]),
    }).parse(data),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireRole(context.userId, "admin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("booking_requests").update({ status: data.status }).eq("id", data.request_id);
    await supabaseAdmin.from("booking_status_events").insert({
      request_id: data.request_id,
      event: data.status,
      actor: "admin",
      meta: {},
    });
    return { ok: true };
  });
