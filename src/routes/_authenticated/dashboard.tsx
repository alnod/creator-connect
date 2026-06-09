import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Loader2, LogOut, Copy, ExternalLink, Check, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getMe,
  listMyAssignments,
  respondAsCreator,
  adminListFeed,
  adminListCreators,
  adminAssignCreatorEmail,
  adminUpdateRequestStatus,
} from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Cadence" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const meFn = useServerFn(getMe);
  const { data: me, isLoading } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!me) return null;

  const isAdmin = me.roles.includes("admin");
  const isCreator = me.roles.includes("creator") && !!me.creator;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="tag text-muted-foreground inline-flex items-center gap-2 hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Cadence
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {me.display_name ?? me.email}
              {isAdmin && <span className="ml-2 tag text-foreground">admin</span>}
              {isCreator && <span className="ml-2 tag text-foreground">creator</span>}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-10 py-10 space-y-12">
        {!isAdmin && !isCreator && (
          <div className="border border-border rounded-sm p-6">
            <h2 className="text-display text-xl mb-2">Account pending</h2>
            <p className="text-sm text-muted-foreground">
              Your account isn't linked to a creator profile yet. Ask the admin to assign your email
              <code className="mx-1 text-xs bg-secondary px-1 py-0.5 rounded">{me.email}</code>
              to your creator row.
            </p>
          </div>
        )}
        {isCreator && me.creator && <CreatorPanel creatorName={me.creator.name} />}
        {isAdmin && <AdminPanel />}
      </main>
    </div>
  );
}

function SignOutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <button
      onClick={async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
        navigate({ to: "/auth", replace: true });
      }}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" /> Sign out
    </button>
  );
}

function CreatorPanel({ creatorName }: { creatorName: string }) {
  const listFn = useServerFn(listMyAssignments);
  const respondFn = useServerFn(respondAsCreator);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: () => listFn(),
    refetchInterval: 15_000,
  });
  const respond = useMutation({
    mutationFn: (vars: { request_id: string; action: "accept" | "decline" }) => respondFn({ data: vars }),
    onSuccess: (_, vars) => {
      toast.success(vars.action === "accept" ? "Accepted." : "Declined.");
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed."),
  });

  return (
    <section>
      <h2 className="text-display text-2xl mb-1">Hi, {creatorName}</h2>
      <p className="text-sm text-muted-foreground mb-6">Booking requests sent your way.</p>
      {isLoading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      {data && data.length === 0 && (
        <div className="text-sm text-muted-foreground border border-border rounded-sm p-6">
          No requests yet. We'll ping you here as they come in.
        </div>
      )}
      <div className="space-y-3">
        {(data ?? []).map((a) => (
          <div key={a.request_id} className="border border-border rounded-sm p-5 flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-display text-lg">{a.event_type}</span>
                <StatusPill status={a.status} />
              </div>
              <div className="text-xs text-muted-foreground">
                {format(parseISO(a.event_date), "EEE, MMM d, yyyy")} · {a.hours}h · {a.venue}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">From {a.client_email}</div>
            </div>
            <div className="flex items-center gap-2">
              {a.status === "pending" && (
                <>
                  <button
                    onClick={() => respond.mutate({ request_id: a.request_id, action: "decline" })}
                    disabled={respond.isPending}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Decline
                  </button>
                  <button
                    onClick={() => respond.mutate({ request_id: a.request_id, action: "accept" })}
                    disabled={respond.isPending}
                    className="text-xs px-3 py-1.5 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                </>
              )}
              <a
                href={`/booking/${a.confirmation_token}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                Status <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminPanel() {
  const feedFn = useServerFn(adminListFeed);
  const creatorsFn = useServerFn(adminListCreators);
  const assignFn = useServerFn(adminAssignCreatorEmail);
  const updateStatusFn = useServerFn(adminUpdateRequestStatus);
  const qc = useQueryClient();
  const [tab, setTab] = useState<"requests" | "creators">("requests");

  const { data: feed, isLoading: feedLoading } = useQuery({
    queryKey: ["admin-feed-auth"],
    queryFn: () => feedFn(),
    refetchInterval: 10_000,
  });
  const { data: creators } = useQuery({
    queryKey: ["admin-creators"],
    queryFn: () => creatorsFn(),
    enabled: tab === "creators",
  });
  const assign = useMutation({
    mutationFn: (vars: { creator_id: string; email: string }) => assignFn({ data: vars }),
    onSuccess: (res) => {
      toast.success(res.linked ? "Linked to existing account." : "Invite sent.");
      qc.invalidateQueries({ queryKey: ["admin-creators"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed."),
  });
  const updateStatus = useMutation({
    mutationFn: (vars: { request_id: string; status: "completed" | "canceled" }) => updateStatusFn({ data: vars }),
    onSuccess: () => {
      toast.success("Updated.");
      qc.invalidateQueries({ queryKey: ["admin-feed-auth"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed."),
  });

  return (
    <section>
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-display text-2xl">Admin</h2>
          <p className="text-sm text-muted-foreground">Live booking feed · auto-refreshes every 10s</p>
        </div>
        <div className="flex gap-1 border border-border rounded-full p-1">
          {(["requests", "creators"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "requests" && (
        <>
          {feedLoading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
          {feed && feed.length === 0 && <div className="text-sm text-muted-foreground">No booking requests yet.</div>}
          <div className="space-y-4">
            {(feed ?? []).map((r) => (
              <div key={r.id} className="border border-border rounded-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-display text-lg">{r.event_type}</span>
                      <StatusPill status={r.status} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(r.event_date), "EEE, MMM d, yyyy")} · {r.venue} · {r.email}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {format(parseISO(r.created_at), "MMM d HH:mm")} · {r.pinged_count} pinged · {r.accepted_count} accepted · {r.declined_count} declined
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/booking/${r.confirmation_token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      Client view <ExternalLink className="w-3 h-3" />
                    </a>
                    {r.status !== "completed" && r.status !== "canceled" && (
                      <>
                        <button
                          onClick={() => updateStatus.mutate({ request_id: r.id, status: "completed" })}
                          className="text-[10px] px-2 py-1 rounded-full border border-border hover:bg-secondary"
                        >
                          Mark done
                        </button>
                        <button
                          onClick={() => updateStatus.mutate({ request_id: r.id, status: "canceled" })}
                          className="text-[10px] px-2 py-1 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {r.creator_links.map((cl) => (
                    <div key={cl.creator_id} className="text-xs bg-secondary/40 border border-border rounded-sm p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{cl.creator_name}</span>
                        <StatusPill status={cl.status} small />
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/respond/${cl.response_token}`);
                          toast.success("Magic link copied.");
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="w-3 h-3" /> Copy magic link
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "creators" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Assign an email to each creator. If the email is already a Cadence account, it links instantly; otherwise an invite is sent.
          </p>
          {(creators ?? []).map((c) => (
            <CreatorAssignRow key={c.id} row={c} onSubmit={(email) => assign.mutate({ creator_id: c.id, email })} pending={assign.isPending} />
          ))}
        </div>
      )}
    </section>
  );
}

function CreatorAssignRow({ row, onSubmit, pending }: { row: { id: string; name: string; craft: string; email: string | null; linked: boolean; linked_email: string | null }; onSubmit: (email: string) => void; pending: boolean }) {
  const [email, setEmail] = useState(row.email ?? "");
  return (
    <div className="border border-border rounded-sm p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <div className="text-display text-base">{row.name}</div>
        <div className="text-xs text-muted-foreground">{row.craft}</div>
        {row.linked && (
          <div className="text-[10px] text-foreground mt-1">Linked · {row.linked_email}</div>
        )}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (email) onSubmit(email); }}
        className="flex items-center gap-2"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="creator@email.com"
          className="bg-secondary/40 border border-border rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-foreground w-56"
        />
        <button
          type="submit"
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
        >
          {row.linked ? "Reassign" : "Assign"}
        </button>
      </form>
    </div>
  );
}

function StatusPill({ status, small }: { status: string; small?: boolean }) {
  const colors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    notified: "bg-muted text-muted-foreground",
    client_review: "bg-accent text-accent-foreground",
    accepted: "bg-foreground text-background",
    confirmed: "bg-foreground text-background",
    declined: "border border-border text-muted-foreground",
    conflict: "border border-border text-muted-foreground",
    canceled: "border border-destructive/40 text-destructive",
    completed: "border border-border text-muted-foreground",
  };
  const cls = colors[status] ?? colors.pending;
  return (
    <span className={`inline-block uppercase tracking-wider rounded-full ${cls} ${small ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
