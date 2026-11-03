"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Aperture,
  ArrowRight,
  Camera,
  DollarSign,
  Edit3,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

interface Studio {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  capacity: number;
  location: string;
  imageUrl: string;
  amenities: string[];
  overview: string;
  rating?: number;
  createdAt?: string;
}

export default function MyListingsPage() {
  const router = useRouter();

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace("/login");
    }
  }, [session, sessionLoading, router]);

  // Fetch user's studios only after authentication
  useEffect(() => {
    if (sessionLoading || !session) {
      return;
    }

    let ignore = false;

    const loadStudios = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/my-listings`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          throw new Error(
            `Server returned an invalid response (${response.status}). Check your backend API route.`,
          );
        }

        const result = await response.json();

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message || "Could not load your studio listings.",
          );
        }

        if (!ignore) {
          setStudios(result.studios || []);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Something went wrong while loading listings.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadStudios();

    return () => {
      ignore = true;
    };
  }, [session, sessionLoading, router]);

  // Delete studio
  const handleDelete = async () => {
    if (!selectedStudio) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_URL}/api/studios/${selectedStudio._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const contentType = response.headers.get("content-type");
      const result = contentType?.includes("application/json")
        ? await response.json()
        : null;

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result?.message || "Could not delete this studio.");
      }

      setStudios((current) =>
        current.filter((studio) => studio._id !== selectedStudio._id),
      );

      setSelectedStudio(null);
      toast.success("Studio listing deleted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredStudios = studios.filter((studio) => {
    const searchText = search.toLowerCase();

    return (
      studio.title.toLowerCase().includes(searchText) ||
      studio.category.toLowerCase().includes(searchText) ||
      studio.location.toLowerCase().includes(searchText)
    );
  });

  // Keep private page content hidden until authentication is verified
  if (sessionLoading || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Checking your session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground">
      {/* Hero */}
      <section className="px-4 pb-8 pt-10 sm:px-6 lg:pt-14">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Home
          </Link>

          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                <Aperture className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold tracking-[0.15em] text-primary">
                  HOST DASHBOARD
                </span>
              </div>

              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                My Studio <span className="text-primary">Listings.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                Manage your creative spaces, update your studio information, and
                keep your listings looking their best.
              </p>
            </div>

            <Button className="h-12 rounded-full px-6 shadow-md shadow-primary/15">
              <Link href="/add-studio">
                <Plus className="mr-2 h-4 w-4" />
                Add New Studio
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Aperture className="h-5 w-5" />}
            label="Total Listings"
            value={loading ? "—" : String(studios.length)}
          />

          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            label="Average Hourly Rate"
            value={
              loading || studios.length === 0
                ? "—"
                : `$${Math.round(
                    studios.reduce(
                      (sum, studio) => sum + studio.hourlyRate,
                      0,
                    ) / studios.length,
                  )}`
            }
          />

          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Capacity"
            value={
              loading
                ? "—"
                : String(
                    studios.reduce((sum, studio) => sum + studio.capacity, 0),
                  )
            }
          />
        </div>
      </section>

      {/* Listings */}
      <section className="px-4 pt-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold">
                Your Workspaces
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {studios.length} studio{studios.length !== 1 ? "s" : ""} in your
                listings
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search your studios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-full bg-card pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-3xl border border-border/60 bg-card"
                >
                  <div className="h-52 bg-muted" />
                  <div className="space-y-4 p-5">
                    <div className="h-5 w-2/3 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="h-10 rounded-xl bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : studios.length === 0 ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <Camera className="h-9 w-9" />
                </div>

                <h3 className="font-heading text-2xl font-bold">
                  No studios yet
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                  You haven&apos;t added any creative spaces yet. Start hosting
                  and let creators discover your studio.
                </p>

                <Button className="mt-7 h-12 rounded-full px-7">
                  <Link href="/add-studio">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Listing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : filteredStudios.length === 0 ? (
            <Card className="rounded-3xl border-border/60">
              <CardContent className="flex flex-col items-center py-14 text-center">
                <Search className="mb-4 h-8 w-8 text-muted-foreground" />
                <h3 className="font-heading text-xl font-bold">
                  No matching studios
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try searching with another title, category, or location.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredStudios.map((studio) => (
                <Card
                  key={studio._id}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="relative h-56 overflow-hidden bg-muted">
                    <img
                      src={studio.imageUrl}
                      alt={studio.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                      {studio.category}
                    </span>

                    <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      My Listing
                    </span>
                  </div>

                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-1 font-heading text-xl font-bold">
                        {studio.title}
                      </h3>

                      <div className="shrink-0 text-right">
                        <p className="font-heading text-lg font-bold text-primary">
                          ${studio.hourlyRate}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          per hour
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" />
                      <span className="line-clamp-1">{studio.location}</span>
                    </div>

                    <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
                      {studio.overview}
                    </p>

                    <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" />
                        {studio.capacity} guests
                      </span>

                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-primary" />$
                        {studio.securityDeposit} deposit
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                      <Button variant="outline" className="h-10 rounded-full">
                        <Link href={`/studios/edit/${studio._id}`}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Update
                        </Link>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedStudio(studio)}
                        className="h-10 rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {selectedStudio && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setSelectedStudio(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-3xl border border-border/60 bg-card p-6 shadow-2xl duration-200 sm:p-8"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <Trash2 className="h-6 w-6" />
              </div>

              <button
                type="button"
                disabled={deleting}
                onClick={() => setSelectedStudio(null)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 id="delete-title" className="font-heading text-2xl font-bold">
              Delete this studio?
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {selectedStudio.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setSelectedStudio(null)}
                className="h-11 rounded-full px-6"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
                className="h-11 rounded-full px-6"
              >
                {deleting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Yes, Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
