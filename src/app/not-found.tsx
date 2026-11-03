import Link from "next/link";
import { Aperture, ArrowLeft, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center gap-6 px-5 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Aperture className="h-8 w-8" />
      </span>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          This studio is off the map.
        </h1>
        <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          The page you are looking for may have been moved, renamed, or never
          existed. Let&apos;s get you back to a space that inspires you.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          nativeButton={false}
          size="lg"
          className="rounded-full px-6"
          render={<Link href="/" />}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Home
        </Button>

        <Button
          nativeButton={false}
          variant="outline"
          size="lg"
          className="rounded-full px-6"
          render={<Link href="/studios" />}
        >
          <SearchX className="mr-2 h-4 w-4" />
          Explore Studios
        </Button>
      </div>
    </main>
  );
}
