"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
  Upload,
  X,
  Check,
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

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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

export default function AddStudioPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [overview, setOverview] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const toggleAmenity = (amenity: string) => {
    setAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    );
  };

  const handleFileChange = (file?: File) => {
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WebP or GIF image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be 5 MB or less.");
      return;
    }

    if (localPreview) URL.revokeObjectURL(localPreview);

    setSelectedFile(file);
    setLocalPreview(URL.createObjectURL(file));
    setImageUrl("");
  };

  const removeImage = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);

    setSelectedFile(null);
    setLocalPreview("");
    setImageUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) return imageUrl;

    const formData = new FormData();
    formData.append("image", selectedFile);

    const response = await fetch(`${API_URL}/api/upload-image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      throw new Error(result.message || "Image upload failed.");
    }

    if (!result.imageUrl) {
      throw new Error("Image uploaded, but no image URL was returned.");
    }

    return result.imageUrl;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.warning("Please log in before publishing a studio.");
      router.replace("/login");
      return;
    }

    if (!selectedFile && !imageUrl) {
      toast.error("Please select a studio cover image.");
      return;
    }

    if (
      Number(hourlyRate) < 1 ||
      Number(securityDeposit) < 0 ||
      Number(capacity) < 1
    ) {
      toast.error("Please enter valid pricing and capacity values.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      if (selectedFile) {
        setIsUploading(true);
        toast.info("Uploading your studio image...");

        finalImageUrl = await uploadImage();

        setImageUrl(finalImageUrl);
        setSelectedFile(null);
        setLocalPreview("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        toast.success("Image uploaded successfully!");
      }

      setIsUploading(false);

      const studioData = {
        title: title.trim(),
        category,
        hourlyRate: Number(hourlyRate),
        securityDeposit: Number(securityDeposit),
        capacity: Number(capacity),
        location: location.trim(),
        imageUrl: finalImageUrl,
        amenities,
        overview: overview.trim(),
      };

      const response = await fetch(`${API_URL}/api/studios`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studioData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        throw new Error(result.message || "Failed to create studio.");
      }

      toast.success("Studio created successfully!");
      router.push("/my-listings");
      router.refresh();
    } catch (error) {
      setIsUploading(false);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  const previewImage = localPreview || imageUrl;

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground">
      <section className="px-4 pb-8 pt-10 sm:px-6 lg:pb-12 lg:pt-14">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold tracking-[0.15em] text-primary">
                  HOST YOUR SPACE
                </span>
              </div>

              <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Bring Your Creative{" "}
                <span className="text-primary">Space to Life.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                Share your creative environment with a community of creators.
                List your studio and turn your space into an opportunity.
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
                      Tell creators about your creative space.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-6 py-7 sm:px-8">
                <div className="space-y-2">
                  <Label htmlFor="title">Studio Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. The Creative Loft Studio"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a memorable name for your studio.
                  </p>
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
                        placeholder="50"
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
                        placeholder="100"
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
                        placeholder="10"
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
                      Help creators find your space.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-7 pt-5 sm:px-8">
                <div className="space-y-2">
                  <Label htmlFor="location">Full Address / Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Dhanmondi, Dhaka, Bangladesh"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
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
                      Upload a high-quality image of your workspace.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 px-6 pb-7 pt-5 sm:px-8">
                <input
                  ref={fileInputRef}
                  id="studioImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />

                {!previewImage ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-5 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold">
                      Click to upload studio image
                    </span>
                    <span className="mt-2 text-xs text-muted-foreground">
                      JPG, PNG, WebP or GIF · Maximum 5 MB
                    </span>
                  </button>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border/60">
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Studio cover preview"
                        className="h-64 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={isSubmitting}
                        aria-label="Remove image"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {selectedFile ? selectedFile.name : "Image uploaded"}
                        </span>
                      </div>
                      {selectedFile && (
                        <span className="text-xs text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Image will be uploaded when you publish your studio.
                  </p>
                )}

                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Uploading image...
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
                      Select everything available in your studio.
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
                  Describe what makes your space special.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-7 sm:px-8">
                <div className="space-y-2">
                  <Label htmlFor="overview">Detailed Overview *</Label>
                  <Textarea
                    id="overview"
                    placeholder="Describe your studio, equipment, atmosphere, facilities, and what creators can do in this space..."
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    required
                    minLength={30}
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
                      Your account information will be attached to this listing.
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
                onClick={() => router.push("/")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="h-12 rounded-full px-8 shadow-md shadow-primary/15"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? "Uploading image..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    Publish Studio
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
                  A preview of how your listing may appear.
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-5">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {previewImage ? (
                      <img
                        src={previewImage}
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
                    Hosting Tips
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Use great photos",
                      text: "Bright, clear images help creators imagine your space.",
                    },
                    {
                      title: "Be transparent",
                      text: "Mention equipment, facilities, and any important rules.",
                    },
                    {
                      title: "Set fair pricing",
                      text: "Choose a competitive hourly rate for your area.",
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
                <h3 className="text-sm font-semibold">Your space matters</h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  Give creators the details they need to find the right
                  environment for their next project.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
