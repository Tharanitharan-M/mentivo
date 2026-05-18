import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PrinciplesSection from "@/components/landing/PrinciplesSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ComparisonSection from "@/components/landing/ComparisonSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <main className="bg-[#0b0a09] min-h-screen">
      <Navbar />
      <HeroSection />
      <PrinciplesSection />
      <FeaturesSection />
      <HowItWorks />
      <ComparisonSection />
      <CTASection />
      <Footer />
    </main>
  );
}
