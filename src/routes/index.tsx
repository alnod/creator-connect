import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, ShieldCheck, CalendarCheck, Lock, Stars, ArrowRight, Music, Mic, Disc3, Sparkles, Camera, Drama, Plus, Minus } from "lucide-react";
import { useState } from "react";
import heroImg from "@/assets/hero-performer.jpg";
import creator1 from "@/assets/creator-1.jpg";
import creator2 from "@/assets/creator-2.jpg";
import creator3 from "@/assets/creator-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cadence — Book Austin's best corporate DJs & event hosts" },
      { name: "description", content: "The Austin marketplace for booking corporate DJs and event hosts directly. Verified talent, instant calendars, escrow payments, 7% flat fee. No agencies." },
      { property: "og:title", content: "Cadence — Austin's corporate event booking platform" },
      { property: "og:description", content: "Book vetted Austin DJs and emcees for your next company event. Escrow-backed. Agency-free." },
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
            Austin · Corporate events
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-display text-[clamp(3rem,9vw,8.5rem)]"
          >
            Book Austin's best DJs &amp; hosts. <span className="italic text-accent">Without</span> the agency.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed"
          >
            Cadence is the marketplace where Austin companies book vetted DJs
            and event hosts directly — for offsites, holiday parties, product
            launches, and conferences. Real calendars. Escrow-backed. 7% flat fee.
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
              I'm a DJ or host
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
            <div className="text-display text-2xl">DJ Marcus K.</div>
            <div className="text-sm text-muted-foreground mt-1">Holiday party · Indeed · $3,200</div>
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
          ["180+", "Vetted Austin DJs & hosts"],
          ["$2.1M", "Booked through escrow"],
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
  const words = ["Corporate DJs", "Event Hosts", "Emcees", "Open-format DJs", "Conference MCs", "Holiday parties", "Product launches", "Offsites", "Brand activations", "Happy hours"];
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

function Categories() {
  const cats = [
    { Icon: Disc3, name: "Open-format DJs", count: "84" },
    { Icon: Mic, name: "Corporate Emcees", count: "42" },
    { Icon: Sparkles, name: "Conference Hosts", count: "31" },
    { Icon: Music, name: "DJ + Live Sax", count: "18" },
    { Icon: Drama, name: "Brand Activation Hosts", count: "26" },
    { Icon: Camera, name: "Hybrid / Livestream DJs", count: "22" },
  ];
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-14">
        <div>
          <div className="tag text-muted-foreground mb-4">§ Browse Austin</div>
          <h2 className="text-display text-5xl lg:text-7xl">Every kind of <span className="italic">corporate event.</span></h2>
        </div>
        <p className="max-w-md text-muted-foreground">From SXSW activations to holiday parties at the Driskill, all-hands at the Long Center to product launches downtown — find the right talent for the room.</p>
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
                <div className="tag text-muted-foreground mt-2">{count} in Austin</div>
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
    { q: "Used to spend two weeks emailing agencies just to get quotes for our holiday party. Booked through Cadence in 90 minutes. Finance loved the invoice and the escrow.", n: "Priya N.", r: "Head of People · Austin SaaS co." },
    { q: "I was paying 22% to an agency for corporate gigs. Switched to Cadence and that money goes back into my rig. My calendar's been booked solid since Q2.", n: "DJ Marcus K.", r: "Open-format DJ · East Austin" },
    { q: "Hosted our SXSW activation. The vetting is real — every DJ on this platform actually plays corporate, not just clubs. Huge difference.", n: "Jordan R.", r: "Brand Marketing · Indeed" },
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
    { q: "Why only Austin? Why only corporate events?", a: "We're going deep before going wide. By focusing on Austin's corporate scene first, we can personally vet every DJ and host on the platform and guarantee the quality. Other metros and event types are next." },
    { q: "How is Cadence different from a booking agency?", a: "Agencies take 15–25% and gate-keep introductions. We're a self-serve marketplace: talent sets their own rates, you book directly, and we take 7% total to keep the lights on and run escrow." },
    { q: "How does escrow protect both sides?", a: "You deposit when booking; funds are held by our payment partner (Stripe). The talent is guaranteed payment if they perform, and you're guaranteed a replacement or refund if they no-show." },
    { q: "What if something goes wrong at the event?", a: "Either side can open a dispute within 7 days. A real human on our trust team reviews evidence and decides. Most disputes are resolved within 48 hours." },
    { q: "How do you vet the DJs and hosts?", a: "Government ID, performance footage review, references from at least two past corporate clients, and a 1:1 onboarding call. Roughly 1 in 4 applicants makes it onto the platform." },
    { q: "When does the talent get paid?", a: "Funds release automatically 24 hours after the event end-time, assuming no dispute. Payouts land in their bank within 1–2 business days." },
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
