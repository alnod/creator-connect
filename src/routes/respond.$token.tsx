import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Check, X, Loader2, AlertCircle, ArrowLeft, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { getResponseContext, respondToRequest } from "@/lib/booking.functions";

export const Route = createFileRoute("/respond/$token")({
  head: () => ({ meta: [{ title: "Respond to booking — Cadence" }, { name: "robots", content: "noindex" }] }),
  component: RespondPage,
  errorComponent: () => <Error message="Something went wrong loading this request." />,
  notFoundComponent: () => <Error message="Link not found." />,
});

function Error({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background text-foreground">
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

function RespondPage() {
  const { token } = Route.useParams();
  const router = useRouter();
  const fetchFn = useServerFn(getResponseContext);
  const respondFn = useServerFn(respondToRequest);
  const { data, isLoading } = useQuery({
    queryKey: ["respond", token],
    queryFn: () => fetchFn({ data: { token } }),
  });
  const mut = useMutation({
    mutationFn: (action: "accept" | "decline") => respondFn({ data: { token, action } }),
    onSuccess: () => router.invalidate(),
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }
  if (!data) return <Error message="This response link is invalid or expired." />;

  const eventDate = parseISO(data.request.event_date);
  const alreadyResponded = data.current_status !== "pending";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 lg:px-10 py-16">
        <a href="/" className="tag text-muted-foreground inline-flex items-center gap-2 hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Cadence
        </a>
        <div className="tag text-accent mb-3">Hi {data.creator_name.split(" ")[0]} —</div>
        <h1 className="text-display text-4xl lg:text-5xl mb-6 leading-tight">
          New booking request for <span className="italic">{format(eventDate, "EEE, MMM d")}</span>.
        </h1>

        <div className="border border-border rounded-sm p-6 mb-8 space-y-3">
          <div className="text-display text-2xl">{data.request.event_type}</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {format(eventDate, "EEEE, MMM d, yyyy")}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {data.request.hours}h</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {data.request.venue}</span>
          </div>
        </div>

        {alreadyResponded || mut.isSuccess ? (
          <div className="border border-foreground rounded-sm p-6 bg-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              {(mut.data?.status ?? data.current_status) === "accepted" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              <div className="text-display text-xl">
                You {mut.data?.status ?? data.current_status} this request.
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {(mut.data?.status ?? data.current_status) === "accepted"
                ? "The client has been notified and will pick a creator shortly. Hold the date until you hear back."
                : "Thanks for the heads-up. We'll route this to other available creators."}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-sm p-6">
            <div className="text-display text-xl mb-2">Are you available?</div>
            <p className="text-sm text-muted-foreground mb-6">
              Accept to put yourself in the running — the client picks the final creator. Decline if the date doesn't work.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => mut.mutate("accept")}
                disabled={mut.isPending}
                className="bg-foreground text-background px-6 py-2.5 text-sm rounded-full hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> {mut.isPending && mut.variables === "accept" ? "Sending…" : "Accept"}
              </button>
              <button
                onClick={() => mut.mutate("decline")}
                disabled={mut.isPending}
                className="px-6 py-2.5 text-sm rounded-full border border-border hover:border-foreground/60 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" /> {mut.isPending && mut.variables === "decline" ? "Sending…" : "Decline"}
              </button>
            </div>
            {mut.isError && <div className="text-xs text-destructive mt-4">{(mut.error as Error).message}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
