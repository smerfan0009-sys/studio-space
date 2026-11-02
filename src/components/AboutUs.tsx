import {
  Camera,
  Clapperboard,
  Headphones,
  Mic2,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

const creatorTypes = [
  {
    icon: Camera,
    label: "Photographers",
  },
  {
    icon: Video,
    label: "Videographers",
  },
  {
    icon: Mic2,
    label: "Podcasters",
  },
  {
    icon: Headphones,
    label: "Musicians",
  },
  {
    icon: Clapperboard,
    label: "Filmmakers",
  },
];

const highlights = [
  {
    number: "01",
    title: "Discover Unique Spaces",
    description:
      "Explore inspiring studios and production spaces that fit your creative vision.",
  },
  {
    number: "02",
    title: "Connect Creators & Hosts",
    description:
      "Bring creative people and studio owners together through one accessible platform.",
  },
  {
    number: "03",
    title: "Make Creativity Possible",
    description:
      "Make it easier to find the right environment and focus on creating something great.",
  },
];

export default function AboutUs() {
  return (
    <section
      id="about"
      aria-labelledby="about-us-heading"
      className="scroll-mt-28 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold tracking-[0.16em] text-primary">
              GET TO KNOW US
            </span>
          </div>

          <h2
            id="about-us-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            About <span className="text-primary">StudioSpace</span>
          </h2>

          <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
            We believe every great idea deserves the perfect space. StudioSpace
            makes discovering and sharing creative workspaces easier for
            everyone.
          </p>
        </div>

        {/* Main About Content */}
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image */}
          <div className="group relative min-h-[350px] overflow-hidden rounded-3xl border border-border/60 shadow-sm sm:min-h-[450px]">
            <img
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85"
              alt="A bright and modern creative studio workspace"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute bottom-7 left-7 right-7 sm:bottom-10 sm:left-10 sm:right-10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium tracking-wide">
                  A SPACE FOR EVERY IDEA
                </span>
              </div>

              <h3 className="max-w-md text-2xl font-bold leading-tight text-white sm:text-4xl">
                Great Spaces.
                <br />
                Greater Possibilities.
              </h3>

              <p className="mt-3 max-w-md text-sm leading-7 text-white/80 sm:text-base">
                Bringing creative minds and inspiring spaces together.
              </p>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col justify-center">
            <span className="mb-4 text-sm font-semibold tracking-[0.16em] text-primary">
              OUR STORY & MISSION
            </span>

            <h3 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              More Than Just a Space.
              <br />
              <span className="text-primary">A Place to Create.</span>
            </h3>

            <p className="mt-6 text-base leading-8 text-muted-foreground">
              Finding the right creative environment should not be complicated.
              Whether you are planning a photoshoot, recording a podcast,
              producing a film, or making music, the right space can make all
              the difference.
            </p>

            <p className="mt-4 text-base leading-8 text-muted-foreground">
              StudioSpace is a peer-to-peer creative workspace marketplace where
              studio owners can share their spaces and creators can discover,
              explore, and reserve places that bring their ideas to life.
            </p>

            {/* Creator Types */}
            <div className="mt-8">
              <h4 className="mb-4 text-sm font-bold text-foreground">
                BUILT FOR EVERY KIND OF CREATOR
              </h4>

              <div className="flex flex-wrap gap-2">
                {creatorTypes.map((creator) => {
                  const Icon = creator.icon;

                  return (
                    <div
                      key={creator.label}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {creator.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mission Highlights */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.number}
              className="rounded-3xl border border-border/60 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>

                <span className="text-2xl font-bold text-muted-foreground/30">
                  {item.number}
                </span>
              </div>

              <h4 className="text-lg font-bold text-foreground">
                {item.title}
              </h4>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
