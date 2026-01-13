"use client";

import { motion } from "framer-motion";
import { MonitorPlay, Trophy, Users, BarChart2 } from "lucide-react";
import Container from "@/components/ui/Container";

const FeatureGrid = () => {
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
    <section className="py-24 bg-white relative overflow-hidden">
      <Container size="xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to <span className="text-blue-600">excel</span>
          </h2>
          <p className="text-xl text-gray-600">
            Our platform is built with one goal: to provide the best learning
            experience possible.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Card 1 - Large */}
          <motion.div
            variants={item}
            className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-md mb-6 group-hover:scale-110 transition-transform duration-300">
                <MonitorPlay size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                High-Definition Video Courses
              </h3>
              <p className="text-gray-600 max-w-md">
                Stream crystal clear 4K video lessons on any device. Our
                adaptive player ensures smooth playback regardless of your
                connection speed.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-white/50 to-transparent hidden md:block" />
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={item}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:rotate-6 transition-transform">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Certified Learning
            </h3>
            <p className="text-gray-600">
              Earn industry-recognized certificates for every course you
              complete.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={item}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:rotate-6 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Community First
            </h3>
            <p className="text-gray-600">
              Join study groups, discuss topics, and network with peers
              worldwide.
            </p>
          </motion.div>

          {/* Card 4 - Large */}
          <motion.div
            variants={item}
            className="md:col-span-2 bg-gray-900 rounded-3xl p-8 relative overflow-hidden group text-white"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart2 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Detailed Analytics & Progress Tracking
              </h3>
              <p className="text-gray-300 max-w-md">
                Stay on top of your goals with comprehensive learning analytics.
                Track your study time, completion rates, and quiz scores in
                real-time.
              </p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BarChart2 size={200} />
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default FeatureGrid;
