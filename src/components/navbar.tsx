"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "motion/react";
import { Aperture, ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const PILL_TRANSITION = {
  type: "spring",
  stiffness: 400,
  damping: 32,
} as const;

const links = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About Us", href: "/#about" },
];

const accountLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Add New Studio", href: "/studios/new" },
  { label: "My Studio Listings", href: "/my-studios" },
  { label: "My Bookings", href: "/my-bookings" },
];

function isActivePath(pathname: string, href: string) {
  // Hash links are in-page anchors, not routes, so they never claim active state.
  if (href.startsWith("/#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeHref =
    links.find((link) => isActivePath(pathname, link.href))?.href ?? null;
  const indicatedHref = hoveredHref ?? activeHref;

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="sticky top-3 z-50 w-full px-4 sm:px-6"
      >
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between gap-3 rounded-full border border-border/70 bg-background/95 pl-3.5 pr-2 backdrop-blur-md transition-[height,max-width,box-shadow,background-color] duration-300 ease-out sm:pl-5",
            scrolled
              ? "h-14 max-w-5xl bg-background/[0.98] shadow-xl shadow-black/10 dark:shadow-black/50"
              : "h-16 max-w-6xl shadow-lg shadow-black/5 dark:shadow-black/40",
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="rounded-xl bg-primary p-2 text-primary-foreground shadow-sm">
              <Aperture className="h-5 w-5 transition-transform duration-300 ease-out group-hover:rotate-45" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                StudioSpace
              </span>
              <span className="hidden text-[10px] font-medium tracking-[0.15em] text-muted-foreground uppercase sm:block">
                Creative Marketplace
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 md:flex"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);
              const indicated = indicatedHref === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHoveredHref(link.href)}
                  onFocus={() => setHoveredHref(link.href)}
                  onBlur={() => setHoveredHref(null)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active || indicated
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {indicated && (
                    <motion.span
                      layoutId="navbar-active"
                      aria-hidden="true"
                      transition={PILL_TRANSITION}
                      className="absolute inset-0 rounded-full bg-secondary"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-1.5 md:flex">
            <ThemeToggle />

            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full px-4 text-muted-foreground hover:text-foreground"
                >
                  Login
                </Button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                >
                  <Button size="lg" className="rounded-full px-5 shadow-sm">
                    Register
                  </Button>
                </motion.div>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    />
                  }
                >
                  <Avatar className="h-8 w-8 border border-border ring-2 ring-primary/15">
                    <AvatarImage src={userImage} alt={userName} />
                    <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                      {userName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{userName}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-56 rounded-2xl p-1.5 shadow-xl"
                >
                  <DropdownMenuLabel className="px-2 py-1.5 font-heading text-base text-foreground">
                    {userName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountLinks.map((item) => (
                    <DropdownMenuItem
                      key={item.href}
                      render={<Link href={item.href} />}
                      className="rounded-lg px-2 py-1.5"
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    render={<Link href="/logout" />}
                    className="rounded-lg px-2 py-1.5"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            <ThemeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Menu className="h-5 w-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="border-l border-border/60 bg-background! sm:bg-background!"
              >
                <nav aria-label="Mobile" className="flex flex-col gap-1 pt-2">
                  {links.map((link) => {
                    const active = isActivePath(pathname, link.href);

                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "rounded-xl px-3 py-3 text-base font-medium transition-colors",
                            active
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>

                <div className="mt-8 flex flex-col gap-3">
                  {!isAuthenticated ? (
                    <>
                      <Button
                        variant="outline"
                        className="h-11 w-full rounded-full shadow-sm"
                      >
                        Login
                      </Button>
                      <Button className="h-11 w-full rounded-full shadow-sm">
                        Register
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="h-11 w-full rounded-full shadow-sm"
                      >
                        Dashboard
                      </Button>
                      <Button className="h-11 w-full rounded-full shadow-sm">
                        Add New Studio
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
    </MotionConfig>
  );
}
