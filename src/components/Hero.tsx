"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Aperture,
  Sparkles,
} from "lucide-react";

const slides = [
  {
    eyebrow: "THE CREATIVE SPACE MARKETPLACE",
    title: "Your next great creation starts here.",
    description:
      "Discover inspiring studios, professional production spaces, and creative environments built for your next big idea.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=85",
    category: "Creative Workspace",
    number: "01",
  },
  {
    eyebrow: "MADE FOR CREATORS",
    title: "Find the perfect space for your vision.",
    description:
      "From photography studios to cinematic sound stages, find the right environment to bring your imagination to life.",
    image:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=1600&q=85",
    category: "Photography & Production",
    number: "02",
  },
  {
    eyebrow: "TURN YOUR SPACE INTO OPPORTUNITY",
    title: "Your studio deserves to be discovered.",
    description:
      "List your creative space, connect with passionate creators, and turn unused studio hours into new opportunities.",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&q=85",
    category: "For Studio Owners",
    number: "03",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  const previousSlide = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[activeSlide];

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative w-full overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:pb-20 lg:pt-16">
        <div className="mx-auto w-full max-w-7xl">
          {/* Main Hero */}
          <div className="relative grid min-h-[540px] items-center gap-10 overflow-hidden rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-10 lg:min-h-[570px] lg:grid-cols-[1fr_0.95fr] lg:gap-8 lg:p-12">
            {/* Decorative background */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

            {/* Left Content */}
            <div className="relative z-10 flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold tracking-[0.12em] text-primary">
                  {slide.eyebrow}
                </span>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="w-full"
                >
                  <h1 className="max-w-xl font-heading text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.65rem]">
                    {activeSlide === 0 ? (
                      <>
                        Your next great creation{" "}
                        <span className="text-primary">starts here.</span>
                      </>
                    ) : (
                      slide.title
                    )}
                  </h1>

                  <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
                    {slide.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* CTA Buttons */}
              <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/studios"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-md shadow-primary/15 transition-colors hover:bg-primary/90"
                >
                  Explore Studios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href="/studios/new"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-7 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Host Your Space
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border pt-7">
                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">
                    500+
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Creative Spaces
                  </p>
                </div>

                <div className="h-9 w-px bg-border" />

                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">
                    2K+
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Happy Creators
                  </p>
                </div>

                <div className="h-9 w-px bg-border" />

                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">
                    24/7
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Creator Support
                  </p>
                </div>
              </div>
            </div>

            {/* Right Image Slider */}
            <div className="relative z-10 min-h-[320px] w-full lg:h-[460px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0 overflow-hidden rounded-[1.5rem] bg-muted"
                >
                  <img
                    src={slide.image}
                    alt={slide.category}
                    className="h-full min-h-[320px] w-full object-cover"
                  />

                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/5" />

                  {/* Top Label */}
                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-white backdrop-blur-md">
                    <Aperture className="h-4 w-4" />
                    <span className="text-xs font-medium tracking-wide">
                      STUDIOSPACE
                    </span>
                  </div>

                  {/* Bottom Information */}
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white sm:p-8">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                      Featured Experience
                    </p>

                    <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                      {slide.category}
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-white/75">
                      Discover spaces designed to inspire your creativity.
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 sm:bottom-7 sm:right-7">
                <button
                  onClick={previousSlide}
                  aria-label="Previous slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Slider Pagination */}
          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="mr-2 font-heading text-sm font-semibold text-foreground">
              {slide.number}
            </span>

            {slides.map((item, index) => (
              <button
                key={item.number}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeSlide === index ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? "w-10 bg-primary"
                    : "w-5 bg-border hover:bg-primary/50"
                }`}
              />
            ))}

            <span className="ml-2 text-sm text-muted-foreground">03</span>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
