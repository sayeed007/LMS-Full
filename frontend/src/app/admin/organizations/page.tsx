'use client';

import { getErrorMessage } from '@/lib/utils';
import {
  useDeleteOrganizationMutation,
  useGetOrganizationsQuery,
  OrganizationPopulated
} from '@/store/api/organizationApi';
import { BookOpen, Building2, Edit, ExternalLink, Filter, Plus, Search, Trash2, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/useConfirm';
import { Container, Pagination } from '@/components/ui';
import { useModal } from '@/lib/modal-context';
import OrganizationFormModal from '@/components/admin/OrganizationFormModal';
import { EnhancedSelect } from '@/components/ui/SearchableSelect';

export default function OrganizationsPage() {
  const confirm = useConfirm();
  const { openModal, closeModal } = useModal();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // API hooks
  const { data, isLoading, error } = useGetOrganizationsQuery({
    page,
    limit,
    search: search || undefined,
    type: typeFilter || undefined,
    isActive: isActiveFilter
  });

  const [deleteOrganization] = useDeleteOrganizationMutation();

  const handleOpenCreateModal = () => {
    openModal(
      <OrganizationFormModal onClose={() => closeModal()} mode="create" />,
      { size: '2xl' }
    );
  };

  const handleOpenEditModal = (organization: OrganizationPopulated) => {
    openModal(
      <OrganizationFormModal
        onClose={() => closeModal()}
        mode="edit"
        organization={organization}
      />,
      { size: '2xl' }
    );
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Delete Organization',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteOrganization(id).unwrap();
      toast.success('Organization deleted successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to delete organization'));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleTypeFilterChange = (value: string | undefined) => {
    setTypeFilter(value || '');
    setPage(1);
  };

  const handleActiveFilterChange = (value: string | undefined) => {
    setIsActiveFilter(value === undefined ? undefined : value === 'true');
    setPage(1);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      educational_institution: 'Educational Institution',
      corporate: 'Corporate',
      government: 'Government',
      non_profit: 'Non-Profit',
      other: 'Other'
    };
    return labels[type] || type;
  };

  return (
    <>
      <Container size="xl" className="bg-gray-50 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                Organizations
              </h1>
              <p className="text-gray-600 mt-1">Manage organizations and their settings</p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Organization
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-5 h-5" />
              Filters
              {(typeFilter || isActiveFilter !== undefined) && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Active</span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <EnhancedSelect
                  value={typeFilter || undefined}
                  onValueChange={handleTypeFilterChange}
                  placeholder="All Types"
                  clearable={true}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <EnhancedSelect
                  value={isActiveFilter === undefined ? undefined : isActiveFilter.toString()}
                  onValueChange={handleActiveFilterChange}
                  placeholder="All Statuses"
                  clearable={true}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading organizations...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error loading organizations</div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No organizations found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((org) => (
                      <tr key={org._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {org.logo ? (
                              <Image
                                src={org.logo}
                                alt={org.name}
                                className="w-10 h-10 rounded-full object-cover"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{org.name}</div>
                              {org.website && (
                                <Link
                                  href={org.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  {org.website}
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                            {getTypeLabel(org.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{org.email}</div>
                          {org.contactPerson?.name && (
                            <div className="text-xs text-gray-500">{org.contactPerson.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="w-4 h-4" />
                              {org.memberCount || 0}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <BookOpen className="w-4 h-4" />
                              {org.coursesCount || 0}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${org.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {org.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(org)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(org._id, org.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination && data.pagination.totalPages > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={data.pagination.totalPages}
                  totalItems={data.pagination.totalResults}
                  itemsPerPage={limit}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newSize) => {
                    setLimit(newSize);
                    setPage(1);
                  }}
                />
              )}
            </>
          )}
        </div>
      </Container>
    </>
  );
}
