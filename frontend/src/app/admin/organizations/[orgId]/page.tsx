'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
  useGetOrganizationMembersQuery,
  useAddOrganizationMemberMutation,
  useGetOrganizationCoursesQuery,
  useGetOrganizationStatsQuery,
  UpdateOrganizationRequest
} from '@/store/api/organizationApi';
import { useLazySearchUsersQuery } from '@/store/api/userApi';
import {
  Building2,
  ArrowLeft,
  Save,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Mail,
  Globe,
  MapPin,
  User,
  Phone,
  Plus,
  Trash2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

type TabType = 'info' | 'members' | 'courses' | 'stats';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(false);

  // API hooks
  const { data: orgData, isLoading: orgLoading } = useGetOrganizationByIdQuery(orgId);
  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();

  const organization = orgData?.data?.organization;

  // Form state for editing
  const [formData, setFormData] = useState<UpdateOrganizationRequest>({});

  // Initialize form data when organization loads
  useState(() => {
    if (organization && !isEditing) {
      setFormData({
        name: organization.name,
        email: organization.email,
        description: organization.description || '',
        website: organization.website || '',
        logo: organization.logo || '',
        address: organization.address,
        contactPerson: organization.contactPerson,
        settings: organization.settings
      });
    }
  });

  const handleEdit = () => {
    if (organization) {
      setFormData({
        name: organization.name,
        email: organization.email,
        description: organization.description || '',
        website: organization.website || '',
        logo: organization.logo || '',
        address: organization.address,
        contactPerson: organization.contactPerson,
        settings: organization.settings
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateOrganization({ id: orgId, data: formData }).unwrap();
      toast.success('Organization updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update organization');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading organization...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Organization not found</p>
          <button
            onClick={() => router.push('/admin/organizations')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/organizations')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Organizations
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {organization.logo ? (
                <img src={organization.logo} alt={organization.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                <p className="text-gray-600 mt-1">{organization.email}</p>
              </div>
            </div>

            {activeTab === 'info' && (
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isUpdating}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Settings className="w-5 h-5" />
                    Edit Organization
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Information
                </div>
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'members'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members
                  {organization.memberCount ? (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {organization.memberCount}
                    </span>
                  ) : null}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'courses'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Courses
                  {organization.coursesCount ? (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {organization.coursesCount}
                    </span>
                  ) : null}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'stats'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistics
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'info' && (
              <InfoTab
                organization={organization}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {activeTab === 'members' && <MembersTab orgId={orgId} />}
            {activeTab === 'courses' && <CoursesTab orgId={orgId} />}
            {activeTab === 'stats' && <StatsTab orgId={orgId} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Info Tab Component
function InfoTab({
  organization,
  isEditing,
  formData,
  setFormData
}: {
  organization: any;
  isEditing: boolean;
  formData: UpdateOrganizationRequest;
  setFormData: (data: UpdateOrganizationRequest) => void;
}) {
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              value={formData.logo || ''}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.contactPerson?.name || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactPerson: { ...formData.contactPerson, name: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.contactPerson?.email || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactPerson: { ...formData.contactPerson, email: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.contactPerson?.phone || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactPerson: { ...formData.contactPerson, phone: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                type="text"
                value={formData.contactPerson?.position || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactPerson: { ...formData.contactPerson, position: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField icon={<Building2 />} label="Organization Name" value={organization.name} />
        <InfoField icon={<Mail />} label="Email" value={organization.email} />
        {organization.website && <InfoField icon={<Globe />} label="Website" value={organization.website} link />}
        <InfoField label="Type" value={organization.type?.replace('_', ' ').toUpperCase()} />
      </div>

      {organization.description && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
          <p className="text-gray-900">{organization.description}</p>
        </div>
      )}

      {organization.contactPerson && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organization.contactPerson.name && (
              <InfoField icon={<User />} label="Name" value={organization.contactPerson.name} />
            )}
            {organization.contactPerson.email && (
              <InfoField icon={<Mail />} label="Email" value={organization.contactPerson.email} />
            )}
            {organization.contactPerson.phone && (
              <InfoField icon={<Phone />} label="Phone" value={organization.contactPerson.phone} />
            )}
            {organization.contactPerson.position && (
              <InfoField label="Position" value={organization.contactPerson.position} />
            )}
          </div>
        </div>
      )}

      {organization.address && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div className="text-gray-900">
              {[
                organization.address.street,
                organization.address.city,
                organization.address.state,
                organization.address.country,
                organization.address.zipCode
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Members Tab Component
function MembersTab({ orgId }: { orgId: string }) {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor' | 'org_admin'>('student');

  const { data: membersData, isLoading } = useGetOrganizationMembersQuery({
    id: orgId,
    params: { page, limit: 20, role: roleFilter || undefined }
  });

  const [searchUsers, { data: searchResults }] = useLazySearchUsersQuery();
  const [addMember, { isLoading: isAdding }] = useAddOrganizationMemberMutation();

  const handleSearchUsers = (search: string) => {
    setUserSearch(search);
    if (search.length >= 2) {
      searchUsers({ search });
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      await addMember({ id: orgId, data: { userId: selectedUserId, role: selectedRole } }).unwrap();
      toast.success('Member added successfully');
      setShowAddModal(false);
      setUserSearch('');
      setSelectedUserId('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to add member');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="org_admin">Org Admins</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading members...</div>
      ) : !membersData?.data || membersData.data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No members found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {membersData.data.map((member: any) => (
            <div key={member._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700">
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Member</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchResults?.data && searchResults.data.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.data.map((user: any) => (
                      <button
                        key={user._id}
                        onClick={() => {
                          setSelectedUserId(user._id);
                          setUserSearch(user.name);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="org_admin">Org Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={isAdding || !selectedUserId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isAdding ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Courses Tab Component
function CoursesTab({ orgId }: { orgId: string }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: coursesData, isLoading } = useGetOrganizationCoursesQuery({
    id: orgId,
    params: { page, limit: 10, status: statusFilter || undefined }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading courses...</div>
      ) : !coursesData?.data || coursesData.data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coursesData.data.map((course: any) => (
            <div key={course._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    course.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : course.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {course.status}
                </span>
                {course.instructor && (
                  <span className="text-sm text-gray-600">{course.instructor.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Stats Tab Component
function StatsTab({ orgId }: { orgId: string }) {
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

// Helper Components
function InfoField({
  icon,
  label,
  value,
  link
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  link?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value}
        </a>
      ) : (
        <div className="text-gray-900">{value}</div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
