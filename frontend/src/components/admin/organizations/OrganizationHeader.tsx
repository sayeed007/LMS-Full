import { type OrganizationPopulated } from '@/store/api/organizationApi';
import { ArrowLeft, Building2, Save, Settings } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface OrganizationHeaderProps {
  organization: OrganizationPopulated;
  activeTab: string;
  isEditing: boolean;
  isUpdating: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function OrganizationHeader({
  organization,
  activeTab,
  isEditing,
  isUpdating,
  onEdit,
  onSave,
  onCancel
}: OrganizationHeaderProps) {
  const router = useRouter();

  return (
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
            <Image
              src={organization.logo}
              alt={organization.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
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
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={onEdit}
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
  );
}
