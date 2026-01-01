'use client';

import { getErrorMessage } from '@/lib/utils';
import {
  CreateOrganizationRequest,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation
} from '@/store/api/organizationApi';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { EnhancedSelect } from '@/components/ui/SearchableSelect';

export interface Organization {
  _id: string;
  name: string;
  email: string;
  type: 'educational_institution' | 'corporate' | 'government' | 'non_profit' | 'other';
  description?: string;
  website?: string;
  logo?: string;
}

interface OrganizationFormModalProps {
  onClose: () => void;
  organization?: Organization;
  mode?: 'create' | 'edit';
}

export default function OrganizationFormModal({
  onClose,
  organization,
  mode = 'create'
}: OrganizationFormModalProps) {
  const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();

  const [formData, setFormData] = useState<CreateOrganizationRequest>({
    name: '',
    email: '',
    type: 'educational_institution',
    description: '',
    website: '',
    logo: ''
  });

  // Populate form data when editing
  useEffect(() => {
    if (mode === 'edit' && organization) {
      setFormData({
        name: organization.name,
        email: organization.email,
        type: organization.type,
        description: organization.description || '',
        website: organization.website || '',
        logo: organization.logo || ''
      });
    }
  }, [mode, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (mode === 'edit' && organization) {
        await updateOrganization({
          id: organization._id,
          data: formData
        }).unwrap();
        toast.success('Organization updated successfully');
      } else {
        await createOrganization(formData).unwrap();
        toast.success('Organization created successfully');
      }
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, `Failed to ${mode} organization`));
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'edit' ? 'Edit Organization' : 'Create New Organization'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <EnhancedSelect
              value={formData.type}
              onValueChange={(value) => value && setFormData({ ...formData, type: value as CreateOrganizationRequest['type'] })}
              placeholder="Select organization type"
              clearable={false}
              options={[
                { value: 'educational_institution', label: 'Educational Institution' },
                { value: 'corporate', label: 'Corporate' },
                { value: 'government', label: 'Government' },
                { value: 'non_profit', label: 'Non-Profit' },
                { value: 'other', label: 'Other' }
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input
            type="url"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Organization' : 'Create Organization')}
          </button>
        </div>
      </form>
    </div>
  );
}
