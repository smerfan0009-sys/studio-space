import AboutUs from "@/components/AboutUs";
import FeaturedStudios from "@/components/FeaturedStudios";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import StudioCategories from "@/components/StudioCategories";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Hero />
      <StudioCategories />
      <FeaturedStudios />
      <HowItWorks />
      <AboutUs />
    </div>
  );
}
