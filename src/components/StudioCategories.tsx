import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  Clapperboard,
  Mic2,
  Music2,
  Palette,
  AudioLines,
} from "lucide-react";

const categories = [
  {
    title: "Photo Studios",
    description: "Perfect spaces for photography and creative shoots.",
    category: "Photo Studio",
    icon: Camera,
    number: "01",
  },
  {
    title: "Film Stages",
    description: "Professional spaces for film and video production.",
    category: "Film Stage",
    icon: Clapperboard,
    number: "02",
  },
  {
    title: "Podcast Rooms",
    description: "Find the right setup for your next recording.",
    category: "Podcast Lounge",
    icon: Mic2,
    number: "03",
  },
  {
    title: "Music Suites",
    description: "Dedicated spaces to compose, rehearse and create.",
    category: "Music Suite",
    icon: Music2,
    number: "04",
  },
  {
    title: "Art Workshops",
    description: "Inspiring spaces for art, craft and hands-on work.",
    category: "Art Studio",
    icon: Palette,
    number: "05",
  },
  {
    title: "Sound Stages",
    description: "Explore professional spaces for sound production.",
    category: "Sound Stage",
    icon: AudioLines,
    number: "06",
  },
];

export default function StudioCategories() {
  return (
    <section className="bg-[#f6f4f0] px-5 py-20 text-[#1a1a2e] dark:bg-[#12111a] dark:text-white sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
              <Camera size={14} />
              Find your creative space
            </span>

            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Browse by Studio{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Categories.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
              Whatever you are creating, find a space designed to bring your
              ideas to life.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.category}
                href={`/studios?category=${encodeURIComponent(item.category)}`}
                className="group relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60 dark:border-white/10 dark:bg-[#1c1a27] dark:hover:border-indigo-400/30 dark:hover:shadow-black/20 sm:p-7"
              >
                <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-100/60 transition duration-500 group-hover:scale-150 dark:bg-indigo-500/10" />

                <div className="relative flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition duration-300 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-400/10 dark:text-indigo-300 dark:group-hover:bg-indigo-500 dark:group-hover:text-white">
                    <Icon size={27} strokeWidth={1.8} />
                  </div>

                  <span className="text-sm font-bold tracking-widest text-gray-300 dark:text-gray-600">
                    {item.number}
                  </span>
                </div>

                <div className="relative mt-9">
                  <h3 className="text-xl font-bold transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400 sm:text-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    Explore category
                    <ArrowUpRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
