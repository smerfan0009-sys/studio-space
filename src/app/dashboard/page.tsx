"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Plus,
  RefreshCw,
  Building2,
  MapPin,
  UserRound,
  CalendarCheck,
  CircleAlert,
  Sparkles,

} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

type Studio = {
  _id: string;
  title: string;
  category?: string;
  hourlyRate?: number;
  location?: string;
  imageUrl?: string;
  rating?: number;
  createdAt?: string;
};

type Booking = {
  _id: string;
  studioId?: string;
  studioTitle?: string;
  studioName?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  bookingDate?: string;
  status?: string;
  totalAmount?: number;
  amount?: number;
};

type DashboardData = {
  studios: Studio[];
  bookings: Booking[];
  studiosError: boolean;
  bookingsError: boolean;
};

type ApiPayload = {
  [key: string]: unknown;
};

function isApiPayload(value: unknown): value is ApiPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractArray<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isApiPayload(payload)) return [];

  for (const key of keys) {
    const value = payload[key];

    if (Array.isArray(value)) return value as T[];

    if (isApiPayload(payload.data)) {
      const nestedValue = payload.data[key];

      if (Array.isArray(nestedValue)) return nestedValue as T[];
    }

    if (isApiPayload(payload.result)) {
      const nestedValue = payload.result[key];

      if (Array.isArray(nestedValue)) return nestedValue as T[];
    }
  }

  if (Array.isArray(payload.data)) return payload.data as T[];
  if (Array.isArray(payload.result)) return payload.result as T[];

  return [];
}
function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value?: string) {
  if (!value) return "Date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date not available";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "cancelled":
      return "bg-rose-500/10 text-rose-600 border-rose-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  href,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  accent: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary">
        View details
        <ArrowUpRight
          size={15}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}

function SectionHeading({
  title,
  description,
  href,
  linkText = "View all",
}: {
  title: string;
  description: string;
  href: string;
  linkText?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:opacity-75"
      >
        {linkText}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-36 rounded-3xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-36 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-muted" />
        <div className="h-72 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  href: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={23} />
      </div>

      <h3 className="font-semibold text-foreground">{title}</h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {buttonText}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [dashboard, setDashboard] = useState<DashboardData>({
    studios: [],
    bookings: [],
    studiosError: false,
    bookingsError: false,
  });

  const [isFetching, setIsFetching] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const userName = user?.name || "Creator";
  const userEmail = user?.email || "";
  const userImage = user?.image || "";

  // Protect the dashboard route.
  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login?callbackURL=%2Fdashboard");
    }
  }, [isPending, user, router]);

  // Fetch dashboard data from the existing backend endpoints.
  useEffect(() => {
    if (isPending || !user) return;

    const controller = new AbortController();

    async function loadDashboard() {
      const [studiosResult, bookingsResult] = await Promise.allSettled([
        fetch(`${API_URL}/api/my-listings`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        }),
        fetch(`${API_URL}/api/my-bookings`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        }),
      ]);

      if (controller.signal.aborted) return;

      let studios: Studio[] = [];
      let bookings: Booking[] = [];
      let studiosError = false;
      let bookingsError = false;

      if (studiosResult.status === "fulfilled") {
        try {
          if (!studiosResult.value.ok) {
            throw new Error("Could not load studio listings");
          }

          const payload = await studiosResult.value.json();
          studios = extractArray<Studio>(payload, ["studios", "listings"]);
        } catch {
          studiosError = true;
        }
      } else {
        studiosError = true;
      }

      if (bookingsResult.status === "fulfilled") {
        try {
          if (!bookingsResult.value.ok) {
            throw new Error("Could not load bookings");
          }

          const payload = await bookingsResult.value.json();
          bookings = extractArray<Booking>(payload, ["bookings"]);
        } catch {
          bookingsError = true;
        }
      } else {
        bookingsError = true;
      }

      if (!controller.signal.aborted) {
        setDashboard({
          studios,
          bookings,
          studiosError,
          bookingsError,
        });
        setIsFetching(false);
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, [isPending, user, retryKey]);

  const recentStudios = useMemo(
    () =>
      [...dashboard.studios]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        )
        .slice(0, 3),
    [dashboard.studios],
  );

  const recentBookings = useMemo(
    () =>
      [...dashboard.bookings]
        .sort(
          (a, b) =>
            new Date(b.startTime || b.bookingDate || 0).getTime() -
            new Date(a.startTime || a.bookingDate || 0).getTime(),
        )
        .slice(0, 5),
    [dashboard.bookings],
  );

  const pendingBookings = dashboard.bookings.filter(
    (booking) => booking.status?.toLowerCase() === "pending",
  ).length;

  const confirmedBookings = dashboard.bookings.filter(
    (booking) => booking.status?.toLowerCase() === "confirmed",
  ).length;

  const handleRetry = useCallback(() => {
    setIsFetching(true);
    setRetryKey((current) => current + 1);
  }, []);

  if (isPending || (!user && !isPending) || isFetching) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-9 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Welcome section */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 shadow-sm sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles size={14} />
                YOUR CREATOR WORKSPACE
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Welcome back, {userName.split(" ")[0]}!
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Your creative journey starts here. Manage your studios, keep
                track of bookings, and discover your next workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/add-studio"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90"
                >
                  <Plus size={17} />
                  Add New Studio
                </Link>

                <Link
                  href="/studios"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Compass size={17} />
                  Explore Studios
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/80 p-4 backdrop-blur-sm md:min-w-64">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={25} className="text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {userName}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 size={13} />
                  Signed in
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Your Overview
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A quick look at your StudioSpace activity.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="My Studios"
              value={dashboard.studios.length}
              description="Your listed creative spaces"
              icon={Building2}
              accent="bg-primary/10 text-primary"
              href="/my-listings"
            />

            <StatCard
              title="Total Bookings"
              value={dashboard.bookings.length}
              description="All your reservations"
              icon={CalendarDays}
              accent="bg-blue-500/10 text-blue-600"
              href="/my-bookings"
            />

            <StatCard
              title="Pending Bookings"
              value={pendingBookings}
              description="Waiting for confirmation"
              icon={Clock3}
              accent="bg-amber-500/10 text-amber-600"
              href="/my-bookings"
            />

            <StatCard
              title="Confirmed Bookings"
              value={confirmedBookings}
              description="Successfully confirmed"
              icon={CalendarCheck}
              accent="bg-emerald-500/10 text-emerald-600"
              href="/my-bookings"
            />
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <SectionHeading
            title="Quick Actions"
            description="Jump straight into what you need."
            href="/studios"
            linkText="Explore"
          />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                title: "Add New Studio",
                description: "List your creative space",
                icon: Plus,
                href: "/add-studio",
              },
              {
                title: "Explore Studios",
                description: "Find a space to create",
                icon: Compass,
                href: "/studios",
              },
              {
                title: "My Listings",
                description: "Manage your studios",
                icon: Building2,
                href: "/my-listings",
              },
              {
                title: "My Bookings",
                description: "Track your reservations",
                icon: CalendarDays,
                href: "/my-bookings",
              },
            ].map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex min-h-32 flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <action.icon size={19} />
                  </div>
                  <ArrowUpRight
                    size={17}
                    className="text-muted-foreground transition-colors group-hover:text-primary"
                  />
                </div>

                <div className="mt-5">
                  <h3 className="text-sm font-bold text-foreground">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent studios */}
          <div className="min-w-0">
            <SectionHeading
              title="Recent Studios"
              description="Your latest listed workspaces."
              href="/my-listings"
            />

            {dashboard.studiosError ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                  <CircleAlert size={17} />
                  Couldn&apos;t load your studios
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please refresh the dashboard or check your connection.
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-3 text-sm font-semibold text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : recentStudios.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No studios listed yet"
                description="Share your creative space with other creators by adding your first studio."
                buttonText="Add your first studio"
                href="/add-studio"
              />
            ) : (
              <div className="space-y-3">
                {recentStudios.map((studio) => (
                  <div
                    key={studio._id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/30 sm:p-4"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {studio.imageUrl ? (
                        <img
                          src={studio.imageUrl}
                          alt={studio.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <Aperture size={25} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {studio.category || "Creative Space"}
                      </span>
                      <h3 className="mt-1 truncate text-sm font-bold text-foreground">
                        {studio.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin size={12} />
                        {studio.location || "Location not specified"}
                      </p>
                      <p className="mt-2 text-sm font-bold text-foreground">
                        {formatCurrency(studio.hourlyRate)}
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          / hr
                        </span>
                      </p>
                    </div>

                    <Link
                      href={`/studios/${studio._id}`}
                      aria-label={`View ${studio.title}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div className="min-w-0">
            <SectionHeading
              title="Recent Bookings"
              description="Your latest workspace reservations."
              href="/my-bookings"
            />

            {dashboard.bookingsError ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                  <CircleAlert size={17} />
                  Couldn&apos;t load your bookings
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  The bookings endpoint may not be available yet. Your studio
                  listings are still shown separately.
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-3 text-sm font-semibold text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : recentBookings.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No bookings yet"
                description="Explore creative workspaces and make your next project happen."
                buttonText="Explore studios"
                href="/studios"
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {recentBookings.map((booking, index) => {
                  const bookingTitle =
                    booking.studioTitle ||
                    booking.studioName ||
                    booking.title ||
                    "Workspace booking";

                  return (
                    <div
                      key={booking._id || index}
                      className={`flex items-center justify-between gap-3 p-4 ${
                        index !== recentBookings.length - 1
                          ? "border-b border-border"
                          : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {bookingTitle}
                        </h3>

                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays size={12} />
                          {formatDate(booking.startTime || booking.bookingDate)}
                        </p>

                        <p className="mt-2 text-xs font-semibold text-foreground">
                          {formatCurrency(
                            booking.totalAmount ?? booking.amount,
                          )}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${getStatusStyle(
                          booking.status,
                        )}`}
                      >
                        {booking.status || "Unknown"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Profile summary */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound size={22} />
              </div>
              <div>
                <h2 className="font-bold text-foreground">
                  Account Information
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your current StudioSpace account.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-sm sm:text-right">
              <span className="font-semibold text-foreground">{userName}</span>
              <span className="text-muted-foreground">{userEmail}</span>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="flex flex-col items-center justify-center gap-2 pb-3 text-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Aperture size={15} className="text-primary" />
            StudioSpace
          </div>
          <p className="text-xs text-muted-foreground">
            Find your space. Create your story.
          </p>
        </div>
      </div>
    </main>
  );
}
