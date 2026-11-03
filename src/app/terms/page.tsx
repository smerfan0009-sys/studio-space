import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms & Conditions — StudioSpace",
  description:
    "The basic terms that apply when you book or list a creative space on StudioSpace.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        StudioSpace
      </p>
      <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-foreground">
        Terms &amp; Conditions
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        By using StudioSpace you agree to treat hosts, creators, and shared
        spaces with respect. Bookings are requests until a host confirms them,
        and confirmed bookings are subject to the studio&apos;s availability.
      </p>

      <div className="mt-10 space-y-6 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Bookings
          </h2>
          <p className="mt-2">
            You may cancel a pending booking at any time. Once a host confirms a
            reservation, the studio is held for your selected time slot and
            cannot be double-booked by another creator.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Listings
          </h2>
          <p className="mt-2">
            Hosts are responsible for describing their spaces accurately,
            including amenities, capacity, pricing, and any house rules. Owners
            can update or remove their listings from their dashboard.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Reviews
          </h2>
          <p className="mt-2">
            Reviews are available after a confirmed booking. Keep feedback
            honest, constructive, and relevant to the studio experience.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Button
          nativeButton={false}
          size="lg"
          className="rounded-full px-6"
          render={<Link href="/" />}
        >
          Return to Home
        </Button>
      </div>
    </main>
  );
}
