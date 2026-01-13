"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Image from "next/image";
import Container from "@/components/ui/Container";

const testimonials = [
  {
    content:
      "This platform completely transformed my career. The courses are well-structured, and the community is incredibly supportive. I landed my dream job within 3 months!",
    author: "Sarah Johnson",
    role: "Full Stack Developer",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    content:
      "I've tried many learning platforms, but this one stands out. The interactive lessons and real-world projects made all the difference in my understanding of complex topics.",
    author: "Michael Chen",
    role: "Data Scientist",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
  {
    content:
      "The quality of instruction is world-class. Being able to track my progress and earn certificates gave me the motivation I needed to keep learning every day.",
    author: "Elena Rodriguez",
    role: "UX Designer",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <Container size="xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
            <Quote className="text-blue-600 w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by learners <span className="text-blue-600">worldwide</span>
          </h2>
          <p className="text-xl text-gray-600">
            Don&apos;t just take our word for it. Here&apos;s what our community
            says.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-gray-50 rounded-2xl p-8 relative"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>

              <p className="text-gray-700 italic leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="absolute -bottom-4 right-8 text-9xl text-gray-200 opacity-20 font-serif leading-none select-none">
                &quot;
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
