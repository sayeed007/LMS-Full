'use client';

import { getErrorMessage } from '@/lib/utils';
import {
  UpdateOrganizationRequest,
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation
} from '@/store/api/organizationApi';
import { CoursesTab } from '@/components/admin/organizations/CoursesTab';
import { InfoTab } from '@/components/admin/organizations/InfoTab';
import { MembersTab } from '@/components/admin/organizations/MembersTab';
import { OrganizationHeader } from '@/components/admin/organizations/OrganizationHeader';
import { StatsTab } from '@/components/admin/organizations/StatsTab';
import { TabNavigation } from '@/components/admin/organizations/TabNavigation';
import { Building2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update organization'));
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
        <OrganizationHeader
          organization={organization}
          activeTab={activeTab}
          isEditing={isEditing}
          isUpdating={isUpdating}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <TabNavigation
            activeTab={activeTab}
            organization={organization}
            onTabChange={setActiveTab}
          />

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
