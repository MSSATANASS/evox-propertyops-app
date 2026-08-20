import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Building2,
  Wrench,
  FileText,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Shield,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { toast } from "sonner";

const benefits = [
  {
    icon: Building2,
    title: "Total control of your properties",
    description:
      "View the status of every property — occupancy, rents, and more — in a single dashboard. No more scattered spreadsheets.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Wrench,
    title: "Frictionless maintenance management",
    description:
      "Log, assign, and track every work order with priorities, photos, and real-time updates.",
    color: "text-amber-400 bg-amber-400/10",
  },
  {
    icon: FileText,
    title: "Instant financial reports",
    description:
      "Generate expense, income, and maintenance reports with one click. Share them with your owners professionally.",
    color: "text-emerald-400 bg-emerald-400/10",
  },
];

const features = [
  "Real-time dashboard",
  "Task & maintenance management",
  "Per-property expense tracking",
  "Dedicated owner portal",
  "Exportable reports",
  "Multi-user access",
];

const stats = [
  { value: "100%", label: "Operational visibility" },
  { value: "3×", label: "Faster than Excel" },
  { value: "0", label: "Lost information" },
];

export default function LandingPage() {
  const [contact, setContact] = useState({ name: "", whatsapp: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name || (!contact.whatsapp && !contact.email)) {
      toast.error("Please enter your name and at least one contact method.");
      return;
    }
    // Build WhatsApp message to Evox
    const msg = encodeURIComponent(
      `Hi, I'm interested in PropertyOps by Evox.\nName: ${contact.name}\nEmail: ${contact.email || "—"}\nWhatsApp: ${contact.whatsapp || "—"}`
    );
    window.open(`https://wa.me/521XXXXXXXXXX?text=${msg}`, "_blank");
    setSubmitted(true);
    toast.success("Thanks! We'll be in touch soon.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-[15px] tracking-tight">
              PropertyOps <span className="text-muted-foreground font-normal">by Evox</span>
            </span>
          </div>
          <Link to="/">
            <Button size="sm" className="gap-1.5 text-xs">
              View demo <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, oklch(0.62 0.19 260) 0%, transparent 70%)" }}
        />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full mb-6">
              <Shield className="w-3 h-3" /> Professional software for property management companies
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance leading-[1.1] mb-6">
              Manage your properties{" "}
              <span className="text-primary">with complete clarity</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto mb-10 leading-relaxed">
              PropertyOps centralizes property control, maintenance, and finances in a single platform.
              More order, fewer errors, better decisions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/">
              <Button size="lg" className="gap-2 text-[15px] px-7">
                View live demo <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#contact">
              <Button size="lg" variant="secondary" className="gap-2 text-[15px] px-7">
                <MessageSquare className="w-4 h-4" /> Request information
              </Button>
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dashboard preview strip */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
              <div className="ml-3 flex-1 bg-background/60 rounded-md h-6 flex items-center px-3">
                <span className="text-[11px] text-muted-foreground">propertyops.evox.mx/dashboard</span>
              </div>
            </div>
            {/* Mini dashboard mockup */}
            <div className="p-6 grid md:grid-cols-4 gap-3">
              {[
                { label: "Properties", value: "12", icon: Building2, color: "text-primary bg-primary/10" },
                { label: "Pending", value: "5", icon: "⚠", color: "text-yellow-400 bg-yellow-400/10" },
                { label: "In Progress", value: "3", icon: Wrench, color: "text-blue-400 bg-blue-400/10" },
                { label: "Appr. Expenses", value: "$48,200", icon: BarChart3, color: "text-emerald-400 bg-emerald-400/10" },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-background rounded-xl p-4 border border-border flex flex-col gap-3"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                    {typeof card.icon === "string" ? (
                      <span className="text-base">{card.icon}</span>
                    ) : (
                      <card.icon className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-xl font-bold">{card.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-auto">{card.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="px-6 pb-6 grid md:grid-cols-2 gap-3">
              {[1, 2].map((col) => (
                <div key={col} className="bg-background border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="h-3 w-28 bg-muted rounded-md" />
                  </div>
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="px-4 py-3 border-b border-border/50 last:border-0 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                      <div className="h-2.5 flex-1 bg-muted rounded-md" />
                      <div className="h-2.5 w-14 bg-muted/60 rounded-full" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Everything you need,{" "}
              <span className="text-primary">without the complexity</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto text-balance">
              Designed for property managers who want to operate with precision and deliver
              a professional experience to their owners.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${b.color}`}>
                  <b.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-bold leading-snug">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 bg-card border border-border rounded-2xl p-6 md:p-8"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
              Included in the platform
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-foreground/80">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact / Lead capture */}
      <section id="contact" className="px-6 pb-28">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 md:p-10 text-center"
          >
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-400/10 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Done! We'll contact you soon</h3>
                <p className="text-sm text-muted-foreground">
                  Our team will review your information and reach out shortly.
                </p>
                <Link to="/">
                  <Button className="mt-2 gap-2">
                    View the demo now <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Interested in PropertyOps?</h2>
                <p className="text-sm text-muted-foreground mb-8 text-balance">
                  Leave your details and we'll show you how it can transform your company's operations.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
                  <Input
                    placeholder="Your name"
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  />
                  <Input
                    placeholder="WhatsApp (e.g. +1 555 123 4567)"
                    value={contact.whatsapp}
                    onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value }))}
                  />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  />
                  <Button type="submit" size="lg" className="mt-2 gap-2 w-full">
                    <MessageSquare className="w-4 h-4" /> Send via WhatsApp
                  </Button>
                </form>
                <p className="text-[11px] text-muted-foreground mt-4">
                  Your information is confidential and will not be shared with third parties.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">
              PropertyOps <span className="text-muted-foreground font-normal">by Evox</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Evox. All rights reserved.
          </p>
          <Link to="/" className="text-xs text-primary hover:underline flex items-center gap-1">
            View demo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
