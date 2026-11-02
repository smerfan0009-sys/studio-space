"use client";

import Link from "next/link";
import { Aperture, ArrowUpRight, Mail } from "lucide-react";
import { toast } from "sonner";
import type { FormEvent } from "react";

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.6 22H2.5l7.3-8.4L1.8 2h6.5l4.4 6.9L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
    </svg>
  );
}

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.07c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.76 1.63 2.85 1.24.1-.72.39-1.21.7-1.49-2.47-.28-5.06-1.24-5.06-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.6 5.23-5.08 5.51.4.35.76 1.02.76 2.06V22c0 .29.2.63.77.52A11.1 11.1 0 0 0 12 .9Z"
      />
    </svg>
  );
}

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About Us", href: "/#about" },
];

const categories = [
  { label: "Photo Studios", value: "Photo Studio" },
  { label: "Film Stages", value: "Film Stage" },
  { label: "Podcast Rooms", value: "Podcast Lounge" },
  { label: "Music Suites", value: "Music Suite" },
  { label: "Art Workshops", value: "Workshop" },
];

export default function Footer() {
  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email")?.toString().trim();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    toast.info("Newsletter subscription is coming soon.");
    form.reset();
  };

  return (
    <footer className="border-t border-white/10 bg-[#111019] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand and mission */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
                <Aperture size={23} className="text-white" />
              </span>

              <span className="text-2xl font-bold tracking-tight">
                Studio<span className="text-violet-400">Space</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-white/60">
              A creative space for creators. Discover inspiring studios, connect
              with hosts, and bring your next big idea to life.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StudioSpace on X"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-violet-500 hover:bg-violet-600 hover:text-white"
              >
                <XIcon size={17} />
              </a>

              <a
                href="https://github.com/smerfan0009-sys/studio-space"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StudioSpace on GitHub"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-violet-500 hover:bg-violet-600 hover:text-white"
              >
                <GithubIcon size={18} />
              </a>
            </div>
          </div>

          {/* Quick navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-white/60 transition hover:text-violet-400"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Popular Categories
            </h3>

            <ul className="mt-6 space-y-4">
              {categories.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/studios?category=${encodeURIComponent(category.value)}`}
                    className="text-sm text-white/60 transition hover:text-violet-400"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Stay Inspired
            </h3>

            <p className="mt-6 text-sm leading-7 text-white/60">
              Get updates about creative spaces and new opportunities.
            </p>

            <form onSubmit={handleSubscribe} className="mt-5">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] p-1.5 focus-within:border-violet-500">
                <Mail size={18} className="ml-2 shrink-0 text-white/40" />

                <input
                  id="footer-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Your email address"
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/35"
                />

                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500"
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Copyright and terms */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 StudioSpace. All rights reserved.</p>

          <Link href="/terms" className="transition hover:text-violet-400">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
