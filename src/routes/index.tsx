import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, ShieldCheck, CalendarCheck, Lock, Stars, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-performer.jpg";
import creator1 from "@/assets/creator-1.jpg";
import creator2 from "@/assets/creator-2.jpg";
import creator3 from "@/assets/creator-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cadence — Book artists directly. Skip the agent." },
      { name: "description", content: "A peer-to-peer marketplace connecting creators with clients. Verified profiles, instant booking, escrow payments, transparent reviews." },
      { property: "og:title", content: "Cadence — Book artists directly" },
      { property: "og:description", content: "Direct bookings between creators and clients. No middlemen. No inflated fees." },
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
      <Features />
      <Creators />
      <Trust />
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
            A new chord for live booking
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-display text-[clamp(3rem,9vw,8.5rem)]"
          >
            Book the artist,<br />
            <span className="italic text-accent">not</span> the agent.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed"
          >
            Cadence is the peer-to-peer marketplace where creators and clients
            meet without middlemen. Verified portfolios. Instant calendars.
            Escrowed payments. Honest reviews.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button className="group bg-foreground text-background px-6 py-3.5 rounded-full inline-flex items-center gap-2 hover:bg-accent transition-colors">
              Find an artist
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            </button>
            <button className="px-6 py-3.5 rounded-full border border-foreground/20 hover:border-foreground transition-colors inline-flex items-center gap-2">
              List your craft
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
            <div className="text-display text-2xl">Marcus J.</div>
            <div className="text-sm text-muted-foreground mt-1">Sax · Wedding · $2,400</div>
            <div className="mt-3 flex items-center gap-1 text-xs text-foreground/70">
              <Stars className="w-3 h-3 fill-accent text-accent" />
              4.98 · 142 events
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-20 lg:mt-32 grid grid-cols-2 md:grid-cols-4 gap-y-8 border-t border-border pt-10">
        {[
          ["0%", "Agent commission"],
          ["48hr", "Avg. booking time"],
          ["12k+", "Verified creators"],
          ["$8.4M", "Held in escrow"],
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
  const words = ["Musicians", "DJs", "Comedians", "Dancers", "Speakers", "Magicians", "Bands", "Hosts", "Photographers", "Visual artists"];
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
    { n: "01", t: "Discover", d: "Browse verified creators by craft, city, vibe, or budget. Real portfolios, real performance stats." },
    { n: "02", t: "Request", d: "Pick a date from a live calendar. Send a brief. Get a quote in hours, not weeks." },
    { n: "03", t: "Escrow", d: "Funds are held safely until the performance. The creator is guaranteed payment. You're guaranteed they show." },
    { n: "04", t: "Review", d: "Both sides rate. Reputation is transparent and earned, replacing the agent's vetting." },
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
    { Icon: ShieldCheck, t: "Verified profiles", d: "Identity, performance footage, and past venues — confirmed. Two portals: one for creators, one for clients." },
    { Icon: CalendarCheck, t: "Live booking", d: "Calendars sync with the artist's real availability. Hold a date in one click, lock it with a deposit." },
    { Icon: Lock, t: "Escrow payments", d: "Client funds are held securely and released the moment the event concludes successfully. Zero ghosting." },
    { Icon: Stars, t: "Honest reviews", d: "Both sides rate every booking. Reputation is portable, public, and impossible to fake." },
  ];
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 bg-foreground text-background">
      <div className="max-w-[1400px] mx-auto">
        <div className="tag text-accent mb-6">§ Built-in trust</div>
        <h2 className="text-display text-5xl lg:text-7xl max-w-3xl">
          Everything an agency does. <span className="italic text-background/60">Built into the platform.</span>
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
    { img: creator1, name: "Nadia Vance", craft: "Open-format DJ", rate: "$1,800", rating: "4.99", events: 86 },
    { img: creator2, name: "Elena Petrov", craft: "String quartet lead", rate: "$3,200", rating: "5.00", events: 214 },
    { img: creator3, name: "Theo Marsh", craft: "Stand-up comedian", rate: "$2,500", rating: "4.91", events: 67 },
  ];
  return (
    <section id="creators" className="py-24 lg:py-40 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-8 mb-16">
        <div>
          <div className="tag text-muted-foreground mb-4">§ Featured</div>
          <h2 className="text-display text-5xl lg:text-7xl max-w-2xl">Artists, booking <span className="italic">themselves.</span></h2>
        </div>
        <a href="#" className="tag inline-flex items-center gap-2 hover:text-accent transition-colors">
          Browse all creators <ArrowUpRight className="w-3.5 h-3.5" />
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
            Clients deposit. Cadence holds. The artist plays. Funds release within
            24 hours. Disputes are resolved by humans, not algorithms.
          </p>
        </div>
        <div className="lg:col-span-5 space-y-3 font-mono text-sm">
          {[
            ["BOOKING #C-2841", "CONFIRMED"],
            ["DEPOSIT (25%)", "$600.00 · HELD"],
            ["EVENT DATE", "MAR 14 · 8:00 PM"],
            ["BALANCE", "$1,800.00 · ESCROW"],
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
        The stage is <span className="italic text-accent">open.</span>
      </motion.h2>
      <p className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto">
        Join the marketplace re-tuning how live talent gets booked.
      </p>
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <button className="bg-foreground text-background px-8 py-4 rounded-full inline-flex items-center gap-2 hover:bg-accent transition-colors">
          I'm a creator
          <ArrowUpRight className="w-4 h-4" />
        </button>
        <button className="bg-secondary text-foreground px-8 py-4 rounded-full inline-flex items-center gap-2 border border-border hover:border-foreground transition-colors">
          I'm booking talent
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
        <div>© 2026 Cadence — Direct bookings, honest scenes.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-foreground transition">Terms</a>
          <a href="#" className="hover:text-foreground transition">Privacy</a>
          <a href="#" className="hover:text-foreground transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}
