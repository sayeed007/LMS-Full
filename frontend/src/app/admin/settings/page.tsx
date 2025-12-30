'use client';

import { PageLayout, TabNav } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/toast-utils';
import {
  useGetSettingsQuery,
  useResetSettingsMutation,
  useTestEmailConfigurationMutation,
  useUpdateEmailSettingsMutation,
  useUpdateFeatureSettingsMutation,
  useUpdateGeneralSettingsMutation,
  useUpdatePaymentSettingsMutation,
  useUpdateSEOSettingsMutation,
  useUpdateSocialSettingsMutation,
  useUpdateSystemSettingsMutation,
} from '@/store/api/settingApi';
import { RefreshCw, Save, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/useConfirm';

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'email', label: 'Email' },
  { key: 'payment', label: 'Payment' },
  { key: 'system', label: 'System' },
  { key: 'features', label: 'Features' },
  { key: 'social', label: 'Social Media' },
  { key: 'seo', label: 'SEO' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const confirm = useConfirm();
  const { data, isLoading, error } = useGetSettingsQuery();
  const [updateGeneral, { isLoading: isUpdatingGeneral }] = useUpdateGeneralSettingsMutation();
  const [updateEmail, { isLoading: isUpdatingEmail }] = useUpdateEmailSettingsMutation();
  const [updatePayment, { isLoading: isUpdatingPayment }] = useUpdatePaymentSettingsMutation();
  const [updateSystem, { isLoading: isUpdatingSystem }] = useUpdateSystemSettingsMutation();
  const [updateFeatures, { isLoading: isUpdatingFeatures }] = useUpdateFeatureSettingsMutation();
  const [updateSocial, { isLoading: isUpdatingSocial }] = useUpdateSocialSettingsMutation();
  const [updateSEO, { isLoading: isUpdatingSEO }] = useUpdateSEOSettingsMutation();
  const [testEmail, { isLoading: isTesting }] = useTestEmailConfigurationMutation();
  const [resetSettings] = useResetSettingsMutation();

  const [formData, setFormData] = useState<Partial<{
    general: Record<string, unknown>;
    email: Record<string, unknown>;
    payment: Record<string, unknown>;
    system: Record<string, unknown>;
    features: Record<string, unknown>;
    social: Record<string, unknown>;
    seo: Record<string, unknown>;
  }>>({});
  const [testEmailAddress, setTestEmailAddress] = useState('');

  // Initialize form data when settings load
  useState(() => {
    if (data?.data) {
      setFormData({
        general: { ...data.data.general },
        email: { ...data.data.email },
        payment: { ...data.data.payment },
        system: { ...data.data.system },
        features: { ...data.data.features },
        social: { ...data.data.social },
        seo: { ...data.data.seo },
      });
    }
  });

  if (isLoading) {
    return (
      <PageLayout title="System Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (error || !data?.data) {
    return (
      <PageLayout title="System Settings">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Failed to load settings. Please try again.</p>
        </div>
      </PageLayout>
    );
  }

  const settings = data.data;

  // Update form field
  const updateField = (
    category: keyof typeof formData,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  // Handle form submissions
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGeneral(formData.general || settings.general).unwrap();
      toast.success('General settings updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update general settings'));
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmail(formData.email || settings.email).unwrap();
      toast.success('Email settings updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update email settings'));
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePayment(formData.payment || settings.payment).unwrap();
      toast.success('Payment settings updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update payment settings'));
    }
  };

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSystem(formData.system || settings.system).unwrap();
      toast.success('System settings updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update system settings'));
    }
  };

  const handleFeaturesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateFeatures(formData.features || settings.features).unwrap();
      toast.success('Feature settings updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update feature settings'));
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSocial(formData.social || settings.social).unwrap();
      toast.success('Social media settings updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update social media settings'));
    }
  };

  const handleSEOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSEO(formData.seo || settings.seo).unwrap();
      toast.success('SEO settings updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update SEO settings'));
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Please enter an email address');
      return;
    }
    try {
      await testEmail({ recipientEmail: testEmailAddress }).unwrap();
      toast.success(`Test email sent to ${testEmailAddress}`);
      setTestEmailAddress('');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to send test email'));
    }
  };

  const handleResetSettings = async () => {
    const confirmed = await confirm({
      title: 'Reset Settings',
      message: 'Are you sure you want to reset all settings to default? This action cannot be undone.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }
    try {
      await resetSettings().unwrap();
      toast.success('Settings reset to default values');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to reset settings'));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentData: any =
    formData[activeTab as keyof typeof formData] ||
    settings[activeTab as keyof typeof settings] ||
    {};

  return (
    <PageLayout
      title="System Settings"
      headerActions={
        <Button
          onClick={handleResetSettings}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset to Default
        </Button>
      }
    >
      <div className="space-y-6">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <form onSubmit={handleGeneralSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">General Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={currentData.siteName || ''}
                    onChange={(e) => updateField('general', 'siteName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                  <input
                    type="url"
                    value={currentData.siteUrl || ''}
                    onChange={(e) => updateField('general', 'siteUrl', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    value={currentData.siteDescription || ''}
                    onChange={(e) => updateField('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={currentData.contactEmail || ''}
                    onChange={(e) => updateField('general', 'contactEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                  <input
                    type="tel"
                    value={currentData.supportPhone || ''}
                    onChange={(e) => updateField('general', 'supportPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={currentData.address || ''}
                    onChange={(e) => updateField('general', 'address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <input
                    type="text"
                    value={currentData.timezone || ''}
                    onChange={(e) => updateField('general', 'timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={currentData.language || 'en'}
                    onChange={(e) => updateField('general', 'language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={currentData.currency || 'BDT'}
                    onChange={(e) => updateField('general', 'currency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdatingGeneral} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isUpdatingGeneral ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Email Settings</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentData.enabled || false}
                    onChange={(e) => updateField('email', 'enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Email Enabled</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Service</label>
                  <select
                    value={currentData.service || 'gmail'}
                    onChange={(e) => updateField('email', 'service', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gmail">Gmail</option>
                    <option value="smtp">SMTP</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="ses">AWS SES</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={currentData.host || ''}
                    onChange={(e) => updateField('email', 'host', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={currentData.port || 587}
                    onChange={(e) => updateField('email', 'port', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentData.secure || false}
                      onChange={(e) => updateField('email', 'secure', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Use Secure Connection (SSL/TLS)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={currentData.username || ''}
                    onChange={(e) => updateField('email', 'username', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={currentData.password || ''}
                    onChange={(e) => updateField('email', 'password', e.target.value)}
                    placeholder="Enter password to update"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={currentData.fromEmail || ''}
                    onChange={(e) => updateField('email', 'fromEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={currentData.fromName || ''}
                    onChange={(e) => updateField('email', 'fromName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Test Email Configuration</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="Enter email address to test"
                    className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={isTesting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isTesting ? 'Sending...' : 'Send Test'}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdatingEmail} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isUpdatingEmail ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Payment Gateway Settings</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentData.enabled || false}
                    onChange={(e) => updateField('payment', 'enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Payment Enabled</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
                  <select
                    value={currentData.gateway || 'sslcommerz'}
                    onChange={(e) => updateField('payment', 'gateway', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sslcommerz">SSLCommerz</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                  <select
                    value={currentData.mode || 'sandbox'}
                    onChange={(e) => updateField('payment', 'mode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="live">Live (Production)</option>
                  </select>
                </div>

                {currentData.gateway === 'sslcommerz' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store ID</label>
                      <input
                        type="text"
                        value={currentData.sslcommerz?.storeId || ''}
                        onChange={(e) =>
                          updateField('payment', 'sslcommerz', {
                            ...currentData.sslcommerz,
                            storeId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Password</label>
                      <input
                        type="password"
                        value={currentData.sslcommerz?.storePassword || ''}
                        onChange={(e) =>
                          updateField('payment', 'sslcommerz', {
                            ...currentData.sslcommerz,
                            storePassword: e.target.value,
                          })
                        }
                        placeholder="Enter password to update"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={currentData.sslcommerz?.sandboxMode ?? true}
                          onChange={(e) =>
                            updateField('payment', 'sslcommerz', {
                              ...currentData.sslcommerz,
                              sandboxMode: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Sandbox Mode</span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdatingPayment} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isUpdatingPayment ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <form onSubmit={handleSystemSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">System Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-sm text-gray-600">Put the system in maintenance mode</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.maintenanceMode || false}
                    onChange={(e) => updateField('system', 'maintenanceMode', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                {currentData.maintenanceMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
                    <textarea
                      value={currentData.maintenanceMessage || ''}
                      onChange={(e) => updateField('system', 'maintenanceMessage', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Registration Enabled</h4>
                    <p className="text-sm text-gray-600">Allow new user registrations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.registrationEnabled ?? true}
                    onChange={(e) => updateField('system', 'registrationEnabled', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Course Approval Required</h4>
                    <p className="text-sm text-gray-600">Require admin approval for published courses</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.courseApprovalRequired ?? true}
                    onChange={(e) => updateField('system', 'courseApprovalRequired', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Allow Guest Browsing</h4>
                    <p className="text-sm text-gray-600">Allow guests to browse courses without login</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.allowGuestBrowsing ?? true}
                    onChange={(e) => updateField('system', 'allowGuestBrowsing', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max File Upload Size (bytes)</label>
                    <input
                      type="number"
                      value={currentData.maxFileUploadSize || 10485760}
                      onChange={(e) => updateField('system', 'maxFileUploadSize', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {((currentData.maxFileUploadSize || 10485760) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (seconds)</label>
                    <input
                      type="number"
                      value={currentData.sessionTimeout || 3600}
                      onChange={(e) => updateField('system', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {((currentData.sessionTimeout || 3600) / 60).toFixed(0)} minutes
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Password Length</label>
                    <input
                      type="number"
                      value={currentData.passwordMinLength || 8}
                      onChange={(e) => updateField('system', 'passwordMinLength', parseInt(e.target.value))}
                      min={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Password Requirements</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentData.passwordRequireUppercase ?? true}
                      onChange={(e) => updateField('system', 'passwordRequireUppercase', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Require uppercase letters</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentData.passwordRequireNumbers ?? true}
                      onChange={(e) => updateField('system', 'passwordRequireNumbers', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Require numbers</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentData.passwordRequireSpecialChars || false}
                      onChange={(e) => updateField('system', 'passwordRequireSpecialChars', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Require special characters</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdatingSystem} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isUpdatingSystem ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* Features Settings */}
          {activeTab === 'features' && (
            <form onSubmit={handleFeaturesSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Feature Toggles</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Certificates</h4>
                    <p className="text-sm text-gray-600">Enable certificate generation for completed courses</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.enableCertificates ?? true}
                    onChange={(e) => updateField('features', 'enableCertificates', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Messaging</h4>
                    <p className="text-sm text-gray-600">Enable in-app messaging system</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.enableMessaging ?? true}
                    onChange={(e) => updateField('features', 'enableMessaging', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Forums</h4>
                    <p className="text-sm text-gray-600">Enable discussion forums</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.enableForums || false}
                    onChange={(e) => updateField('features', 'enableForums', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Reviews</h4>
                    <p className="text-sm text-gray-600">Enable course reviews and ratings</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.enableReviews ?? true}
                    onChange={(e) => updateField('features', 'enableReviews', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Wishlist</h4>
                    <p className="text-sm text-gray-600">Enable course wishlist functionality</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.enableWishlist ?? true}
                    onChange={(e) => updateField('features', 'enableWishlist', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Notifications</h4>
                    <p className="text-sm text-gray-600">Enable push notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentData.enableNotifications ?? true}
                    onChange={(e) => updateField('features', 'enableNotifications', e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdatingFeatures} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isUpdatingFeatures ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={currentData.facebook || ''}
                    onChange={(e) => updateField('social', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="url"
                    value={currentData.twitter || ''}
                    onChange={(e) => updateField('social', 'twitter', e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={currentData.linkedin || ''}
                    onChange={(e) => updateField('social', 'linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={currentData.instagram || ''}
                    onChange={(e) => updateField('social', 'instagram', e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <input
                    type="url"
                    value={currentData.youtube || ''}
                    onChange={(e) => updateField('social', 'youtube', e.target.value)}
                    placeholder="https://youtube.com/c/yourchannel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdatingSocial} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isUpdatingSocial ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <form onSubmit={handleSEOSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">SEO & Analytics</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={currentData.metaTitle || ''}
                    onChange={(e) => updateField('seo', 'metaTitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    value={currentData.metaDescription || ''}
                    onChange={(e) => updateField('seo', 'metaDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                  <input
                    type="text"
                    value={currentData.metaKeywords || ''}
                    onChange={(e) => updateField('seo', 'metaKeywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OG Image URL</label>
                  <input
                    type="url"
                    value={currentData.ogImage || ''}
                    onChange={(e) => updateField('seo', 'ogImage', e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                    <input
                      type="text"
                      value={currentData.googleAnalyticsId || ''}
                      onChange={(e) => updateField('seo', 'googleAnalyticsId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                    <input
                      type="text"
                      value={currentData.facebookPixelId || ''}
                      onChange={(e) => updateField('seo', 'facebookPixelId', e.target.value)}
                      placeholder="XXXXXXXXXXXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdatingSEO} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isUpdatingSEO ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
