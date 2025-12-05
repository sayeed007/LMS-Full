import { type OrganizationPopulated, UpdateOrganizationRequest } from '@/store/api/organizationApi';
import { Building2, Globe, Mail, MapPin, Phone, User } from 'lucide-react';
import { InfoField } from './InfoField';

interface InfoTabProps {
  organization: OrganizationPopulated;
  isEditing: boolean;
  formData: UpdateOrganizationRequest;
  setFormData: (data: UpdateOrganizationRequest) => void;
}

export function InfoTab({ organization, isEditing, formData, setFormData }: InfoTabProps) {
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
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
                    contactPerson: { ...(formData.contactPerson || {}), name: e.target.value }
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
                    contactPerson: { ...(formData.contactPerson || {}), email: e.target.value }
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
                    contactPerson: { ...(formData.contactPerson || {}), phone: e.target.value }
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
                    contactPerson: { ...(formData.contactPerson || {}), position: e.target.value }
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
        {organization.website && (
          <InfoField icon={<Globe />} label="Website" value={organization.website} link />
        )}
        {organization.type && (
          <InfoField label="Type" value={organization.type.replace('_', ' ').toUpperCase()} />
        )}
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
