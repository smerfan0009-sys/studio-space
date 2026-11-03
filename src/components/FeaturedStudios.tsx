"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Star,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

type Studio = {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  location: string;
  imageUrl: string;
  rating?: number;
};

type ApiResponse = {
  success?: boolean;
  studios?: Studio[];
  message?: string;
};

export default function FeaturedStudios() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFeaturedStudios() {
      try {
        const response = await fetch(`${API_URL}/api/studios/featured`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const payload: ApiResponse = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(
            payload.message || "Failed to load featured studios.",
          );
        }

        if (!controller.signal.aborted) {
          setStudios(Array.isArray(payload.studios) ? payload.studios : []);
          setError("");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchFeaturedStudios();

    return () => controller.abort();
  }, [refreshKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setError("");
    setRefreshKey((previous) => previous + 1);
  };

  return (
    <section className=" px-5 py-20 text-[#1a1a2e] dark:bg-[#12111a] dark:text-white sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
              <Sparkles size={14} />
              Handpicked creative spaces
            </span>

            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Featured{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Studios.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
              Discover some of the best creative spaces for your next project,
              production or recording session.
            </p>
          </div>

          <Link
            href="/studios"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
          >
            Explore all studios
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#1c1a27]"
              >
                <div className="h-56 animate-pulse bg-gray-200 dark:bg-white/10" />
                <div className="space-y-4 p-6">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-11 animate-pulse rounded-xl bg-gray-200 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-400/20 dark:bg-red-400/5">
            <p className="font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && studios.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-14 text-center dark:border-white/15">
            <Sparkles size={35} className="mx-auto text-indigo-500" />

            <h3 className="mt-4 text-xl font-bold">No featured studios yet</h3>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              New creative spaces will appear here soon.
            </p>

            <Link
              href="/studios"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Explore Studios
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Studio Cards */}
        {!isLoading && !error && studios.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <article
                key={studio._id}
                className="group overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60 dark:border-white/10 dark:bg-[#1c1a27] dark:hover:border-indigo-400/30 dark:hover:shadow-black/20"
              >
                {/* Studio Image */}
                <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-white/5">
                  {studio.imageUrl ? (
                    <img
                      src={studio.imageUrl}
                      alt={studio.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No image available
                    </div>
                  )}

                  {/* Category Badge */}
                  <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/95 px-4 py-2 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur dark:bg-[#1c1a27]/90 dark:text-indigo-300">
                    {studio.category}
                  </span>

                  {/* Rating Badge */}
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-gray-800 shadow-sm backdrop-blur dark:bg-[#1c1a27]/90 dark:text-white">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {Number(studio.rating) > 0
                      ? Number(studio.rating).toFixed(1)
                      : "New"}
                  </span>
                </div>

                {/* Studio Information */}
                <div className="p-6">
                  <h3 className="line-clamp-1 text-xl font-bold transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {studio.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={16} className="shrink-0 text-indigo-500" />
                    <span className="line-clamp-1">{studio.location}</span>
                  </div>

                  <div className="my-5 border-t border-gray-100 dark:border-white/10" />

                  {/* Price and Details */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Starting from
                      </p>

                      <p className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        ${Number(studio.hourlyRate).toLocaleString("en-US")}
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {" "}
                          / hr
                        </span>
                      </p>
                    </div>

                    <Link
                      href={`/studios/${studio._id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
  );
}
