import {
  Search,
  CalendarClock,
  CheckCircle2,
  Clapperboard,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Discover Spaces",
    description:
      "Explore creative studios, compare locations, and find a workspace that matches your project.",
    icon: Search,
  },
  {
    number: "02",
    title: "Select Shoot Hours",
    description:
      "Choose your preferred date, available time slot, and the hours you need for your session.",
    icon: CalendarClock,
  },
  {
    number: "03",
    title: "Book Instantly",
    description:
      "Review the booking details and submit your reservation to secure your creative space.",
    icon: CheckCircle2,
  },
  {
    number: "04",
    title: "Create & Produce",
    description:
      "Show up, bring your ideas to life, and make something worth sharing.",
    icon: Clapperboard,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-28 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold tracking-[0.16em] text-primary">
              SIMPLE PROCESS
            </span>
          </div>

          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            How It <span className="text-primary">Works</span>
          </h2>

          <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
            Your next creative project starts with the right space. Follow four
            simple steps and turn your ideas into reality.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative flex min-h-[280px] flex-col rounded-3xl border border-border/60 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Step Number */}
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </div>

                  <span className="text-3xl font-bold tracking-tight text-muted-foreground/30">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground">
                  {step.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {step.description}
                </p>

                {/* Bottom Indicator */}
                <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-primary">
                  <span>Step {index + 1}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>

                {/* Connector for desktop */}
                {index !== steps.length - 1 && (
                  <div className="pointer-events-none absolute -right-4 top-12 z-10 hidden text-primary/40 lg:block">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/60 bg-muted/40 px-6 py-8 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">
              Ready to find your creative space?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore unique studios and start planning your next project.
            </p>
          </div>

          <a
            href="/studios"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explore Studios
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
