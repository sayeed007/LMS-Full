"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StudentSummary from "@/components/common/StudentSummary";

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  image?: string;
  linkText?: string;
  linkHref?: string;
  linkUrl?: string;
}

export default function AuthLayoutWrapper({
  children,
  title,
  subtitle,
  image = "/images/landing-hero.png",
  linkText,
  linkHref,
}: AuthLayoutWrapperProps) {
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 font-poppins overflow-hidden">
      {/* Left Side - Hero/Image */}
      <div className="hidden lg:flex w-1/2 relative bg-dark items-center justify-center overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 bg-dark z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-earth-green rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src={image}
            alt="Auth Background"
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent"></div>
        </div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="mb-6">
              <Image
                src="/TafuriHR_logo.png"
                alt="Tafuri HR"
                width={180}
                height={40}
                className="brightness-0 invert opacity-90"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Build your future with{" "}
              <span className="text-earth-green">Excellence</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Join thousands of learners and professionals mastering the latest
              skills in technology and business.
            </p>

            <div className="flex gap-4">
              <StudentSummary variant="dark" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-8 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-earth-green transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {subtitle}
            </p>
          </div>

          {children}

          {linkText && linkHref && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {linkText === "Sign up"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <Link
                  href={linkHref}
                  className="font-semibold text-earth-green hover:text-earth-green/80 transition-colors"
                >
                  {linkText}
                </Link>
              </p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Tafuri HR. All rights reserved.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
