"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  Camera,
  Eye,
  EyeOff,
  Sparkles,
  Mail,
  Lock,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getSafeCallbackURL() {
  if (typeof window === "undefined") return "/";

  const callbackURL = new URLSearchParams(window.location.search).get(
    "callbackURL",
  );

  // Only allow safe internal application paths.
  if (
    !callbackURL ||
    !callbackURL.startsWith("/") ||
    callbackURL.startsWith("//") ||
    callbackURL.startsWith("/login")
  ) {
    return "/";
  }

  return callbackURL;
}

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading || isGoogleLoading) return;

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const callbackURL = getSafeCallbackURL();

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }

      toast.success("Welcome back to StudioSpace!");
      router.replace(callbackURL);
      router.refresh();
    } catch {
      toast.error(
        "Unable to sign in. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading || isGoogleLoading) return;

    setIsGoogleLoading(true);

    const callbackURL = getSafeCallbackURL();

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${callbackURL}`,
      });

      if (error) {
        toast.error(error.message || "Google sign-in failed.");
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Unable to connect to Google authentication.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl lg:grid-cols-2">
        {/* Left visual section */}
        <div className="relative hidden overflow-hidden bg-[#17152b] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/40 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-pink-500/30 blur-[100px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Camera className="h-6 w-6 text-pink-300" />
            </div>
            <span className="font-heading text-2xl font-bold">StudioSpace</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 max-w-md"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-pink-200">
              <Sparkles className="h-4 w-4" />
              Welcome back, creator
            </div>

            <h1 className="font-heading text-5xl font-bold leading-tight">
              Your next
              <span className="block text-pink-300">idea starts here.</span>
            </h1>

            <p className="mt-6 text-base leading-8 text-white/65">
              Sign in to discover creative spaces, manage your studio listings,
              and connect with the creative community.
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="font-heading text-xl italic text-white/90">
                Great ideas need the right space.
              </p>
              <p className="mt-3 text-sm text-white/45">
                Find your space. Create something amazing.
              </p>
            </div>
          </motion.div>

          <p className="relative z-10 text-sm text-white/40">
            © 2026 StudioSpace. Made for creators.
          </p>
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Camera className="h-5 w-5" />
              </div>
              <span className="font-heading text-xl font-bold">
                StudioSpace
              </span>
            </Link>

            <div className="mb-8">
              <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                WELCOME BACK
              </div>

              <h2 className="font-heading text-3xl font-bold tracking-tight">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Enter your details to access your StudioSpace account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={isLoading || isGoogleLoading}
                    className="h-12 rounded-xl bg-background pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={isLoading || isGoogleLoading}
                    className="h-12 rounded-xl bg-background pl-11 pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
              >
                {isLoading ? "Signing in..." : "Login"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleLogin}
              className="h-12 w-full rounded-xl"
            >
              <svg
                viewBox="0 0 48 48"
                className="mr-2 h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.94 13.72 17.47 9.5 24 9.5Z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.72 5.99c4.51-4.17 7.05-10.3 7.05-17.64Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.04 28.59A14.4 14.4 0 0 1 9.25 24c0-1.59.28-3.13.79-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.48-6.19Z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.47 0 11.91-2.13 15.89-5.81l-7.72-5.99c-2.14 1.44-4.88 2.3-8.17 2.3-6.53 0-12.06-4.22-14.04-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                />
              </svg>

              {isGoogleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </Button>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
