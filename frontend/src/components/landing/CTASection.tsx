"use client";

import { motion } from "framer-motion";
import LandingButton from "./LandingButton";
import Container from "@/components/ui/Container";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <Container size="xl" className="relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to start your learning journey?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
          >
            Join thousands of students and instructors on the #1 learning
            platform. Get unlimited access to courses, projects, and
            certifications.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <LandingButton
              href="/auth/register"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 hover:shadow-xl border-none"
            >
              Get Started for Free
            </LandingButton>
            <LandingButton href="/courses" variant="outline" size="lg">
              Browse Courses
            </LandingButton>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
