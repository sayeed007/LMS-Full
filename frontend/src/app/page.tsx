"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

// Import Landing Components
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import CourseShowcase from "@/components/landing/CourseShowcase";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import { Container } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Show toast if user was redirected from protected route
    const redirected = searchParams.get("redirected");
    if (redirected === "true") {
      toast.error("Authentication Required", {
        description: "Please sign in to access that page.",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white py-6">
        <Hero />
        <FeatureGrid />
        <CourseShowcase />
        <Testimonials />
        <CTASection />
      </main>
    );
  }

  // Show loading state while redirecting authenticated users
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-gray-600 font-medium">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
}
