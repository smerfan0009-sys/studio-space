"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Aperture,
  Camera,
  MapPin,
  DollarSign,
  Users,
  ImagePlus,
  Sparkles,
  Wifi,
  Car,
  Lightbulb,
  Volume2,
  Snowflake,
  Monitor,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

const categories = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
  "Sound Stage",
  "Art Studio",
  "Other",
];

const amenityOptions = [
  { name: "High-speed Wi-Fi", icon: Wifi },
  { name: "Free Parking", icon: Car },
  { name: "Professional Lighting", icon: Lightbulb },
  { name: "Soundproof Room", icon: Volume2 },
  { name: "Air Conditioning", icon: Snowflake },
  { name: "Monitor / Display", icon: Monitor },
];

type Studio = {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  capacity: number;
  location: string;
  imageUrl: string;
  overview: string;
  amenities: string[];
  ownerId?: string;
  ownerEmail?: string;
};

type StudioResponse = {
  success?: boolean;
  message?: string;
  studio?: Studio;
  data?: Studio | { studio?: Studio };
  result?: Studio | { studio?: Studio };
};

function isStudio(value: unknown): value is Studio {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate._id === "string" && typeof candidate.title === "string"
  );
}

function getStudioFromResponse(payload: StudioResponse): Studio | null {
  const candidates = [payload.studio, payload.data, payload.result];

  for (const candidate of candidates) {
    if (isStudio(candidate)) return candidate;

    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "studio" in candidate &&
      isStudio(candidate.studio)
    ) {
      return candidate.studio;
    }
  }

  return null;
}

// Main edit page component.
// useParams() is inside this component, which is rendered under Suspense.
function EditStudioContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const studioId = params.id;

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [isLoadingStudio, setIsLoadingStudio] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [overview, setOverview] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  // Redirect unauthenticated users.
  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  // Load existing studio.
  useEffect(() => {
    if (isPending || !user || !studioId) return;

    const controller = new AbortController();

    async function loadStudio() {
      try {
        const response = await fetch(
          `${API_URL}/api/studios/${encodeURIComponent(studioId)}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const payload: StudioResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.message || "Failed to load studio information.",
          );
        }

        const studio = getStudioFromResponse(payload);

        if (!studio) {
          throw new Error("Studio information could not be found.");
        }

        const isOwner =
          studio.ownerId === user?.id ||
          (typeof studio.ownerEmail === "string" &&
            studio.ownerEmail.toLowerCase() === user?.email.toLowerCase());

        if (!isOwner) {
          setPageError("You are not authorized to edit this studio.");
          return;
        }

        setTitle(studio.title || "");
        setCategory(studio.category || "");
        setHourlyRate(String(studio.hourlyRate ?? ""));
        setSecurityDeposit(String(studio.securityDeposit ?? ""));
        setCapacity(String(studio.capacity ?? ""));
        setLocation(studio.location || "");
        setImageUrl(studio.imageUrl || "");
        setOverview(studio.overview || "");
        setAmenities(Array.isArray(studio.amenities) ? studio.amenities : []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setPageError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the studio.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingStudio(false);
        }
      }
    }

    void loadStudio();

    return () => controller.abort();
  }, [isPending, user, studioId]);

  const toggleAmenity = (amenity: string) => {
    setAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.warning("Please log in before updating a studio.");
      router.replace("/login");
      return;
    }

    if (!title.trim() || !category || !location.trim() || !imageUrl.trim()) {
      toast.warning("Please complete all required fields.");
      return;
    }

    if (overview.trim().length < 30) {
      toast.warning("Studio overview must contain at least 30 characters.");
      return;
    }

    if (
      !Number.isFinite(Number(hourlyRate)) ||
      Number(hourlyRate) <= 0 ||
      !Number.isFinite(Number(securityDeposit)) ||
      Number(securityDeposit) < 0 ||
      !Number.isInteger(Number(capacity)) ||
      Number(capacity) < 1
    ) {
      toast.warning("Please enter valid pricing and capacity values.");
      return;
    }

    try {
      const parsedImageUrl = new URL(imageUrl);

      if (!/^https?:$/.test(parsedImageUrl.protocol)) {
        toast.warning("Please enter a valid HTTP or HTTPS image URL.");
        return;
      }
    } catch {
      toast.warning("Please enter a valid image URL.");
      return;
    }

    setIsSubmitting(true);

    const studioData = {
      title: title.trim(),
      category,
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit),
      capacity: Number(capacity),
      location: location.trim(),
      imageUrl: imageUrl.trim(),
      amenities,
      overview: overview.trim(),
    };

    try {
      const response = await fetch(
        `${API_URL}/api/studios/${encodeURIComponent(studioId)}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studioData),
        },
      );

      const result: { success?: boolean; message?: string } =
        await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (response.status === 403) {
          throw new Error("You are not authorized to update this studio.");
        }

        throw new Error(result.message || "Failed to update studio.");
      }

      toast.success("Studio updated successfully!");
      router.push("/my-listings");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending || !user || isLoadingStudio) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {isPending || !user
              ? "Checking your account..."
              : "Loading studio information..."}
          </p>
        </div>
      </main>
    );
  }

  if (pageError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-lg rounded-3xl border-border/60 shadow-sm">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <LockKeyhole className="h-7 w-7" />
            </div>

            <h1 className="font-heading text-2xl font-bold">
              Unable to Edit Studio
            </h1>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {pageError}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => router.push("/my-listings")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                My Listings
              </Button>

              <Button
                className="rounded-full"
                onClick={() => router.push("/studios")}
              >
                Explore Studios
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground">
      <section className="px-4 pb-8 pt-10 sm:px-6 lg:pb-12 lg:pt-14">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/my-listings"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Listings
          </Link>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold tracking-[0.15em] text-primary">
                  MANAGE YOUR LISTING
                </span>
              </div>

              <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Edit Your Creative <span className="text-primary">Space.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                Keep your studio information accurate and up to date for
                creators looking for their next creative space.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Aperture className="h-6 w-6" />
              </div>
              <div>
                <p className="font-heading text-lg font-bold">StudioSpace</p>
                <p className="text-xs text-muted-foreground">
                  Your space. Your opportunity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_340px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/60 px-6 py-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl">
                      Studio Information
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Update the details of your creative space.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-6 py-7 sm:px-8">
                <div className="space-y-2">
                  <Label htmlFor="title">Studio Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. The Creative Loft Studio"
                    className="h-12 rounded-xl bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Studio Category *</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="" disabled>
                      Select a studio category
                    </option>
                    {!categories.includes(category) && category && (
                      <option value={category}>{category}</option>
                    )}
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="1"
                        step="any"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-background pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit">Security Deposit ($) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="deposit"
                        type="number"
                        min="0"
                        step="any"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-background pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Max Capacity *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        step="1"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-background pl-9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardHeader className="px-6 pt-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl">
                      Studio Location
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Update where creators can find your space.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-7 pt-5 sm:px-8">
                <div className="space-y-2">
                  <Label htmlFor="location">Full Address / Location *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g. Dhanmondi, Dhaka, Bangladesh"
                    className="h-12 rounded-xl bg-background"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardHeader className="px-6 pt-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl">
                      Studio Cover Image
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Change the image displayed on your listing.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 px-6 pb-7 pt-5 sm:px-8">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                    placeholder="https://example.com/studio-image.jpg"
                    className="h-12 rounded-xl bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a new image URL to replace your current cover image.
                  </p>
                </div>

                {imageUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted">
                    <img
                      src={imageUrl}
                      alt="Studio image preview"
                      className="h-56 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 text-center">
                    <ImagePlus className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Your studio image preview
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardHeader className="px-6 pt-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl">
                      Studio Amenities
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Update the facilities available in your studio.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-7 pt-5 sm:px-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {amenityOptions.map((amenity) => {
                    const Icon = amenity.icon;
                    const selected = amenities.includes(amenity.name);

                    return (
                      <button
                        key={amenity.name}
                        type="button"
                        onClick={() => toggleAmenity(amenity.name)}
                        aria-pressed={selected}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-background text-foreground hover:border-primary/40"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="flex-1 text-sm font-medium">
                          {amenity.name}
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input"
                          }`}
                        >
                          {selected && <CheckCircle2 className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  {amenities.length} amenities selected
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardHeader className="px-6 pt-6 sm:px-8">
                <CardTitle className="font-heading text-xl">
                  About Your Studio
                </CardTitle>
                <CardDescription>
                  Update what makes your space special.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-7 sm:px-8">
                <div className="space-y-2">
                  <Label htmlFor="overview">Detailed Overview *</Label>
                  <Textarea
                    id="overview"
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    required
                    minLength={30}
                    placeholder="Describe your studio, equipment, atmosphere, facilities, and what creators can do in this space..."
                    className="min-h-40 resize-y rounded-xl bg-background leading-7"
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {overview.length} characters
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardHeader className="px-6 pt-6 sm:px-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-xl">
                      Host Information
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Your account information is protected.
                    </CardDescription>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-5 px-6 pb-7 sm:grid-cols-2 sm:px-8">
                <div className="space-y-2">
                  <Label htmlFor="hostName">Host Name</Label>
                  <Input
                    id="hostName"
                    value={user.name || ""}
                    readOnly
                    className="h-12 rounded-xl bg-muted/50 text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostEmail">Host Email</Label>
                  <Input
                    id="hostEmail"
                    type="email"
                    value={user.email || ""}
                    readOnly
                    className="h-12 rounded-xl bg-muted/50 text-muted-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full px-7"
                onClick={() => router.push("/my-listings")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 rounded-full px-8 shadow-md shadow-primary/15"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    Save Changes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-lg">
                    Listing Preview
                  </CardTitle>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-primary">
                    LIVE PREVIEW
                  </span>
                </div>
                <CardDescription>
                  Preview your changes before saving.
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-5">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Listing preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                        <Camera className="mb-2 h-9 w-9" />
                        <span className="text-xs">Studio cover image</span>
                      </div>
                    )}

                    {category && (
                      <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">
                        {category}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 p-4">
                    <h3 className="font-heading text-lg font-bold">
                      {title || "Your Studio Name"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {location || "Studio location"}
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">
                        Starting from
                      </span>
                      <span className="font-heading text-lg font-bold text-primary">
                        ${hourlyRate || "00"}
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}
                          / hr
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-primary/15 bg-primary/5 shadow-none">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold">
                    Listing Tips
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Keep photos updated",
                      text: "Use clear images that represent your current workspace.",
                    },
                    {
                      title: "Review your details",
                      text: "Accurate amenities and descriptions help creators choose.",
                    },
                    {
                      title: "Check your pricing",
                      text: "Keep your hourly rate and deposit up to date.",
                    },
                  ].map((tip, index) => (
                    <div key={tip.title} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-bold text-primary">
                        0{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{tip.title}</p>
                        <p className="mt-1 text-xs leading-6 text-muted-foreground">
                          {tip.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 rounded-2xl border border-border/60 bg-card p-5">
              <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">
                  Your listing is protected
                </h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  Only the studio owner can save changes to this listing.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

// Suspense boundary handles Next.js useParams() route data.
export default function EditStudioPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 text-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading edit studio page...
            </p>
          </div>
        </main>
      }
    >
      <EditStudioContent />
    </Suspense>
  );
}
