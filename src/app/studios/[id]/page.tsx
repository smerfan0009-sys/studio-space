"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  Clock,
  ShieldCheck,
  UserRound,
  Mail,
  CheckCircle2,
  ImageOff,
  RefreshCw,
  CalendarDays,
  CalendarCheck,
  X,
  Loader2,
  Wallet,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

interface Studio {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  capacity: number;
  location: string;
  rating: number;
  overview: string;
  amenities: string[];
  imageUrl: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FetchResult {
  id: string;
  studio: Studio | null;
  error?: string;
}

interface BookingResponse {
  success?: boolean;
  message?: string;
  booking?: {
    _id?: string;
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price);
}

function getLocalDateTimeValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function StudioDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [result, setResult] = useState<FetchResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  // Booking states
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function fetchStudio() {
      try {
        const response = await fetch(
          `${API_URL}/api/studios/${encodeURIComponent(id)}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              payload?.error ||
              (response.status === 404
                ? "Studio not found."
                : "Unable to load studio details."),
          );
        }

        const studio =
          payload?.studio ??
          payload?.data?.studio ??
          payload?.data ??
          payload?.result?.studio ??
          null;

        if (!studio || String(studio._id) !== String(id)) {
          throw new Error("The requested studio could not be found.");
        }

        if (controller.signal.aborted) return;

        setImageFailed(false);
        setResult({ id, studio });
      } catch (error) {
        if (controller.signal.aborted) return;

        setResult({
          id,
          studio: null,
          error:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        });
      }
    }

    fetchStudio();

    return () => controller.abort();
  }, [id, retryCount]);

  const isLoading = !result || result.id !== id;
  const studio = result?.id === id ? result.studio : null;
  const error = result?.id === id ? result.error : undefined;

  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

  // Check whether the logged-in user owns this studio
  const isOwner = Boolean(
    user &&
    studio &&
    (studio.ownerId === user.id ||
      (studio.ownerEmail &&
        studio.ownerEmail.toLowerCase() === user.email?.toLowerCase())),
  );

  // Calculate booking duration and price
  const bookingCalculation = useMemo(() => {
    if (!startDateTime || !endDateTime) {
      return { duration: 0, total: 0, valid: false };
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return { duration: 0, total: 0, valid: false };
    }

    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const total = duration * Number(studio?.hourlyRate || 0);

    return {
      duration,
      total,
      valid: duration >= 1 && Number.isFinite(total) && total > 0,
    };
  }, [startDateTime, endDateTime, studio?.hourlyRate]);

  const minimumDateTime = getLocalDateTimeValue(new Date());

  const handleBookingSubmit = () => {
    if (!user) {
      toast.error("Please log in before booking a studio.");
      router.push(`/login?callbackURL=${encodeURIComponent(`/studios/${id}`)}`);
      return;
    }

    if (isOwner) {
      toast.error("You cannot book your own studio.");
      return;
    }

    if (!startDateTime || !endDateTime) {
      toast.error("Please select your booking date and time.");
      return;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start <= new Date() ||
      end <= start ||
      !bookingCalculation.valid
    ) {
      toast.error(
        "Please select a valid future booking time of at least one hour.",
      );
      return;
    }

    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!studio || !user || !bookingCalculation.valid) return;

    setIsBooking(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studioId: studio._id,
          startTime: new Date(startDateTime).toISOString(),
          endTime: new Date(endDateTime).toISOString(),
        }),
      });

      const payload: BookingResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.message || "Unable to submit your booking request.",
        );
      }

      toast.success(
        payload.message || "Booking request submitted successfully!",
      );

      setShowBookingModal(false);
      setStartDateTime("");
      setEndDateTime("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsBooking(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 h-5 w-36 animate-pulse rounded bg-muted" />

          <div className="aspect-[16/8] w-full animate-pulse rounded-3xl bg-muted" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-28 animate-pulse rounded-2xl bg-muted" />
              <div className="h-36 animate-pulse rounded-2xl bg-muted" />
            </div>

            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  // Error / Not found state
  if (!studio) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ImageOff className="h-8 w-8 text-muted-foreground" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Studio not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {error ||
              "This studio may have been removed or the link may be incorrect."}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            <Link
              href="/studios"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Explore Studios
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <Link
          href="/my-bookings"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          My Bookings
        </Link>

        {/* Studio image */}
        <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl bg-muted sm:rounded-3xl">
          {!imageFailed && studio.imageUrl ? (
            <Image
              src={studio.imageUrl}
              alt={studio.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <ImageOff className="h-10 w-10" />
              <span className="text-sm">Image unavailable</span>
            </div>
          )}

          <div className="absolute left-4 top-4">
            <span className="rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
              {studio.category}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="min-w-0 space-y-8">
            {/* Title and location */}
            <section>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {studio.category}
                </span>

                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {Number(studio.rating || 0).toFixed(1)}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {studio.title}
              </h1>

              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground sm:text-base">
                <MapPin className="h-5 w-5 shrink-0" />
                {studio.location}
              </p>
            </section>

            {/* Overview */}
            <section className="border-t border-border pt-7">
              <h2 className="text-xl font-bold text-foreground">
                About This Studio
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                {studio.overview || "No description available."}
              </p>
            </section>

            {/* Studio information */}
            <section className="border-t border-border pt-7">
              <h2 className="text-xl font-bold text-foreground">
                Studio Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Hourly Rate</p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {formatPrice(Number(studio.hourlyRate || 0))}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        / hr
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Maximum Capacity
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {studio.capacity} People
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Security Deposit
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {formatPrice(Number(studio.securityDeposit || 0))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Star className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Studio Rating
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {Number(studio.rating || 0).toFixed(1)} / 5
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Amenities */}
            <section className="border-t border-border pt-7">
              <h2 className="text-xl font-bold text-foreground">
                Available Amenities
              </h2>

              {studio.amenities?.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {studio.amenities.map((amenity, index) => (
                    <div
                      key={`${amenity}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No amenities listed for this studio.
                </p>
              )}
            </section>

            {/* Host information */}
            <section className="border-t border-border pt-7">
              <h2 className="text-xl font-bold text-foreground">Hosted By</h2>

              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-7 w-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {studio.ownerName || "Studio Host"}
                  </p>

                  {studio.ownerEmail && (
                    <p className="mt-1 flex items-center gap-2 break-all text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      {studio.ownerEmail}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Studio rental price
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {formatPrice(Number(studio.hourlyRate || 0))}
                </span>
                <span className="text-sm text-muted-foreground">/ hour</span>
              </div>

              <div className="my-6 border-t border-border" />

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    Security Deposit
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(Number(studio.securityDeposit || 0))}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-semibold text-foreground">
                    {studio.capacity} People
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {Number(studio.rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-border" />

              {/* Booking form */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  Book This Studio
                </h3>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Select your preferred start and end date/time to request a
                  booking.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="booking-start"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Start date & time
                    </label>
                    <input
                      id="booking-start"
                      type="datetime-local"
                      min={minimumDateTime}
                      value={startDateTime}
                      onChange={(event) => {
                        setStartDateTime(event.target.value);
                        setShowBookingModal(false);
                      }}
                      className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-end"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      End date & time
                    </label>
                    <input
                      id="booking-end"
                      type="datetime-local"
                      min={startDateTime || minimumDateTime}
                      value={endDateTime}
                      onChange={(event) => {
                        setEndDateTime(event.target.value);
                        setShowBookingModal(false);
                      }}
                      className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Price calculation */}
                <div className="mt-5 rounded-xl bg-muted/60 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold text-foreground">
                      {bookingCalculation.valid
                        ? `${bookingCalculation.duration.toFixed(2)} hours`
                        : "—"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Hourly rate</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(Number(studio.hourlyRate || 0))}
                    </span>
                  </div>

                  <div className="my-3 border-t border-border" />

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      Estimated total
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(bookingCalculation.total)}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                    Security deposit is separate and is not included in this
                    estimate.
                  </p>
                </div>

                {isOwner ? (
                  <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center text-sm text-amber-700 dark:text-amber-400">
                    You are the host of this studio. You cannot book your own
                    listing.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={
                      isPending || isBooking || !bookingCalculation.valid
                    }
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CalendarDays className="h-4 w-4" />
                    {isPending
                      ? "Checking account..."
                      : !user
                        ? "Log in to Book"
                        : "Request Booking"}
                  </button>
                )}

                <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                  Your request will be submitted as Pending until the host
                  confirms it.
                </p>

                <Link
                  href="/my-bookings"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  My Bookings
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Booking confirmation modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isBooking) {
              setShowBookingModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </div>

                <h2
                  id="booking-modal-title"
                  className="text-xl font-bold text-foreground"
                >
                  Confirm Your Booking
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Review your booking details before submitting.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                disabled={isBooking}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-border p-4">
              <p className="font-semibold text-foreground">{studio.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {studio.category} · {studio.location}
              </p>

              <div className="my-4 border-t border-border" />

              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Start</span>
                  <span className="text-right font-medium text-foreground">
                    {new Date(startDateTime).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">End</span>
                  <span className="text-right font-medium text-foreground">
                    {new Date(endDateTime).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">
                    {bookingCalculation.duration.toFixed(2)} hours
                  </span>
                </div>
              </div>

              <div className="my-4 border-t border-border" />

              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-foreground">
                  Estimated total
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(bookingCalculation.total)}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Security deposit of{" "}
                {formatPrice(Number(studio.securityDeposit || 0))} is separate.
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
              This will create a Pending booking request. The host must confirm
              it before your reservation is finalized.
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                disabled={isBooking}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={confirmBooking}
                disabled={isBooking}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Confirm Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Suspense fallback
function StudioDetailsFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
        <div className="aspect-[16/8] rounded-3xl bg-muted" />
        <div className="mt-8 h-8 w-1/2 rounded bg-muted" />
        <div className="mt-4 h-4 w-1/3 rounded bg-muted" />
        <div className="mt-8 h-32 rounded-2xl bg-muted" />
      </div>
    </main>
  );
}

// Main page with Suspense boundary
export default function StudioDetailsPage() {
  return (
    <Suspense fallback={<StudioDetailsFallback />}>
      <StudioDetailsContent />
    </Suspense>
  );
}
