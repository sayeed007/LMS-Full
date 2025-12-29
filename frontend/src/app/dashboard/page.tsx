"use client"
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import { useAppSelector } from "@/store/hooks";
import {
  useGetDashboardStatsQuery,
  useGetOngoingCoursesQuery,
  useGetCourseAnalyticsQuery,
  useGetCompletionRateDataQuery,
  useGetDashboardCategoriesQuery,
} from "@/store/api/dashboardApi";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const user = useAppSelector((state) => state.auth.user);
  console.log(user)
  const isInstructor = user?.role === 'instructor' || user?.role === 'org_admin' || user?.role === 'super_admin';

  // Handle error messages from middleware redirects
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'forbidden') {
      toast.error('Access Denied', {
        description: 'You do not have permission to access admin pages.',
      });
    }
  }, [searchParams]);

  // Fetch dashboard data
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: ongoingCoursesData, isLoading: coursesLoading } = useGetOngoingCoursesQuery({ limit: 10 });
  const { data: analyticsData, isLoading: analyticsLoading } = useGetCourseAnalyticsQuery(undefined, {
    skip: !isInstructor,
  });
  const { data: categoriesData } = useGetDashboardCategoriesQuery(undefined, {
    skip: !isInstructor,
  });
  const { data: completionData, isLoading: completionLoading } = useGetCompletionRateDataQuery(
    { category: selectedCategory || undefined },
    { skip: !isInstructor }
  );

  // Extract data
  const stats = statsData?.data;
  const ongoingCourses = ongoingCoursesData?.data || [];
  const analytics = analyticsData?.data;
  const categories = categoriesData?.data || [];
  const completionRateData = completionData?.data || [];

  // Prepare stats cards based on user role
  const statsCards = useMemo(() => {
    if (!stats) return [];

    if (isInstructor && 'totalCourseCreated' in stats) {
      return [
        { label: "Total Learner", value: stats.totalLearner, icon: "/icons/TotalLearner.png" },
        { label: "Total Course Created", value: stats.totalCourseCreated, icon: "/icons/TotalCourseCreated.png" },
        { label: "Total Article", value: stats.totalArticle, icon: "/icons/TotalArticle.png" },
        { label: "Total Question Bank", value: stats.totalQuestionBank, icon: "/icons/TotalQuestionBank.png" },
      ];
    } else if ('totalEnrolledCourses' in stats) {
      return [
        { label: "Enrolled Courses", value: stats.totalEnrolledCourses, icon: "/icons/TotalCourseCreated.png" },
        { label: "Completed Courses", value: stats.totalCompletedCourses, icon: "/icons/TotalLearner.png" },
        { label: "In Progress", value: stats.totalInProgressCourses, icon: "/icons/TotalArticle.png" },
        { label: "Completion Rate", value: `${stats.completionRate}%`, icon: "/icons/TotalQuestionBank.png" },
      ];
    }
    return [];
  }, [stats, isInstructor]);

  // Prepare analytics chart data
  const analyticsChartData = useMemo(() => {
    if (!analytics) return [];

    return [
      { label: "Published", value: analytics.published.percentage, color: "#40A578" },
      { label: "Drafts", value: analytics.draft.percentage, color: "#F29C4C" },
      { label: "In Progress", value: analytics.inProgress.percentage, color: "#4378FF" },
    ];
  }, [analytics]);

  // Carousel controls
  const visibleCourses = ongoingCourses.slice(carouselIndex, carouselIndex + 3);
  const canGoBack = carouselIndex > 0;
  const canGoForward = carouselIndex < ongoingCourses.length - 3;

  // Loading state
  if (statsLoading) {
    return (
      <div className="min-h-screen bg-off-white-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white-1">
      <Container size="xl" padding="none">
        <PageHeader title="Dashboard" />

        <div className="space-y-8">
          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <Image
                  src={stat.icon}
                  alt={stat.label}
                  width={46}
                  height={46}
                />
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
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                {isInstructor ? "Recent Courses" : "Ongoing Courses"}
              </h2>

              {coursesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                </div>
              ) : ongoingCourses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <p className="text-gray-500">No courses found</p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    onClick={() => setCarouselIndex(Math.max(carouselIndex - 1, 0))}
                    disabled={!canGoBack}
                  >
                    ◀
                  </button>

                  <div className="flex gap-4 overflow-hidden flex-1">
                    {visibleCourses.map((course) => (
                      <div
                        key={course._id}
                        onClick={() => router.push(`/courses/${course._id}`)}
                        className="bg-white rounded-xl shadow-sm w-68 min-w-[272px] flex-shrink-0 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <Image
                          src={course.thumbnail || "/default-course-thumbnail.png"}
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
                            by {course.instructor.name}
                          </p>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {course.description}
                          </p>

                          {/* Student view - show progress */}
                          {!isInstructor && (
                            <>
                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{course.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 text-xs text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  {course.completedLessons}/{course.totalLessons} Lessons
                                </span>
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  ⭐ {course.rating.toFixed(1)}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Instructor view - show enrollment stats */}
                          {isInstructor && (
                            <div className="flex gap-2 text-xs text-gray-500">
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                {course.totalEnrollments || 0} Enrollments
                              </span>
                              <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                                {course.activeEnrollments || 0} Active
                              </span>
                              <span className={`px-2 py-1 rounded ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {course.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    onClick={() => setCarouselIndex(carouselIndex + 1)}
                    disabled={!canGoForward}
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>

            {/* Analytics - Only for instructors */}
            {isInstructor && (
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Course Analytics</h2>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                  </div>
                ) : (
                  <>
                    {/* Pie chart with Recharts */}
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analyticsChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ value }) => `${value.toFixed(1)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="w-full space-y-2 mt-4">
                      {analyticsChartData.map((item) => (
                        <li key={item.label} className="flex items-center gap-3">
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ background: item.color }}
                          ></span>
                          <span className="text-sm text-gray-900 flex-1">{item.label}</span>
                          <span className="text-sm font-semibold text-gray-900">{item.value.toFixed(2)}%</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Completion Rate & Dropdown - Only for instructors */}
          {isInstructor && (
            <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Course Completion Rate</h2>
                {categories.length > 0 && (
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {/* Bar Chart with Recharts */}
              {completionLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                </div>
              ) : completionRateData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No completion data available
                </div>
              ) : (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={completionRateData.map(d => ({
                        name: d.courseTitle.length > 20 ? d.courseTitle.slice(0, 20) + "..." : d.courseTitle,
                        enrollments: d.totalEnrollments,
                        completionRate: d.completionRate,
                        fullName: d.courseTitle
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F4F6F8" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        label={{ value: 'Total Enrollments', angle: -90, position: 'insideLeft' }}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                <p className="font-semibold text-sm mb-1">{payload[0].payload.fullName}</p>
                                <p className="text-sm text-blue-600">Enrollments: {payload[0].value}</p>
                                <p className="text-sm text-green-600">Completion Rate: {payload[0].payload.completionRate}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="enrollments"
                        radius={[8, 8, 0, 0]}
                      >
                        {completionRateData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.completionRate > 50 ? "#40A578" : "#4378FF"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
