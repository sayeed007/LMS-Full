import { useGetOrganizationStatsQuery } from '@/store/api/organizationApi';
import { Activity, BookOpen, TrendingUp, Users } from 'lucide-react';
import { StatCard } from './StatCard';

interface StatsTabProps {
  orgId: string;
}

export function StatsTab({ orgId }: StatsTabProps) {
  const { data: statsData, isLoading } = useGetOrganizationStatsQuery(orgId);

  const stats = statsData?.data;

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">No statistics available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Members"
          value={stats.totalMembers}
          color="blue"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          label="Total Courses"
          value={stats.totalCourses}
          color="green"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          label="Total Enrollments"
          value={stats.totalEnrollments}
          color="purple"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Active Instructors"
          value={stats.activeInstructors}
          color="orange"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Courses This Month"
          value={stats.coursesThisMonth}
          color="indigo"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Enrollments This Month"
          value={stats.enrollmentsThisMonth}
          color="pink"
        />
      </div>

      {/* Members by Role */}
      {stats.membersByRole && Object.keys(stats.membersByRole).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Members by Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.membersByRole).map(([role, count]) => (
              <div key={role} className="bg-white p-4 rounded-lg">
                <div className="text-sm text-gray-600 capitalize">{role.replace('_', ' ')}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{count as number}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses by Status */}
      {stats.coursesByStatus && Object.keys(stats.coursesByStatus).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Courses by Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.coursesByStatus).map(([status, count]) => (
              <div key={status} className="bg-white p-4 rounded-lg">
                <div className="text-sm text-gray-600 capitalize">{status}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{count as number}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
