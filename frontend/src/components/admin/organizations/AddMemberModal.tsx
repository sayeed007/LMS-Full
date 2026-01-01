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
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor' | 'org_admin'>(
    'student'
  );

  const handleSearchChange = (search: string) => {
    setUserSearch(search);
    // Clear selection when user types
    if (search !== selectedUserName) {
      setSelectedUserId('');
      setSelectedUserName('');
    }
    if (search.length >= 2) {
      onSearch(search);
    }
  };

  const handleSelectUser = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setUserSearch(userName);
  };

  const handleAdd = async () => {
    if (selectedUserId) {
      await onAdd(selectedUserId, selectedRole);
    }
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Add Member</h2>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search User {selectedUserId && <span className="text-green-600 text-xs">(Selected)</span>}
          </label>
          <input
            type="text"
            value={userSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedUserId ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
          />
          {searchResults && searchResults.length > 0 && !selectedUserId && (
            <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user._id, user.name)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition"
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </button>
              ))}
            </div>
          )}
          {selectedUserId && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              User selected
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

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={isAdding}
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
  );
}
