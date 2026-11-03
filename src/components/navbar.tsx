"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MotionConfig, motion } from "motion/react";
import { Aperture, ChevronDown, Menu, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
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
  DropdownMenuGroup,
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
  { label: "Add New Studio", href: "/add-studio" },
  { label: "My Studio Listings", href: "/my-listings" },
  { label: "My Bookings", href: "/my-bookings" },
];

function isActivePath(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

// ==========================================
// 1. UserProfileDropdown এখন বাইরে ডিক্লেয়ার করা হয়েছে
// ==========================================
interface UserProfileDropdownProps {
  userName: string;
  userImage: string;
  isLoggingOut: boolean;
  handleLogout: () => void;
  renderAccountLinks: (mobile?: boolean) => React.ReactNode;
}

function UserProfileDropdown({
  userName,
  userImage,
  isLoggingOut,
  handleLogout,
  renderAccountLinks,
}: UserProfileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open account menu"
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        }
      >
        <Avatar className="h-8 w-8 border border-border ring-2 ring-primary/15">
          <AvatarImage src={userImage} alt={userName} />

          <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <span className="hidden max-w-28 truncate text-sm font-medium sm:inline-block">
          {userName}
        </span>

        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-56 rounded-2xl p-1.5 shadow-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 font-heading text-base text-foreground">
            {userName}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>{renderAccountLinks(false)}</DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="cursor-pointer rounded-lg px-2 py-1.5"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);

  const [hovered, setHovered] = useState<{
    href: string;
    pathname: string;
  } | null>(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Better Auth session
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const isAuthenticated = Boolean(user);

  const userName = user?.name || "User";
  const userImage = user?.image || "";

  const activeHref =
    links.find((link) => isActivePath(pathname, link.href))?.href ?? null;

  const indicatedHref =
    hovered?.pathname === pathname ? hovered.href : activeHref;

  // Sticky navbar scroll effect
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Better Auth logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error("Logout failed. Please try again.");
        console.error("Logout failed:", error.message);
        return;
      }

      toast.success("You have been logged out successfully.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Account menu links
  const renderAccountLinks = (mobile = false) =>
    accountLinks.map((item) => {
      const active = isActivePath(pathname, item.href);

      if (mobile) {
        return (
          <SheetClose asChild key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-xl px-3 py-3 text-base font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          </SheetClose>
        );
      }

      return (
        <DropdownMenuItem
          key={item.href}
          render={<Link href={item.href} />}
          className={cn("rounded-lg px-2 py-1.5", active && "bg-secondary")}
        >
          {item.label}
        </DropdownMenuItem>
      );
    });

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
            onMouseLeave={() => setHovered(null)}
          >
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);
              const indicated = indicatedHref === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHovered({ href: link.href, pathname })}
                  onFocus={() => setHovered({ href: link.href, pathname })}
                  onBlur={() => setHovered(null)}
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

            {isPending ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-secondary" />
            ) : !isAuthenticated ? (
              <>
                <Button
                  nativeButton={false}
                  variant="ghost"
                  size="lg"
                  className="rounded-full px-4 text-muted-foreground hover:text-foreground"
                  render={<Link href="/login" />}
                >
                  Login
                </Button>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                >
                  <Button
                    nativeButton={false}
                    size="lg"
                    className="rounded-full px-5 shadow-sm"
                    render={<Link href="/register" />}
                  >
                    Register
                  </Button>
                </motion.div>
              </>
            ) : (
              <UserProfileDropdown
                userName={userName}
                userImage={userImage}
                isLoggingOut={isLoggingOut}
                handleLogout={handleLogout}
                renderAccountLinks={renderAccountLinks}
              />
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            <ThemeToggle />

            {!isPending && isAuthenticated && (
              <UserProfileDropdown
                userName={userName}
                userImage={userImage}
                isLoggingOut={isLoggingOut}
                handleLogout={handleLogout}
                renderAccountLinks={renderAccountLinks}
              />
            )}

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
                className="border-l border-border/60 bg-background"
              >
                {/* Mobile main navigation */}
                <nav
                  aria-label="Mobile primary navigation"
                  className="flex flex-col gap-1 pt-2"
                >
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

                <div className="my-5 border-t border-border" />

                {/* Mobile authentication */}
                {isPending ? (
                  <div className="h-10 animate-pulse rounded-xl bg-secondary" />
                ) : !isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <SheetClose asChild>
                      <Button
                        nativeButton={false}
                        variant="outline"
                        className="h-11 w-full rounded-full"
                        render={<Link href="/login" />}
                      >
                        Login
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button
                        nativeButton={false}
                        className="h-11 w-full rounded-full"
                        render={<Link href="/register" />}
                      >
                        Register
                      </Button>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Mobile account navigation inside sheet */}
                    <nav
                      aria-label="Mobile account navigation"
                      className="flex flex-col gap-1"
                    >
                      {renderAccountLinks(true)}
                    </nav>

                    {/* Mobile logout */}
                    <Button
                      variant="destructive"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      className="mt-2 h-11 w-full rounded-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
    </MotionConfig>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-3 z-50 h-20 w-full px-4 sm:px-6">
          <div className="mx-auto h-full max-w-6xl animate-pulse rounded-full border border-border/70 bg-background/95" />
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
