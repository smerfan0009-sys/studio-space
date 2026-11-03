"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  ArrowUpRight,
  RefreshCw,
  Camera,
  X,
  Building2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

type Studio = {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit?: number;
  capacity?: number;
  location: string;
  imageUrl: string;
  rating?: number;
  overview?: string;
  amenities?: string[];
  createdAt?: string | Date;
};

const categories = [
  "All Studios",
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
  "Sound Stage",
  "Art Studio",
  "Other",
];

type SortOption = "newest" | "rating" | "price-low" | "price-high";

function StudiosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const requestedCategory = searchParams.get("category");

  const initialCategory = categories.includes(requestedCategory || "")
    ? requestedCategory!
    : "All Studios";

  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Redirect users who are not logged in.
  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace(`/login?callbackURL=${encodeURIComponent("/studios")}`);
    }
  }, [isPending, user, router]);

  // Fetch studios and return data without updating React state.
  const fetchStudios = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(`${API_URL}/api/studios`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Failed to load studios.");
    }

    const studioList = Array.isArray(result)
      ? result
      : result.studios || result.data || result.result || [];

    if (!Array.isArray(studioList)) {
      throw new Error("Invalid studio data received from server.");
    }

    return studioList as Studio[];
  }, []);

  // Fetch only after authentication is confirmed.
  useEffect(() => {
    if (isPending || !user) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        const studioList = await fetchStudios(controller.signal);

        if (controller.signal.aborted) return;

        setStudios(studioList);
        setError("");
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Fetch studios error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [isPending, user, fetchStudios]);

  // Retry is triggered by a user interaction.
  const handleRetry = async () => {
    setLoading(true);
    setError("");

    try {
      const studioList = await fetchStudios();

      setStudios(studioList);
    } catch (err) {
      console.error("Fetch studios error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Search, filter and sort studios.
  const filteredStudios = useMemo(() => {
    let result = [...studios];

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter(
        (studio) =>
          studio.title?.toLowerCase().includes(query) ||
          studio.category?.toLowerCase().includes(query) ||
          studio.location?.toLowerCase().includes(query),
      );
    }

    if (activeCategory !== "All Studios") {
      result = result.filter((studio) => studio.category === activeCategory);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);

        case "price-low":
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);

        case "price-high":
          return (b.hourlyRate || 0) - (a.hourlyRate || 0);

        case "newest": {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();

          return dateB - dateA;
        }

        default:
          return 0;
      }
    });

    return result;
  }, [studios, search, activeCategory, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All Studios");
    setSortBy("newest");
  };

  // Hide the page while checking authentication or redirecting.
  if (isPending || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f4f0] dark:bg-[#12111a]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            Checking your login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f4f0] text-[#1a1a2e] dark:bg-[#12111a] dark:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-5 pb-12 pt-20 sm:px-8 sm:pb-16 sm:pt-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />

        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl dark:bg-pink-500/10" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
              <Camera size={14} />
              Explore creative spaces
            </span>

            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Find the Perfect
              <span className="mt-2 block text-indigo-600 dark:text-indigo-400">
                Space to Create.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-400 sm:text-lg">
              Discover inspiring studios and creative spaces for your next big
              idea. From photography to music, find a space that brings your
              vision to life.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="rounded-full border border-gray-200 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5">
                {studios.length} Creative Spaces
              </span>

              <span className="rounded-full border border-gray-200 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5">
                Flexible Hourly Booking
              </span>

              <span className="rounded-full border border-gray-200 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5">
                Unique Locations
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Studios Section */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Search and Filter */}
          <div className="mb-8 rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1c1a27] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by studio name, category or location..."
                  className="h-13 w-full rounded-2xl border border-gray-200 bg-[#f9f8f6] py-3.5 pl-12 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-indigo-500/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 lg:w-64">
                <SlidersHorizontal
                  size={19}
                  className="shrink-0 text-gray-400"
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-13 w-full rounded-2xl border border-gray-200 bg-[#f9f8f6] px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-[#252332] dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Category Filters */}
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Browse by category
              </p>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isActive = activeCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                          : "border border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Discover your next workspace
              </p>

              <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                Explore Studios
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {loading
                  ? "Finding creative spaces..."
                  : `Showing ${filteredStudios.length} of ${studios.length} studios`}
              </p>
            </div>

            {(search || activeCategory !== "All Studios") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#1c1a27]"
                >
                  <div className="aspect-[4/3] animate-pulse bg-gray-200 dark:bg-white/10" />

                  <div className="space-y-4 p-5">
                    <div className="h-4 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-white/10" />
                    <div className="h-6 w-3/4 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
                    <div className="h-4 w-1/2 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
                    <div className="h-11 animate-pulse rounded-xl bg-gray-200 dark:bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-3xl border border-red-200 bg-white px-6 py-16 text-center dark:border-red-400/20 dark:bg-[#1c1a27]">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-400/10">
                <RefreshCw size={27} />
              </div>

              <h3 className="text-xl font-bold">Could not load studios</h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500 dark:text-gray-400">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRetry}
                disabled={loading}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredStudios.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-white/15 dark:bg-[#1c1a27]">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-300">
                <Building2 size={34} />
              </div>

              <h3 className="text-xl font-bold">No studios found</h3>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-gray-500 dark:text-gray-400">
                We couldn&apos;t find any studios matching your search. Try
                another keyword or category.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Studio Cards */}
          {!loading && !error && filteredStudios.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudios.map((studio) => (
                <article
                  key={studio._id}
                  className="group overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/60 dark:border-white/10 dark:bg-[#1c1a27] dark:hover:shadow-black/20"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-indigo-100 to-pink-100 dark:from-indigo-950 dark:to-purple-950">
                    <div className="absolute inset-0 z-0 flex items-center justify-center">
                      <Camera size={45} className="text-indigo-400/60" />
                    </div>

                    {studio.imageUrl && (
                      <img
                        src={studio.imageUrl}
                        alt={studio.title}
                        loading="lazy"
                        className="absolute inset-0 z-10 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <span className="absolute left-4 top-4 z-20 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#1c1a27]/90 dark:text-indigo-300">
                      {studio.category}
                    </span>

                    <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm backdrop-blur-md dark:bg-[#1c1a27]/95 dark:text-white">
                      <Star
                        size={13}
                        className="fill-amber-400 text-amber-400"
                      />
                      {typeof studio.rating === "number"
                        ? studio.rating.toFixed(1)
                        : "New"}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin size={14} className="shrink-0 text-indigo-500" />
                      <span className="truncate">{studio.location}</span>
                    </div>

                    <h3 className="line-clamp-1 text-xl font-bold transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {studio.title}
                    </h3>

                    <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {studio.overview ||
                        "A creative space ready for your next project."}
                    </p>

                    <div className="my-5 border-t border-gray-100 dark:border-white/10" />

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400">Starting from</p>

                        <p className="mt-1 text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                          $
                          {Number(studio.hourlyRate || 0).toLocaleString(
                            "en-US",
                          )}
                          <span className="ml-1 text-xs font-medium text-gray-400">
                            / hr
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/studios/${studio._id}`}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-none sm:px-5 sm:text-sm"
                      >
                        View Details
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function StudiosPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f6f4f0] px-5 py-24 dark:bg-[#12111a] sm:px-8">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="mx-auto h-10 max-w-md rounded-xl bg-gray-200 dark:bg-white/10" />
            <div className="mx-auto mt-5 h-5 max-w-xl rounded-lg bg-gray-200 dark:bg-white/10" />

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 rounded-3xl bg-gray-200 dark:bg-white/10"
                />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <StudiosContent />
    </Suspense>
  );
}
