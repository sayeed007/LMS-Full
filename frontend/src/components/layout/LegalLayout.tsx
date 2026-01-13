"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalLayout = ({ title, lastUpdated, children }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <Container size="xl" padding="none">
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {title}
            </motion.h1>
            <p className="text-blue-200">Last updated: {lastUpdated}</p>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container size="xl" padding="none">
        <div className="-mt-10 mb-20 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100 prose prose-lg prose-blue max-w-4xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default LegalLayout;
