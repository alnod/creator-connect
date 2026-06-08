import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Check, X, Clock, Calendar as CalendarIcon, MapPin, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { getRequestByToken, confirmBooking, cancelBooking } from "@/lib/booking.functions";

export const Route = createFileRoute("/booking/$token")({
  head: () => ({ meta: [{ title: "Booking status — Cadence" }, { name: "robots", content: "noindex" }] }),
  component: BookingStatusPage,
  errorComponent: () => <ErrorState message="Something went wrong loading this booking." />,
  notFoundComponent: () => <ErrorState message="Booking not found." />,
});

const STAGES = ["pending", "notified", "client_review", "confirmed", "completed"] as const;
const STAGE_LABELS: Record<string, string> = {
  pending: "Pending",
  notified: "Creators notified",
  client_review: "Awaiting your choice",
  confirmed: "Confirmed",
  completed: "Completed",
  canceled: "Canceled",
};

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-display text-3xl mb-3">{message}</h1>
        <a href="/" className="tag inline-flex items-center gap-2 hover:text-accent transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </a>
      </div>
    </div>
  );
}

function BookingStatusPage() {
  const { token } = Route.useParams();
  const router = useRouter();
  const fetchFn = useServerFn(getRequestByToken);
  const confirmFn = useServerFn(confirmBooking);
  const cancelFn = useServerFn(cancelBooking);

  const { data, isLoading, error } = useQuery({
    queryKey: ["booking", token],
    queryFn: () => fetchFn({ data: { token } }),
    refetchInterval: 15_000,
  });

  const [pickedCreator, setPickedCreator] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const confirmMut = useMutation({
    mutationFn: (creator_id: string) => confirmFn({ data: { token, creator_id } }),
    onSuccess: () => router.invalidate(),
    onError: (e: Error) => setActionError(e.message),
  });
  const cancelMut = useMutation({
    mutationFn: () => cancelFn({ data: { token } }),
    onSuccess: () => router.invalidate(),
    onError: (e: Error) => setActionError(e.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !data) return <ErrorState message="Booking not found." />;

  const eventDate = parseISO(data.event_date);
  const accepted = data.creators.filter((c) => c.status === "accepted" || c.status === "confirmed");
  const declined = data.creators.filter((c) => c.status === "declined");
  const waiting = data.creators.filter((c) => c.status === "pending");
  const canConfirm = data.status === "client_review" && accepted.length > 0;
  const isFinal = data.status === "confirmed" || data.status === "canceled" || data.status === "completed";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16">
        <a href="/" className="tag text-muted-foreground inline-flex items-center gap-2 hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Cadence
        </a>

        <div className="tag text-accent mb-3">Booking #{data.id.slice(0, 8)}</div>
        <h1 className="text-display text-4xl lg:text-5xl mb-4 leading-tight">
          {data.event_type} · <span className="italic text-muted-foreground">{format(eventDate, "EEE, MMM d")}</span>
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-10">
          <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {format(eventDate, "MMM d, yyyy")}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {data.hours}h</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {data.venue}</span>
        </div>

        {/* Status timeline */}
        <div className="border border-border rounded-sm p-6 mb-8">
          <div className="tag text-muted-foreground mb-5">Status</div>
          {data.status === "canceled" ? (
            <div className="flex items-center gap-3 text-destructive">
              <X className="w-4 h-4" /> <span className="text-display text-lg">Canceled</span>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {STAGES.map((s, i) => {
                const idx = STAGES.indexOf(data.status as typeof STAGES[number]);
                const reached = idx >= 0 && i <= idx;
                const current = idx === i;
                return (
                  <div key={s} className="flex flex-col items-start gap-2">
                    <div className={`h-1 w-full rounded-full ${reached ? "bg-foreground" : "bg-border"}`} />
                    <div className={`text-xs ${current ? "text-foreground font-medium" : reached ? "text-foreground/70" : "text-muted-foreground"}`}>
                      {STAGE_LABELS[s]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Creators */}
        <div className="mb-8">
          <div className="tag text-muted-foreground mb-4">Pinged creators</div>
          <div className="space-y-3">
            {data.creators.filter((c) => c.status !== "conflict").map((c) => {
              const isChosen = data.chosen_creator_id === c.creator_id;
              const isPicked = pickedCreator === c.creator_id;
              const isAccepted = c.status === "accepted" || c.status === "confirmed";
              return (
                <button
                  key={c.creator_id}
                  type="button"
                  disabled={!canConfirm || !isAccepted}
                  onClick={() => setPickedCreator(c.creator_id)}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-sm border transition-colors ${
                    isChosen ? "border-foreground bg-secondary/60" :
                    isPicked ? "border-foreground" :
                    isAccepted && canConfirm ? "border-border hover:border-foreground/50 cursor-pointer" :
                    "border-border opacity-80 cursor-default"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-display text-lg leading-tight">{c.creator_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.craft} · {c.area}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={c.status} />
                    {c.responded_at && (
                      <div className="text-[10px] text-muted-foreground mt-1">{format(parseISO(c.responded_at), "MMM d, HH:mm")}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {declined.length > 0 && data.status !== "confirmed" && (
            <div className="mt-3 text-xs text-muted-foreground">
              {declined.length} {declined.length === 1 ? "creator" : "creators"} declined. {waiting.length > 0 && `${waiting.length} still deciding.`}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isFinal && (
          <div className="border border-border rounded-sm p-6 bg-secondary/30">
            {canConfirm ? (
              <>
                <div className="text-display text-xl mb-2">Confirm your booking</div>
                <p className="text-sm text-muted-foreground mb-5">
                  Pick one of the creators who accepted. Their calendar locks the moment you confirm — no double-bookings possible.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => pickedCreator && confirmMut.mutate(pickedCreator)}
                    disabled={!pickedCreator || confirmMut.isPending}
                    className="bg-foreground text-background px-5 py-2.5 text-sm rounded-full hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                  >
                    {confirmMut.isPending ? "Confirming…" : pickedCreator ? `Confirm ${accepted.find((a) => a.creator_id === pickedCreator)?.creator_name}` : "Pick a creator above"}
                  </button>
                  <button
                    onClick={() => cancelMut.mutate()}
                    disabled={cancelMut.isPending}
                    className="px-5 py-2.5 text-sm rounded-full border border-border hover:border-foreground/60 transition-colors disabled:opacity-50"
                  >
                    Cancel request
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-display text-xl mb-2">Waiting on creator responses</div>
                <p className="text-sm text-muted-foreground mb-5">
                  We'll bump the status here as each creator accepts or declines. This page refreshes automatically.
                </p>
                <button
                  onClick={() => cancelMut.mutate()}
                  disabled={cancelMut.isPending}
                  className="px-5 py-2.5 text-sm rounded-full border border-border hover:border-foreground/60 transition-colors disabled:opacity-50"
                >
                  Cancel request
                </button>
              </>
            )}
            {actionError && <div className="text-xs text-destructive mt-3">{actionError}</div>}
          </div>
        )}

        {data.status === "confirmed" && (
          <div className="border border-foreground rounded-sm p-6 bg-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5" />
              <div className="text-display text-xl">Booked.</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Confirmation went out to {data.email}. The chosen creator's calendar has been locked for {format(eventDate, "MMM d")}.
            </p>
          </div>
        )}

        {/* Timeline events */}
        {data.events.length > 0 && (
          <div className="mt-12">
            <div className="tag text-muted-foreground mb-4">Activity</div>
            <div className="space-y-2 text-xs">
              {[...data.events].reverse().map((e, i) => (
                <div key={i} className="flex items-baseline gap-3">
                  <span className="text-muted-foreground tabular-nums">{format(parseISO(e.created_at), "MMM d, HH:mm")}</span>
                  <span>{eventLabel(e.event)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function eventLabel(e: string): string {
  if (e === "notified") return "Request sent to selected creators";
  if (e === "client_review") return "First creator accepted — awaiting your confirmation";
  if (e === "creator_accepted") return "Creator accepted";
  if (e === "creator_declined") return "Creator declined";
  if (e === "confirmed") return "Booking confirmed";
  if (e === "canceled") return "Booking canceled";
  return e;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Waiting", cls: "bg-muted text-muted-foreground" },
    accepted: { label: "Accepted", cls: "bg-foreground text-background" },
    confirmed: { label: "Booked", cls: "bg-foreground text-background" },
    declined: { label: "Declined", cls: "border border-border text-muted-foreground" },
    conflict: { label: "Conflict", cls: "border border-border text-muted-foreground" },
  };
  const m = map[status] ?? map.pending;
  return <span className={`inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${m.cls}`}>{m.label}</span>;
}
