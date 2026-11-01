"use client";

import { Aperture, Mail } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="rounded-xl bg-amber-500 p-2 shadow-lg shadow-amber-500/20">
                <Aperture className="h-5 w-5 text-black" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight font-heading">StudioSpace</span>
                <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/50">Creative Marketplace</span>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">A curated marketplace for creators to discover, book, and host world-class production spaces.</p>
            <div className="flex gap-3">
              {["X","Instagram","LinkedIn"].map((social) => (
                <a key={social} href="#" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/70 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-colors" aria-label={social}>{social === "X" ? "ð•" : social[0]}</a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-heading text-lg font-bold mb-5">Explore</h4>
            <ul className="space-y-3 text-sm text-white/60">
              {["Home","Explore Studios","How It Works","About Us","Blog"].map((l) => <li key={l}><a href="#" className="hover:text-amber-400 transition-colors">{l}</a></li>)}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h4 className="font-heading text-lg font-bold mb-5">Categories</h4>
            <ul className="space-y-3 text-sm text-white/60">
              {["Photo Studios","Sound Stages","Podcast Rooms","Music Suites","Art Workshops"].map((l) => <li key={l}><a href="#" className="hover:text-amber-400 transition-colors">{l}</a></li>)}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4 lg:col-start-10">
            <h4 className="font-heading text-lg font-bold mb-5">Stay Inspired</h4>
            <p className="text-sm text-white/60 mb-4">Weekly picks of new studios and creator insights.</p>
            <form onSubmit={(e) => { e.preventDefault(); }} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <Input placeholder="Email address" type="email" className="pl-9 h-11 rounded-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-amber-500/50" />
              </div>
              <Button type="submit" className="h-11 rounded-full bg-amber-500 text-black font-semibold hover:bg-amber-400 px-6 shadow-lg shadow-amber-500/20">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>&copy; 2026 StudioSpace. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/70">Privacy</a>
            <a href="#" className="hover:text-white/70">Terms</a>
            <a href="#" className="hover:text-white/70">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
