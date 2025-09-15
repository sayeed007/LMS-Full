"use client"
import Image from "next/image";
import { useState } from "react";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

const stats = [
  { label: "Total Learner", value: 120, icon: "👤" },
  { label: "Total Course Created", value: 35, icon: "📚" },
  { label: "Total Article", value: 45, icon: "🗓️" },
  { label: "Total Question Bank", value: 24, icon: "📝" },
];

const courses = [
  {
    title: "Database for Software Developers",
    author: "Sufian Huzufi",
    desc: "Relational (MSSQL) | MSSQL Server Installation...",
    completed: true,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
    meta: "4 Chapter | 15 Lesson | 3 Quiz's",
  },
  {
    title: "SQA: Manual & Automated Testing",
    author: "Sufian Huzufi",
    desc: "SQA: Manual & Automated Testing covers the essential practices...",
    completed: true,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
    meta: "4 Chapter | 15 Lesson | 3 Quiz's",
  },
  {
    title: "Full Stack Web Development with Python",
    author: "Sufian Huzufi",
    desc: "SQA: Manual & Automated Testing covers the essential practices...",
    completed: false,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    meta: "4 Chapter | 15 Lesson | 3 Quiz's",
  },
  {
    title: "App Development with Flutter",
    author: "Sufian Huzufi",
    desc: "Flutter অ্যাপ ডেভেলপমেন্ট...",
    completed: true,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    meta: "4 Chapter | 15 Lesson | 3 Quiz's",
  },
];

const analytics = [
  { label: "Published", value: 50.36, color: "#40A578" },
  { label: "In Progress", value: 30.14, color: "#4378FF" },
  { label: "Drafts", value: 20.24, color: "#F29C4C" },
];

const completionData = [
  { label: "Database for Software Developers", value: 80 },
  { label: "SQA: Manual & Automated Testing", value: 120 },
  { label: "Full Stack Web Development with Python", value: 200 },
  { label: "Database for Software Developers", value: 100 },
  { label: "SQA: Manual & Automated Testing", value: 60 },
  { label: "Full Stack Web Development with Python", value: 150 },
  { label: "Database for Software Developers", value: 90 },
  { label: "SQA: Manual & Automated Testing", value: 110 },
];

const categories = ["Design & Development", "Business", "Marketing"];

export default function DashboardPage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const visibleCourses = courses.slice(carouselIndex, carouselIndex + 3);

  return (
    <div className="min-h-screen bg-off-white-1">
      <Container size="xl" padding="none">
        <PageHeader title="Dashboard" />

        <div className="space-y-8">
          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{stat.icon}</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </section>

          {/* Ongoing Course Carousel & Analytics */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Carousel */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Ongoing Courses</h2>
              <div className="flex items-center gap-4">
                <button
                  className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  onClick={() => setCarouselIndex(Math.max(carouselIndex - 1, 0))}
                  disabled={carouselIndex === 0}
                >
                  ◀
                </button>

                <div className="flex gap-4 overflow-hidden flex-1">
                  {visibleCourses.map((course) => (
                    <div
                      key={course.title}
                      className="bg-white rounded-xl shadow-sm w-68 min-w-[272px] flex-shrink-0 hover:shadow-md transition-shadow"
                    >
                      <Image
                        src={course.image}
                        alt={course.title}
                        width={1400}
                        height={128}
                        className="rounded-t-xl h-32 w-full object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1 text-gray-900 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          by {course.author}
                        </p>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {course.desc}
                        </p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          {course.meta.split("|").map((m) => (
                            <span key={m.trim()} className="bg-gray-100 px-2 py-1 rounded">
                              {m.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  onClick={() =>
                    setCarouselIndex(
                      Math.min(carouselIndex + 1, courses.length - 3)
                    )
                  }
                  disabled={carouselIndex >= courses.length - 3}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Course Analytics</h2>
              {/* Pie chart (SVG) */}
              <svg width="160" height="160" viewBox="0 0 32 32" className="mb-6">
                {/* Published: 50.36% */}
                <circle r="16" cx="16" cy="16" fill="white" />
                <path d="M16 16 L16 0 A16 16 0 0 1 31.2 21.1 Z" fill="#40A578" />
                {/* In Progress: 30.14% */}
                <path
                  d="M16 16 L31.2 21.1 A16 16 0 0 1 7.1 30.8 Z"
                  fill="#4378FF"
                />
                {/* Drafts: 20.24% */}
                <path d="M16 16 L7.1 30.8 A16 16 0 0 1 16 0 Z" fill="#F29C4C" />
              </svg>
              <ul className="w-full space-y-2">
                {analytics.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: item.color }}
                    ></span>
                    <span className="text-sm text-gray-900 flex-1">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Completion Rate & Dropdown */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Course Completion Rate</h2>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {/* Bar Chart (SVG) */}
            <div className="w-full overflow-x-auto">
              <svg width={completionData.length * 80} height="250">
                {/* Y axis lines */}
                {[0, 50, 100, 150, 200, 250].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2={completionData.length * 80}
                    y1={250 - y}
                    y2={250 - y}
                    stroke="#F4F6F8"
                    strokeWidth="1"
                  />
                ))}
                {/* Bars */}
                {completionData.map((d, i) => (
                  <g key={`${i}-${d.label}`}>
                    <rect
                      x={i * 80 + 20}
                      y={250 - d.value}
                      width="40"
                      height={d.value}
                      fill={i === 2 ? "#4378FF" : "#E5E7EB"}
                      rx="8"
                    />
                    <text
                      x={i * 80 + 40}
                      y={250 - d.value - 10}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#1F2937"
                    >
                      {d.value}
                    </text>
                    <text
                      x={i * 80 + 40}
                      y={250 - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6B7280"
                      transform={`rotate(-30,${i * 80 + 40},${250 - 5})`}
                    >
                      {d.label.length > 18 ? d.label.slice(0, 18) + "..." : d.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}