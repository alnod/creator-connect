import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowUpRight, ShieldCheck, CalendarCheck, Lock, Stars, ArrowRight, Music, Mic, Disc3, Sparkles, Camera, Drama, Plus, Minus, Check, Send, Clock, MapPin, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { listCreatorsWithBusy, submitBookingRequest, type CreatorWithBusy } from "@/lib/booking.functions";
import heroImg from "@/assets/hero-performer.jpg";
import creator1 from "@/assets/creator-1.jpg";
import creator2 from "@/assets/creator-2.jpg";
import creator3 from "@/assets/creator-3.jpg";

const CREATOR_IMG: Record<string, string> = {
  "creator-1": creator1,
  "creator-2": creator2,
  "creator-3": creator3,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cadence — Book Nairobi's best corporate DJs & event MCs" },
      { name: "description", content: "Kenya's marketplace for booking corporate DJs and event MCs directly. Verified talent, live calendars, M-Pesa & card escrow, 7% flat fee. No agencies." },
      { property: "og:title", content: "Cadence — Nairobi's corporate event booking platform" },
      { property: "og:description", content: "Book vetted Nairobi DJs and MCs for your next company event. Escrow-backed. Agency-free." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <Marquee />
      <HowItWorks />
      <Categories />
      <Features />
      <Creators />
      <BookingWidget />
      <Trust />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-accent" />
          </div>
          <span className="text-display text-xl tracking-tight">Cadence</span>
        </a>
        <nav className="hidden md:flex items-center gap-10 tag text-foreground/70">
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#creators" className="hover:text-foreground transition">Creators</a>
          <a href="#book" className="hover:text-foreground transition">Book a date</a>
          <a href="#trust" className="hover:text-foreground transition">Trust</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="tag hidden sm:inline-block hover:text-foreground/60 transition">Sign in</button>
          <button className="bg-foreground text-background px-4 py-2 text-sm rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 lg:pt-44 lg:pb-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="tag text-muted-foreground mb-8 flex items-center gap-3"
          >
            <span className="w-8 h-px bg-foreground/30" />
            Nairobi · Corporate events
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-display text-[clamp(3rem,9vw,8.5rem)]"
          >
            Book Nairobi's best DJs &amp; MCs. <span className="italic text-accent">Without</span> the agency.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed"
          >
            Cadence is the marketplace where Nairobi companies book vetted DJs
            and MCs directly — for offsites, end-year parties, product launches,
            and conferences. Live calendars. M-Pesa &amp; card escrow. 7% flat fee.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button className="group bg-foreground text-background px-6 py-3.5 rounded-full inline-flex items-center gap-2 hover:bg-accent transition-colors">
              Book talent for your event
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            </button>
            <button className="px-6 py-3.5 rounded-full border border-foreground/20 hover:border-foreground transition-colors inline-flex items-center gap-2">
              I'm a DJ or MC
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <img src={heroImg} alt="Performing artist on stage" className="w-full h-full object-cover" width={1536} height={1920} />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute -left-6 lg:-left-16 bottom-10 bg-card border border-border p-5 rounded-md shadow-2xl shadow-foreground/10 max-w-[260px]"
          >
            <div className="tag text-accent mb-2">Booked · 2 min ago</div>
            <div className="text-display text-2xl">DJ Kymo</div>
            <div className="text-sm text-muted-foreground mt-1">End-year party · Safaricom · KSh 145,000</div>
            <div className="mt-3 flex items-center gap-1 text-xs text-foreground/70">
              <Stars className="w-3 h-3 fill-accent text-accent" />
              4.98 · 142 corporate events
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-20 lg:mt-32 grid grid-cols-2 md:grid-cols-4 gap-y-8 border-t border-border pt-10">
        {[
          ["0%", "Agency commission"],
          ["24hr", "Avg. quote turnaround"],
          ["180+", "Vetted Nairobi DJs & MCs"],
          ["KSh 95M", "Booked through escrow"],
        ].map(([n, l]) => (
          <div key={l}>
            <div className="text-display text-4xl lg:text-5xl">{n}</div>
            <div className="tag text-muted-foreground mt-2">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Marquee() {
  const words = ["Corporate DJs", "Event MCs", "Emcees", "Afrobeats DJs", "Conference MCs", "End-year parties", "Product launches", "Offsites", "Brand activations", "Happy hours"];
  const row = [...words, ...words];
  return (
    <section className="border-y border-border bg-secondary/40 py-6 overflow-hidden">
      <div className="flex marquee-track gap-12 whitespace-nowrap">
        {row.map((w, i) => (
          <div key={i} className="text-display text-3xl lg:text-4xl text-foreground/40 flex items-center gap-12">
            {w}
            <span className="w-2 h-2 rounded-full bg-accent" />
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Discover", d: "Browse vetted Nairobi DJs and MCs filtered by event type, date, vibe, and budget. Real corporate footage, real client references." },
    { n: "02", t: "Request", d: "Pick a date from a live calendar. Send your event brief. Get a firm quote within 24 hours — not a week of agency back-and-forth." },
    { n: "03", t: "Escrow", d: "Funds are held safely via M-Pesa or card until the event wraps. The talent is guaranteed payment. You're guaranteed they show up." },
    { n: "04", t: "Review", d: "Both sides rate after the event. Reputation is transparent, earned, and visible — replacing the agency's vetting." },
  ];
  return (
    <section id="how" className="py-24 lg:py-40 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="grid lg:grid-cols-12 gap-10 mb-20">
        <div className="lg:col-span-5">
          <div className="tag text-muted-foreground mb-4">§ How it works</div>
          <h2 className="text-display text-5xl lg:text-7xl">Four steps. <span className="italic">No middlemen.</span></h2>
        </div>
        <p className="lg:col-span-6 lg:col-start-7 text-lg text-muted-foreground self-end">
          A booking process designed for the people doing the work — and the people
          paying for it. Everything traditional agencies do, automated and unbundled.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="bg-background p-8 lg:p-10 lg:min-h-[320px] flex flex-col"
          >
            <div className="tag text-accent">{s.n}</div>
            <h3 className="text-display text-3xl mt-6">{s.t}</h3>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{s.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { Icon: ShieldCheck, t: "Hand-vetted talent", d: "Every DJ and host on Cadence is personally onboarded. ID verified, references checked, corporate footage reviewed." },
    { Icon: CalendarCheck, t: "Live calendars", d: "See real availability for every artist. Hold a date instantly, lock it with a deposit, get a confirmation in your inbox." },
    { Icon: Lock, t: "Escrow + invoicing", d: "Funds sit safely in Stripe escrow until the event ends. Finance teams get proper invoices, not Venmo screenshots." },
    { Icon: Stars, t: "Honest reviews", d: "Every booking generates a two-way review. Reputation is public, portable, and impossible to fake." },
  ];
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 bg-foreground text-background">
      <div className="max-w-[1400px] mx-auto">
        <div className="tag text-accent mb-6">§ Built-in trust</div>
        <h2 className="text-display text-5xl lg:text-7xl max-w-3xl">
          Everything an agency does. <span className="italic text-background/60">Built for Nairobi's corporate scene.</span>
        </h2>
        <div className="mt-20 grid md:grid-cols-2 gap-x-16 gap-y-16">
          {items.map(({ Icon, t, d }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex gap-6 items-start border-t border-background/15 pt-8"
            >
              <Icon className="w-7 h-7 text-accent shrink-0 mt-1" strokeWidth={1.25} />
              <div>
                <h3 className="text-display text-3xl">{t}</h3>
                <p className="mt-3 text-background/65 leading-relaxed">{d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Creators() {
  const list = [
    { img: creator1, name: "Nadia Wanjiku", craft: "Afrobeats DJ · Westlands", rate: "from KSh 80,000", rating: "4.99", events: 86 },
    { img: creator2, name: "Elena Achieng", craft: "DJ + Live Sax · Kilimani", rate: "from KSh 145,000", rating: "5.00", events: 214 },
    { img: creator3, name: "Theo Mwangi", craft: "Corporate Emcee · Bilingual EN/SW", rate: "from KSh 110,000", rating: "4.91", events: 67 },
  ];
  return (
    <section id="creators" className="py-24 lg:py-40 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-8 mb-16">
        <div>
          <div className="tag text-muted-foreground mb-4">§ Featured Nairobi talent</div>
          <h2 className="text-display text-5xl lg:text-7xl max-w-2xl">Talent that <span className="italic">books itself.</span></h2>
        </div>
        <a href="#" className="tag inline-flex items-center gap-2 hover:text-accent transition-colors">
          Browse all Nairobi talent <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
        {list.map((c, i) => (
          <motion.article
            key={c.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`group cursor-pointer ${i === 1 ? "md:mt-16" : ""}`}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-5">
              <img src={c.img} alt={c.name} loading="lazy" width={800} height={1000} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-2.5 py-1 tag rounded-full">
                ★ {c.rating}
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <h3 className="text-display text-2xl">{c.name}</h3>
              <div className="tag text-accent">{c.rate}</div>
            </div>
            <div className="flex justify-between mt-1 text-sm text-muted-foreground">
              <span>{c.craft}</span>
              <span>{c.events} events</span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function BookingWidget() {
  const fetchCreators = useServerFn(listCreatorsWithBusy);
  const submitFn = useServerFn(submitBookingRequest);

  const { data: creators = [], isLoading: loadingCreators } = useQuery({
    queryKey: ["creators-with-busy"],
    queryFn: () => fetchCreators(),
  });

  const eventTypes = ["End-year party", "Product launch", "Conference", "Brand activation", "Offsite", "Happy hour"];
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const busyByCreator = useMemo<Record<string, Date[]>>(
    () =>
      Object.fromEntries(
        creators.map((c: CreatorWithBusy) => [c.id, c.busy_dates.map((d) => parseISO(d))]),
      ),
    [creators],
  );

  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(addDays(today, 10));
  const [eventType, setEventType] = useState(eventTypes[0]);
  const [hours, setHours] = useState(4);
  const [venue, setVenue] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ pinged: string[]; conflicts: string[]; request_id: string; confirmation_token: string } | null>(null);

  // Default-select first 2 creators once data arrives
  useEffect(() => {
    if (selectedCreators.length === 0 && creators.length > 0) {
      setSelectedCreators(creators.slice(0, 2).map((c: CreatorWithBusy) => c.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creators.length]);

  const toggleCreator = (id: string) =>
    setSelectedCreators((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const conflicts = selectedCreators.filter((id) =>
    date ? (busyByCreator[id] ?? []).some((d) => isSameDay(d, date)) : false,
  );
  const available = selectedCreators.filter((id) => !conflicts.includes(id));

  const canSubmit =
    selectedCreators.length > 0 &&
    !!date &&
    email.includes("@") &&
    venue.trim().length >= 2 &&
    available.length > 0 &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !date) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitFn({
        data: {
          event_date: format(date, "yyyy-MM-dd"),
          event_type: eventType,
          hours,
          venue: venue.trim(),
          email: email.trim(),
          creator_ids: selectedCreators,
        },
      });
      if (!res.ok) {
        setSubmitError("All selected creators are booked on that date. Try another date.");
      } else {
        setResult({ pinged: res.pinged, conflicts: res.conflicts, request_id: res.request_id, confirmation_token: res.confirmation_token });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setSubmitError(null);
    setVenue("");
  };

  const submitted = result !== null;

  return (
    <section id="book" className="py-24 lg:py-40 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="grid lg:grid-cols-12 gap-10 mb-14">
        <div className="lg:col-span-6">
          <div className="tag text-muted-foreground mb-4">§ Book a date · Nairobi</div>
          <h2 className="text-display text-5xl lg:text-7xl">
            Pick a date. <span className="italic">We ping the right calendars.</span>
          </h2>
        </div>
        <p className="lg:col-span-5 lg:col-start-8 text-lg text-muted-foreground self-end">
          Select one or more vetted Nairobi creators, choose your event date, and
          send a brief in under 60 seconds. Requests land directly on each artist's
          calendar — no agents, no phone tag.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-px bg-border rounded-sm overflow-hidden border border-border">
        {/* Left: creator picker */}
        <div className="lg:col-span-4 bg-background p-6 lg:p-8">
          <div className="tag text-accent mb-4">01 · Choose talent</div>
          <div className="space-y-3">
            {loadingCreators && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading talent calendars…
              </div>
            )}
            {creators.map((c: CreatorWithBusy) => {
              const active = selectedCreators.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCreator(c.id)}
                  className={`w-full text-left flex items-center gap-4 p-3 rounded-sm border transition-colors ${
                    active ? "border-foreground bg-secondary/60" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <img src={CREATOR_IMG[c.image_key] ?? creator1} alt={c.name} className="w-14 h-14 object-cover rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-display text-lg leading-tight truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.craft} · {c.area}</div>
                    <div className="tag text-accent mt-1">from KSh {c.rate.toLocaleString()}</div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      active ? "bg-foreground border-foreground text-background" : "border-foreground/30"
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
          {date && conflicts.length > 0 && (
            <div className="mt-5 text-xs text-muted-foreground border-l-2 border-accent pl-3">
              {conflicts.length} of your picks {conflicts.length === 1 ? "is" : "are"} already booked on{" "}
              {format(date, "MMM d")}. We'll only ping the {available.length} available.
            </div>
          )}
        </div>

        {/* Middle: calendar */}
        <div className="lg:col-span-4 bg-background p-6 lg:p-8 flex flex-col">
          <div className="tag text-accent mb-4">02 · Pick a date</div>
          <div className="flex-1 flex items-center justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < today}
              modifiers={{
                busy: selectedCreators.flatMap((id) => busyByCreator[id] ?? []),
              }}
              modifiersClassNames={{
                busy: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-accent",
              }}
              className="pointer-events-auto"
            />
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> Has conflicts</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-foreground" /> Selected</span>
          </div>
        </div>

        {/* Right: brief + submit */}
        <div className="lg:col-span-4 bg-secondary/40 p-6 lg:p-8">
          <div className="tag text-accent mb-4">03 · Event brief</div>
          {submitted && result ? (
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center mb-5">
                <Check className="w-5 h-5" />
              </div>
              <div className="text-display text-2xl leading-tight">Request sent to {result.pinged.length} {result.pinged.length === 1 ? "calendar" : "calendars"}.</div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                We just pinged{" "}
                <span className="text-foreground">
                  {result.pinged
                    .map((id) => creators.find((c: CreatorWithBusy) => c.id === id)?.name)
                    .filter(Boolean)
                    .join(", ")}
                </span>{" "}
                for {eventType.toLowerCase()} on{" "}
                <span className="text-foreground">{date && format(date, "EEE, MMM d, yyyy")}</span> ({hours}h
                {venue ? `, ${venue}` : ""}). Expect firm quotes at <span className="text-foreground">{email}</span>{" "}
                within 24 hours. Ref{" "}
                <span className="text-foreground font-mono text-xs">#{result.request_id.slice(0, 8)}</span>.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-px bg-border rounded-sm overflow-hidden border border-border text-xs">
                {result.pinged.map((id) => {
                  const c = creators.find((x: CreatorWithBusy) => x.id === id);
                  if (!c) return null;
                  return (
                    <div key={id} className="bg-background p-3">
                      <div className="text-display text-sm truncate">{c.name}</div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Pinged</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-auto flex flex-wrap gap-3 items-center pt-8">
                <a
                  href={`/booking/${result.confirmation_token}`}
                  className="bg-foreground text-background px-4 py-2 text-xs rounded-full hover:bg-accent hover:text-accent-foreground transition-colors inline-flex items-center gap-2"
                >
                  Track status <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={reset}
                  className="tag inline-flex items-center gap-2 hover:text-accent transition-colors"
                >
                  Send another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="tag text-muted-foreground">Event type</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {eventTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEventType(t)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        eventType === t
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="tag text-muted-foreground">Hours</label>
                  <div className="mt-2 flex items-center border border-border rounded-sm">
                    <button type="button" onClick={() => setHours((h) => Math.max(1, h - 1))} className="px-3 py-2 hover:bg-secondary">
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="flex-1 text-center text-sm">{hours}h</div>
                    <button type="button" onClick={() => setHours((h) => Math.min(12, h + 1))} className="px-3 py-2 hover:bg-secondary">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="tag text-muted-foreground">Date</label>
                  <div className="mt-2 px-3 py-2 border border-border rounded-sm text-sm bg-background">
                    {date ? format(date, "MMM d, yyyy") : "Pick a date"}
                  </div>
                </div>
              </div>

              <div>
                <label className="tag text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</label>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Sarit Expo Centre, Westlands"
                  className="mt-2 w-full px-3 py-2 border border-border rounded-sm text-sm bg-background focus:border-foreground outline-none"
                />
              </div>

              <div>
                <label className="tag text-muted-foreground">Your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.co.ke"
                  className="mt-2 w-full px-3 py-2 border border-border rounded-sm text-sm bg-background focus:border-foreground outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-2 group bg-foreground text-background px-5 py-3 rounded-full inline-flex items-center justify-center gap-2 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting
                  ? "Sending…"
                  : `Send request to ${available.length || selectedCreators.length} ${
                      (available.length || selectedCreators.length) === 1 ? "calendar" : "calendars"
                    }`}
              </button>
              {submitError && (
                <p className="text-xs text-destructive">{submitError}</p>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">
                No charge yet. Funds only move to escrow once you confirm a quote.
                Cadence takes a flat 7% — no agency markup.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section id="trust" className="py-24 lg:py-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="grid lg:grid-cols-12 gap-12 items-center bg-secondary/60 rounded-sm p-10 lg:p-20 border border-border">
        <div className="lg:col-span-7">
          <div className="tag text-accent mb-4">§ The escrow promise</div>
          <h2 className="text-display text-4xl lg:text-6xl">
            Money waits in the wings. <br />
            <span className="italic">Released on the encore.</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-xl leading-relaxed">
            You deposit. Cadence holds. The DJ plays. Funds release within 24
            hours of event end. Disputes are reviewed by humans, not algorithms.
            Finance gets a real tax invoice — not an M-Pesa screenshot.
          </p>
        </div>
        <div className="lg:col-span-5 space-y-3 font-mono text-sm">
          {[
            ["BOOKING #NBO-2841", "CONFIRMED"],
            ["EVENT", "END-YEAR PARTY · SAFARICOM"],
            ["DEPOSIT (25%)", "KSh 36,250 · HELD"],
            ["EVENT DATE", "DEC 12 · 7:00 PM"],
            ["BALANCE", "KSh 108,750 · ESCROW"],
            ["RELEASE", "T + 24H AUTO"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border/60 pb-3">
              <span className="text-muted-foreground">{k}</span>
              <span className="text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-32 lg:py-48 px-6 lg:px-10 text-center max-w-5xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-display text-6xl lg:text-9xl"
      >
        The stage is <span className="italic text-accent">set.</span>
      </motion.h2>
      <p className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto">
        Whether you're throwing the party or playing it — join the Nairobi marketplace re-tuning corporate entertainment.
      </p>
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <button className="bg-foreground text-background px-8 py-4 rounded-full inline-flex items-center gap-2 hover:bg-accent transition-colors">
          Book talent for my event
          <ArrowUpRight className="w-4 h-4" />
        </button>
        <button className="bg-secondary text-foreground px-8 py-4 rounded-full inline-flex items-center gap-2 border border-border hover:border-foreground transition-colors">
          Apply as Nairobi talent
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-6 lg:px-10 py-10">
      <div className="max-w-[1400px] mx-auto flex flex-wrap justify-between items-center gap-6 tag text-muted-foreground">
        <div>© 2026 Cadence — Nairobi's corporate event marketplace.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-foreground transition">Terms</a>
          <a href="#" className="hover:text-foreground transition">Privacy</a>
          <a href="#" className="hover:text-foreground transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Categories() {
  const cats = [
    { Icon: Disc3, name: "Afrobeats DJs", count: "84" },
    { Icon: Mic, name: "Corporate Emcees", count: "42" },
    { Icon: Sparkles, name: "Conference MCs", count: "31" },
    { Icon: Music, name: "DJ + Live Sax", count: "18" },
    { Icon: Drama, name: "Brand Activation Hosts", count: "26" },
    { Icon: Camera, name: "Hybrid / Livestream DJs", count: "22" },
  ];
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-14">
        <div>
          <div className="tag text-muted-foreground mb-4">§ Browse Nairobi</div>
          <h2 className="text-display text-5xl lg:text-7xl">Every kind of <span className="italic">corporate event.</span></h2>
        </div>
        <p className="max-w-md text-muted-foreground">From end-year parties at Villa Rosa Kempinski to product launches at Sarit Expo, all-hands at Radisson Blu to brand activations in Westlands — find the right talent for the room.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border border border-border">
        {cats.map(({ Icon, name, count }, i) => (
          <motion.a
            href="#"
            key={name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group bg-background p-8 lg:p-10 hover:bg-secondary/60 transition-colors flex flex-col gap-8 min-h-[200px] justify-between"
          >
            <Icon className="w-8 h-8 text-accent" strokeWidth={1.25} />
            <div className="flex items-end justify-between">
              <div>
                <div className="text-display text-2xl lg:text-3xl">{name}</div>
                <div className="tag text-muted-foreground mt-2">{count} in Nairobi</div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-foreground/40 group-hover:text-accent group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="tag text-muted-foreground mb-4">§ Pricing</div>
          <h2 className="text-display text-5xl lg:text-7xl">A fee that <span className="italic">respects</span> the craft.</h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-md leading-relaxed">
            Agencies take 15–25%. We take 7%. That's it. No listing fees, no
            subscriptions, no surprise charges on either side of the booking.
          </p>
        </div>
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
          <div className="bg-secondary/40 border border-border p-8 rounded-sm flex flex-col">
            <div className="tag text-muted-foreground">For creators</div>
            <div className="text-display text-7xl mt-6">5%</div>
            <div className="tag text-foreground/60 mt-2">Per completed booking</div>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground flex-1">
              <li className="flex gap-2"><span className="text-accent">→</span> Free profile & portfolio hosting</li>
              <li className="flex gap-2"><span className="text-accent">→</span> Verified badge & performance stats</li>
              <li className="flex gap-2"><span className="text-accent">→</span> Calendar sync, no double-booking</li>
              <li className="flex gap-2"><span className="text-accent">→</span> Guaranteed payouts via escrow</li>
            </ul>
          </div>
          <div className="bg-foreground text-background p-8 rounded-sm flex flex-col relative">
            <div className="absolute top-4 right-4 tag text-accent">Most use this</div>
            <div className="tag text-background/60">For clients</div>
            <div className="text-display text-7xl mt-6">2%</div>
            <div className="tag text-background/60 mt-2">Service fee at checkout</div>
            <ul className="mt-8 space-y-3 text-sm text-background/70 flex-1">
              <li className="flex gap-2"><span className="text-accent">→</span> Unlimited browsing & quotes</li>
              <li className="flex gap-2"><span className="text-accent">→</span> Funds held in escrow until showtime</li>
              <li className="flex gap-2"><span className="text-accent">→</span> Replacement guarantee if cancelled</li>
              <li className="flex gap-2"><span className="text-accent">→</span> Real human dispute support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { q: "Used to spend two weeks chasing agencies for quotes for our end-year party. Booked through Cadence in 90 minutes. Finance loved the tax invoice and the escrow.", n: "Priya N.", r: "Head of People · Nairobi SaaS co." },
    { q: "I was paying 22% to an agency for corporate gigs. Switched to Cadence and that money goes back into my rig. My calendar's been booked solid since Q2.", n: "DJ Kymo", r: "Afrobeats DJ · Westlands" },
    { q: "Hosted our product launch at Sarit. The vetting is real — every DJ on this platform actually plays corporate, not just clubs. Huge difference.", n: "Jordan R.", r: "Brand Marketing · Safaricom" },
  ];
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 bg-secondary/40 border-y border-border">
      <div className="max-w-[1400px] mx-auto">
        <div className="tag text-muted-foreground mb-4">§ Voices</div>
        <h2 className="text-display text-5xl lg:text-7xl max-w-3xl mb-16">From both sides of the <span className="italic">stage.</span></h2>
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {quotes.map((q, i) => (
            <motion.figure
              key={q.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-background p-10 flex flex-col justify-between min-h-[320px]"
            >
              <blockquote className="text-display text-2xl lg:text-3xl leading-snug">"{q.q}"</blockquote>
              <figcaption className="mt-8">
                <div className="text-foreground font-medium">{q.n}</div>
                <div className="tag text-muted-foreground mt-1">{q.r}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Why only Nairobi? Why only corporate events?", a: "We're going deep before going wide. By focusing on Nairobi's corporate scene first, we can personally vet every DJ and MC on the platform and guarantee the quality. Mombasa, Kisumu, and other event types are next." },
    { q: "How is Cadence different from a booking agency?", a: "Agencies take 15–25% and gate-keep introductions. We're a self-serve marketplace: talent sets their own rates, you book directly, and we take 7% total to keep the lights on and run escrow." },
    { q: "How does escrow protect both sides?", a: "You pay via M-Pesa or card when booking; funds are held by our payment partner. The talent is guaranteed payment if they perform, and you're guaranteed a replacement or refund if they no-show." },
    { q: "What if something goes wrong at the event?", a: "Either side can open a dispute within 7 days. A real human on our trust team reviews evidence and decides. Most disputes are resolved within 48 hours." },
    { q: "How do you vet the DJs and MCs?", a: "National ID, performance footage review, references from at least two past corporate clients, and a 1:1 onboarding call. Roughly 1 in 4 applicants makes it onto the platform." },
    { q: "When does the talent get paid?", a: "Funds release automatically 24 hours after the event end-time, assuming no dispute. Payouts land in their M-Pesa or bank within 1–2 business days." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 lg:py-40 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <div className="tag text-muted-foreground mb-4">§ FAQ</div>
          <h2 className="text-display text-5xl lg:text-6xl">Questions, <span className="italic">answered.</span></h2>
        </div>
        <div className="lg:col-span-8">
          {items.map((it, i) => (
            <div key={i} className="border-t border-border last:border-b">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left group"
              >
                <span className="text-display text-2xl lg:text-3xl pr-6 group-hover:text-accent transition-colors">{it.q}</span>
                {open === i ? <Minus className="w-5 h-5 shrink-0 text-accent" /> : <Plus className="w-5 h-5 shrink-0" />}
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="pb-6 text-muted-foreground max-w-2xl leading-relaxed">{it.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
