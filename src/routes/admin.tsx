import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Loader2, ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { listAdminFeed } from "@/lib/booking.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Cadence" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [key, setKey] = useState("");
  const [submittedKey, setSubmittedKey] = useState<string | null>(null);
  const fetchFn = useServerFn(listAdminFeed);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-feed", submittedKey],
    queryFn: () => fetchFn({ data: { key: submittedKey! } }),
    enabled: !!submittedKey,
    refetchInterval: 10_000,
  });

  if (!submittedKey) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <form
          onSubmit={(e) => { e.preventDefault(); if (key.trim()) setSubmittedKey(key.trim()); }}
          className="max-w-sm w-full space-y-4"
        >
          <a href="/" className="tag text-muted-foreground inline-flex items-center gap-2 hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Cadence
          </a>
          <h1 className="text-display text-3xl">Admin access</h1>
          <p className="text-sm text-muted-foreground">
            Enter the admin dashboard key. (Set <code className="text-xs bg-secondary px-1 py-0.5 rounded">ADMIN_DASHBOARD_KEY</code> in project secrets.)
          </p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin key"
            className="w-full bg-secondary/40 border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
          <button type="submit" className="bg-foreground text-background px-4 py-2 text-sm rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
            Open dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        <a href="/" className="tag text-muted-foreground inline-flex items-center gap-2 hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Cadence
        </a>
        <h1 className="text-display text-4xl mb-2">Booking requests</h1>
        <p className="text-sm text-muted-foreground mb-10">Live feed · auto-refreshes every 10s</p>

        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
        {error && (
          <div className="border border-destructive/40 rounded-sm p-4 text-sm text-destructive">
            {(error as Error).message}
          </div>
        )}
        {data && data.length === 0 && (
          <div className="text-sm text-muted-foreground">No booking requests yet.</div>
        )}

        <div className="space-y-4">
          {(data ?? []).map((r) => (
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
                    Submitted {format(parseISO(r.created_at), "MMM d HH:mm")} · #{r.id.slice(0, 8)}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground shrink-0">
                  <div>{r.pinged_count} pinged · {r.accepted_count} accepted · {r.declined_count} declined</div>
                  <a
                    href={`/booking/${r.confirmation_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1 hover:text-foreground"
                  >
                    Client view <ExternalLink className="w-3 h-3" />
                  </a>
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
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/respond/${cl.response_token}`)}
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
      </div>
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
