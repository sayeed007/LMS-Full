"use client";

import { useGetFeaturedCoursesQuery } from "@/store/api/courseApi";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, BookOpen, ChevronRight } from "lucide-react";
import LandingButton from "./LandingButton";
import Container from "@/components/ui/Container";

const CourseShowcase = () => {
  const { data, isLoading } = useGetFeaturedCoursesQuery({ limit: 4 });
  const courses = data?.data || [];

  if (isLoading) {
    return (
      <section className="py-24 bg-gray-50">
        <Container size="xl" className="text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 bg-gray-200 w-64 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (courses.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50">
      <Container size="xl">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600">
              Hand-picked courses to get you started immediately.
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden md:flex items-center font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All Courses <ChevronRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-48 w-full bg-gray-200">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                    <BookOpen size={48} />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-900 shadow-sm">
                  {course.level}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {typeof course.category === "string"
                      ? course.category
                      : "General"}
                  </span>
                  <div className="flex items-center text-yellow-500 text-xs font-bold">
                    <Star size={12} fill="currentColor" className="mr-1" />
                    {course.rating?.average?.toFixed(1) || "4.5"}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {course.title}
                </h3>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock size={14} className="mr-1" />
                    {course.duration
                      ? Math.round(course.duration / 60) + "h"
                      : "10h"}
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {course.price > 0 ? `$${course.price}` : "Free"}
                  </span>
                </div>

                <Link
                  href={`/courses/${course._id}`}
                  className="mt-4 block w-full py-2 text-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  View Course
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <LandingButton
            href="/courses"
            variant="outline"
            className="!text-gray-900 !border-gray-300"
          >
            Browse All Courses
          </LandingButton>
        </div>
      </Container>
    </section>
  );
};

export default CourseShowcase;
