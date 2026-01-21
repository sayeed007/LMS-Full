"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import LandingButton from "./LandingButton";
import { PlayCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import StudentSummary from "@/components/common/StudentSummary";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 pt-20 pb-16">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

      <Container size="xl" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium text-sm mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
              #1 Learning Management Platform
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              Master Skills. <br />
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Build Future.
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Unlock your potential with our immersive learning experience.
              Expert-led courses, interactive projects, and a community that
              supports your growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <LandingButton href="/courses" size="lg" showArrow>
                Explore Courses
              </LandingButton>
              <LandingButton
                href="/auth/register"
                variant="secondary"
                size="lg"
              >
                Join for Free
              </LandingButton>
            </div>

            <div className="mt-12">
              <StudentSummary variant="light" />
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-1">
              <div className="bg-white rounded-2xl overflow-hidden relative aspect-[4/3] w-full">
                {/* Using the generated image */}
                <Image
                  src="/images/landing-hero.png"
                  alt="Learning Platform Illustration"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Floating Cards (Overlay) */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                  }}
                  className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 max-w-[180px]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <PlayCircle size={16} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Course completed</p>
                      <p className="font-bold text-sm text-gray-900">
                        Web Dev 101
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute bottom-12 left-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">500+</p>
                      <p className="text-xs text-gray-500">Courses</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">50k</p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
