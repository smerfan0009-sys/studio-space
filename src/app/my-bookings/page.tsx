"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Send,
  Star,
  Ticket,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

type Booking = {
  _id: string;
  studioId?: string;
  studioTitle?: string;
  studioName?: string;
  studioImage?: string;
  imageUrl?: string;
  category?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  bookingDate?: string;
  totalAmount?: number;
  amount?: number;
  hourlyRate?: number;
  status: BookingStatus | string;
  createdAt?: string;
};

type ApiPayload = {
  [key: string]: unknown;
};

type BookingFilter =
  | "All"
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

function isApiPayload(value: unknown): value is ApiPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractBookings(payload: unknown): Booking[] {
  if (Array.isArray(payload)) return payload as Booking[];
  if (!isApiPayload(payload)) return [];

  const possibleArrays = [
    payload.bookings,
    payload.data,
    payload.result,
    isApiPayload(payload.data) ? payload.data.bookings : undefined,
    isApiPayload(payload.result) ? payload.result.bookings : undefined,
  ];

  const result = possibleArrays.find(Array.isArray);
  return Array.isArray(result) ? (result as Booking[]) : [];
}

function formatCurrency(amount?: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function formatDate(date?: string) {
  if (!date) return "Date not available";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date not available";

  return parsed.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date?: string) {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "completed":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "cancelled":
      return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400";
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "cancelled":
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return <Clock3 className="h-3.5 w-3.5" />;
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-8 w-56 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-muted" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-52 rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

function EmptyBookings({ filter }: { filter: BookingFilter }) {
  const isFiltered = filter !== "All";

  return (
    <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Ticket className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-foreground">
        {isFiltered ? `No ${filter.toLowerCase()} bookings` : "No bookings yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {isFiltered
          ? "There are no bookings in this category right now. Try another filter."
          : "Your creative journey starts here. Explore amazing studios and book the perfect space for your next project."}
      </p>

      <Link
        href="/studios"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Explore Studios
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<BookingFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Prevent duplicate reviews during the current page session
  const [reviewedBookingIds, setReviewedBookingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login?callbackURL=%2Fmy-bookings");
    }
  }, [isPending, user, router]);

  // Fetch bookings
  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    async function loadBookings() {
      try {
        const response = await fetch("/api/my-bookings", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const payload: unknown = await response.json();

        if (!response.ok) {
          const message =
            isApiPayload(payload) && typeof payload.message === "string"
              ? payload.message
              : "Could not load your bookings.";

          throw new Error(message);
        }

        if (!controller.signal.aborted) {
          setBookings(extractBookings(payload));
          setError("");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading bookings.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadBookings();
    return () => controller.abort();
  }, [user, refreshKey]);

  const counts = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(
        (booking) => booking.status?.toLowerCase() === "pending",
      ).length,
      confirmed: bookings.filter(
        (booking) => booking.status?.toLowerCase() === "confirmed",
      ).length,
      completed: bookings.filter(
        (booking) => booking.status?.toLowerCase() === "completed",
      ).length,
      cancelled: bookings.filter(
        (booking) => booking.status?.toLowerCase() === "cancelled",
      ).length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesFilter =
        filter === "All" ||
        booking.status?.toLowerCase() === filter.toLowerCase();

      const studioName = booking.studioTitle || booking.studioName || "";

      const matchesSearch = [
        studioName,
        booking.category || "",
        booking.location || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, searchQuery]);

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsCancelling(true);

    try {
      const response = await fetch(
        `/api/bookings/${selectedBooking._id}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );

      const payload: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          isApiPayload(payload) && typeof payload.message === "string"
            ? payload.message
            : "Unable to cancel this booking.";

        throw new Error(message);
      }

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === selectedBooking._id
            ? { ...booking, status: "Cancelled" }
            : booking,
        ),
      );

      toast.success("Booking cancelled successfully.");
      setSelectedBooking(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!reviewBooking) return;

    if (!reviewBooking.studioId) {
      toast.error("Studio information is missing for this booking.");
      return;
    }

    if (reviewComment.trim().length < 5) {
      toast.error("Please write at least 5 characters in your review.");
      return;
    }

    if (reviewComment.trim().length > 1000) {
      toast.error("Your review cannot exceed 1000 characters.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: reviewBooking._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const payload: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          isApiPayload(payload) && typeof payload.message === "string"
            ? payload.message
            : "Could not submit your review.";

        throw new Error(message);
      }

      setReviewedBookingIds((previous) =>
        previous.includes(reviewBooking._id)
          ? previous
          : [...previous, reviewBooking._id],
      );

      toast.success("Your rating has been submitted successfully!");

      setReviewBooking(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your review.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError("");
    setRefreshKey((previous) => previous + 1);
  };

  if (isPending || !user) {
    return (
      <main className="min-h-[70vh] bg-background px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <BookingSkeleton />
        </div>
      </main>
    );
  }

  const filterOptions: BookingFilter[] = [
    "All",
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled",
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              <Ticket className="h-3.5 w-3.5" />
              YOUR CREATIVE SCHEDULE
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              My Bookings
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Keep track of your studio reservations, manage upcoming sessions,
              and rate studios after your booking is confirmed.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <BookingSkeleton />
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <XCircle className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-foreground">
              Unable to load bookings
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Booking Stats */}
            <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Bookings"
                value={counts.total}
                icon={Ticket}
                description="All your reservations"
              />
              <StatCard
                title="Pending"
                value={counts.pending}
                icon={Clock3}
                description="Waiting for confirmation"
              />
              <StatCard
                title="Confirmed"
                value={counts.confirmed}
                icon={CheckCircle2}
                description="Ready for your session"
              />
              <StatCard
                title="Completed"
                value={counts.completed}
                icon={CalendarDays}
                description="Successfully completed"
              />
            </section>

            {/* Booking List */}
            <section>
              <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Your Reservations
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {filteredBookings.length}{" "}
                    {filteredBookings.length === 1 ? "booking" : "bookings"}{" "}
                    found
                  </p>
                </div>

                <div className="relative w-full lg:max-w-xs">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search studio or location..."
                    className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {filterOptions.map((option) => {
                  const active = filter === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFilter(option)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {option}
                      {option === "All"
                        ? ` (${counts.total})`
                        : option === "Pending"
                          ? ` (${counts.pending})`
                          : option === "Confirmed"
                            ? ` (${counts.confirmed})`
                            : option === "Completed"
                              ? ` (${counts.completed})`
                              : ` (${counts.cancelled})`}
                    </button>
                  );
                })}
              </div>

              {/* Booking Cards */}
              {filteredBookings.length === 0 ? (
                <EmptyBookings filter={filter} />
              ) : (
                <div className="space-y-5">
                  {filteredBookings.map((booking) => {
                    const studioName =
                      booking.studioTitle ||
                      booking.studioName ||
                      "Studio Reservation";

                    const image =
                      booking.studioImage ||
                      booking.imageUrl ||
                      "/images/studio-placeholder.jpg";

                    const start = booking.startTime || booking.bookingDate;
                    const status = booking.status || "Pending";
                    const normalizedStatus = status.toLowerCase();

                    // Customer can review as soon as booking is confirmed.
                    // Completed bookings can also be reviewed.
                    const canReview =
                      normalizedStatus === "confirmed" ||
                      normalizedStatus === "completed";

                    const hasReviewed = reviewedBookingIds.includes(
                      booking._id,
                    );

                    return (
                      <article
                        key={booking._id}
                        className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                      >
                        <div className="grid md:grid-cols-[240px_1fr]">
                          {/* Studio Image */}
                          <div className="relative min-h-[210px] overflow-hidden bg-muted">
                            <Image
                              src={image}
                              alt={studioName}
                              fill
                              unoptimized
                              sizes="(max-width: 768px) 100vw, 240px"
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />

                            <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                              {booking.category || "Creative Studio"}
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="flex min-w-0 flex-col justify-between p-5 sm:p-6">
                            <div>
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="text-lg font-bold text-foreground transition group-hover:text-primary sm:text-xl">
                                    {studioName}
                                  </h3>

                                  {booking.location && (
                                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <MapPin className="h-4 w-4 shrink-0" />
                                      {booking.location}
                                    </p>
                                  )}
                                </div>

                                <span
                                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(status)}`}
                                >
                                  {getStatusIcon(status)}
                                  {status}
                                </span>
                              </div>

                              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <CalendarDays className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Booking Date
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                      {formatDate(start)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Clock3 className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Session Time
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                      {formatTime(booking.startTime) ||
                                        "Not specified"}
                                      {booking.endTime
                                        ? ` – ${formatTime(booking.endTime)}`
                                        : ""}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-center">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Total Amount
                                </p>
                                <p className="mt-1 flex items-center gap-1.5 text-xl font-bold text-foreground">
                                  <CreditCard className="h-4 w-4 text-primary" />
                                  {formatCurrency(
                                    booking.totalAmount ?? booking.amount,
                                  )}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {booking.studioId && (
                                  <Link
                                    href={`/studios/${booking.studioId}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                                  >
                                    View Studio
                                    <ArrowRight className="h-4 w-4" />
                                  </Link>
                                )}

                                {/* Review button for Confirmed or Completed bookings */}
                                {canReview && !hasReviewed && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewBooking(booking);
                                      setReviewRating(5);
                                      setReviewComment("");
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                                  >
                                    <Star className="h-4 w-4 fill-current" />
                                    Rate Studio
                                  </button>
                                )}

                                {hasReviewed && (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Reviewed
                                  </span>
                                )}

                                {normalizedStatus === "pending" && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBooking(booking)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white dark:text-red-400"
                                  >
                                    <X className="h-4 w-4" />
                                    Cancel Booking
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* Review Modal */}
        {reviewBooking && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isSubmittingReview) {
                setReviewBooking(null);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-title"
              className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                    <Star className="h-6 w-6 fill-current" />
                  </div>

                  <h2
                    id="review-title"
                    className="mt-5 text-xl font-bold text-foreground"
                  >
                    Rate this studio
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {reviewBooking.studioTitle ||
                      reviewBooking.studioName ||
                      "Your studio booking"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => setReviewBooking(null)}
                  aria-label="Close review form"
                  className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Star rating */}
              <div className="mt-7">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Your rating
                </p>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={isSubmittingReview}
                      onClick={() => setReviewRating(star)}
                      aria-label={`Rate ${star} out of 5`}
                      className="rounded-lg p-1 transition hover:scale-110 disabled:cursor-not-allowed"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                  {reviewRating === 5
                    ? "Excellent!"
                    : reviewRating === 4
                      ? "Very good"
                      : reviewRating === 3
                        ? "Good"
                        : reviewRating === 2
                          ? "Fair"
                          : "Needs improvement"}
                </p>
              </div>

              {/* Review comment */}
              <div className="mt-6">
                <label
                  htmlFor="review-comment"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Share your first impression
                </label>

                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  disabled={isSubmittingReview}
                  rows={5}
                  maxLength={1000}
                  placeholder="Share your thoughts about the studio..."
                  className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:opacity-60"
                />

                <div className="mt-1 flex justify-between gap-2 text-xs text-muted-foreground">
                  <span>Minimum 5 characters</span>
                  <span>{reviewComment.length}/1000</span>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => setReviewBooking(null)}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    isSubmittingReview || reviewComment.trim().length < 5
                  }
                  onClick={handleSubmitReview}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Rating
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {selectedBooking && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isCancelling) {
                setSelectedBooking(null);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-booking-title"
              className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <XCircle className="h-6 w-6" />
              </div>

              <h2
                id="cancel-booking-title"
                className="mt-5 text-xl font-bold text-foreground"
              >
                Cancel this booking?
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Are you sure you want to cancel your reservation for{" "}
                <span className="font-semibold text-foreground">
                  {selectedBooking.studioTitle ||
                    selectedBooking.studioName ||
                    "this studio"}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
                >
                  Keep Booking
                </button>

                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelBooking}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel Booking"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
