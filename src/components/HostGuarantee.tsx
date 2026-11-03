"use client";

import {
  ShieldCheck,
  BadgeCheck,
  Camera,
  Headset,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

const guarantees = [
  {
    number: "01",
    icon: ShieldCheck,
    title: "Liability Protection",
    description:
      "Create with greater confidence. Our platform prioritizes clear booking policies and support when unexpected issues arise.",
    features: ["Clear booking policies", "Dedicated issue support"],
  },
  {
    number: "02",
    icon: BadgeCheck,
    title: "Verified Profiles",
    description:
      "Connect with confidence through a community built around trustworthy host and creator profiles.",
    features: ["Profile verification", "Transparent host details"],
  },
  {
    number: "03",
    icon: Camera,
    title: "Equipment Safety",
    description:
      "Know what to expect before your session with studio details, listed amenities, and equipment information.",
    features: ["Detailed studio listings", "Equipment information"],
  },
  {
    number: "04",
    icon: Headset,
    title: "24/7 Host Support",
    description:
      "Get help when you need it. We're focused on making every studio booking experience smoother.",
    features: ["Booking assistance", "Support when needed"],
  },
];

export default function HostGuarantee() {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
            <ShieldCheck size={16} />
            Your creative journey, protected
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Create More.
            <span className="text-primary"> Worry Less.</span>
          </h2>

          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            Great creative work starts with peace of mind. StudioSpace is
            designed to make finding, booking, and using creative spaces a more
            confident experience.
          </p>
        </div>

        {/* Guarantee cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.number}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-7 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={27} strokeWidth={1.8} />
                  </div>

                  <span className="text-sm font-semibold tracking-widest text-muted-foreground/50">
                    {item.number}
                  </span>
                </div>

                <h3 className="mb-3 text-xl font-bold text-foreground">
                  {item.title}
                </h3>

                <p className="mb-6 flex-1 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>

                <div className="space-y-3 border-t border-border pt-5">
                  {item.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2.5 text-sm font-medium text-foreground/80"
                    >
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-primary"
                      />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
              </article>
            );
          })}
        </div>

        {/* Bottom banner */}
        <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl border border-border bg-muted/40 p-6 text-center sm:flex-row sm:px-8 sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-foreground sm:text-xl">
              Your next creative space is waiting.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Find a space that fits your vision and get started.
            </p>
          </div>

          <a
            href="/studios"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            Explore Studios
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
