"use client";

import { useState, useEffect } from "react";
import { Aperture, Menu, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle"; // ThemeToggle import kora holo

export interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
  userImage?: string;
}

export default function Navbar({
  isAuthenticated = false,
  userName = "Alex",
  userImage = "",
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", href: "/" },
    { label: "Explore Studios", href: "/studios" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "About Us", href: "/#about" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 shadow-xl shadow-black/5 dark:shadow-black/40 border-b border-border/60"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border/40"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="rounded-xl bg-primary p-2 shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-transform duration-300 group-hover:scale-105">
              <Aperture className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-foreground font-heading">
                StudioSpace
              </span>
              <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                Creative Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Component */}
            <ThemeToggle />

            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/80 hover:text-foreground hover:bg-secondary"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-full px-5"
                >
                  Register
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-secondary transition focus:outline-none focus:ring-2 focus:ring-ring">
                    <Avatar className="h-8 w-8 border-2 border-white ring-2 ring-primary/20">
                      <AvatarImage src={userImage} alt={userName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {userName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{userName}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl border-border/60 shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur"
                >
                  <DropdownMenuLabel className="font-heading text-lg">
                    {userName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/studios/new">Add New Studio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/my-studios">My Studio Listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/my-bookings">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/logout">
                      <span className="text-destructive font-medium">
                        Logout
                      </span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Sheet Nav */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Theme Toggle Component */}
            <ThemeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="p-2.5 rounded-2xl hover:bg-secondary/70 transition shadow-sm"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[340px] sm:w-[420px] bg-gradient-to-b from-[#faf8f5]/98 to-[#f2f0eb]/95 dark:from-gray-900/98 dark:to-gray-950/95 backdrop-blur-2xl border-l border-border/50 rounded-l-[2rem] shadow-2xl"
              >
                <div className="flex flex-col gap-1 pt-6 overflow-y-auto">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="text-lg font-medium text-foreground/90 py-3 hover:text-primary transition border-b border-border/30"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-3">
                  {!isAuthenticated ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full rounded-full h-12 shadow-sm"
                      >
                        Login
                      </Button>
                      <Button className="w-full rounded-full bg-primary text-primary-foreground h-12 shadow-xl shadow-primary/20">
                        Register
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full rounded-full h-12 shadow-sm"
                      >
                        Dashboard
                      </Button>
                      <Button className="w-full rounded-full bg-primary text-primary-foreground h-12 shadow-xl shadow-primary/20">
                        Add New Studio
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
