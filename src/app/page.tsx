import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar isAuthenticated={false} />
    </div>
  );
}
