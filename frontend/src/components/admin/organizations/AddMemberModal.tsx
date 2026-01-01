import { type UserPopulated } from '@/store/api/userApi';
import { useState } from 'react';
import { EnhancedSelect } from '@/components/ui/SearchableSelect';

interface AddMemberModalProps {
  onClose: () => void;
  onAdd: (userId: string, role: 'student' | 'instructor' | 'org_admin') => Promise<void>;
  onSearch: (search: string) => void;
  searchResults?: UserPopulated[];
  isAdding: boolean;
}

export function AddMemberModal({
  onClose,
  onAdd,
  onSearch,
  searchResults,
  isAdding
}: AddMemberModalProps) {
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor' | 'org_admin'>(
    'student'
  );

  const handleSearchChange = (search: string) => {
    setUserSearch(search);
    if (search.length >= 2) {
      onSearch(search);
    }
  };

  const handleAdd = async () => {
    if (selectedUserId) {
      await onAdd(selectedUserId, selectedRole);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Member</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchResults && searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <EnhancedSelect
              value={selectedRole}
              onValueChange={(value) => value && setSelectedRole(value as 'student' | 'instructor' | 'org_admin')}
              placeholder="Select role"
              clearable={false}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'instructor', label: 'Instructor' },
                { value: 'org_admin', label: 'Org Admin' }
              ]}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={isAdding || !selectedUserId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
