"use client";

import Container from "@/components/ui/Container";
import { Users, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutUs() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 py-20 lg:py-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="xl" className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium text-sm mb-8">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                Our Story
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-[1.1]">
                Empowering the World to <br />
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Learn & Grow
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-12">
                We&apos;re on a mission to democratize education by connecting
                learners and instructors worldwide through an intuitive,
                powerful, and accessible platform.
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <Container size="xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              { label: "Students", value: "50k+" },
              { label: "Courses", value: "500+" },
              { label: "Instructors", value: "100+" },
              { label: "Global Rating", value: "4.8/5" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50 relative">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Core <span className="text-blue-600">Values</span>
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do at our platform.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Target,
                title: "Our Mission",
                desc: "To create a global learning community where anyone can access high-quality education.",
                color: "blue",
              },
              {
                icon: Users,
                title: "Community First",
                desc: "We believe in the power of social learning. Our platform fosters collaboration and peer support.",
                color: "purple",
              },
              {
                icon: Zap,
                title: "Innovation",
                desc: "We're constantly pushing the boundaries of ed-tech to provide the most engaging tools.",
                color: "green",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={item}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 group"
              >
                <div
                  className={`w-14 h-14 bg-${feature.color}-50 rounded-2xl flex items-center justify-center text-${feature.color}-600 mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Join Us CTA */}
      <section className="py-24 bg-white overflow-hidden">
        <Container size="xl">
          <div className="bg-gray-900 rounded-3xl p-12 md:p-20 relative overflow-hidden text-center">
            {/* Background blobs for dark card */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to start your journey?
              </h2>
              <p className="text-gray-300 text-lg mb-10">
                Join thousands of learners from around the world and start
                mastering new skills today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
