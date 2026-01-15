"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

/**
 * AuthRedirect component
 * Redirects users to landing page when they're logged out on protected routes
 * Add this component to layouts/pages that require authentication
 */
export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    // Only redirect if user WAS authenticated and is NOW logged out
    // This prevents redirect on initial page load
    if (wasAuthenticated.current && !isAuthenticated) {
      console.info("User logged out - redirecting to landing page");
      router.push("/");
    }

    // Update the ref for next render
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, router]);

  return null; // This component doesn't render anything
}
