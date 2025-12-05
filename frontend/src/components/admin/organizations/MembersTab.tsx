import { getErrorMessage } from '@/lib/utils';
import {
  useAddOrganizationMemberMutation,
  useGetOrganizationMembersQuery
} from '@/store/api/organizationApi';
import { useLazySearchUsersQuery } from '@/store/api/userApi';
import { Plus, User, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddMemberModal } from './AddMemberModal';

interface MembersTabProps {
  orgId: string;
}

export function MembersTab({ orgId }: MembersTabProps) {
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: membersData, isLoading } = useGetOrganizationMembersQuery({
    id: orgId,
    params: { page: 1, limit: 20, role: roleFilter || undefined }
  });

  const [searchUsers, { data: searchResults }] = useLazySearchUsersQuery();
  const [addMember, { isLoading: isAdding }] = useAddOrganizationMemberMutation();

  const handleSearchUsers = (search: string) => {
    void searchUsers({ q: search });
  };

  const handleAddMember = async (userId: string, role: 'student' | 'instructor' | 'org_admin') => {
    try {
      await addMember({ id: orgId, data: { userId, role } }).unwrap();
      toast.success('Member added successfully');
      setShowAddModal(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to add member'));
      throw error;
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
          {membersData.data.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
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

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMember}
          onSearch={handleSearchUsers}
          searchResults={searchResults?.data}
          isAdding={isAdding}
        />
      )}
    </div>
  );
}
