import { baseApi, BaseApiResponse } from './baseApi';

// Setting interfaces matching backend schema
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  supportPhone: string;
  address: string;
  timezone: string;
  language: 'en' | 'bn';
  currency: 'BDT' | 'USD' | 'EUR';
}

export interface EmailSettings {
  enabled: boolean;
  service: 'gmail' | 'smtp' | 'sendgrid' | 'ses';
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
}

export interface PaymentSettings {
  enabled: boolean;
  gateway: 'sslcommerz' | 'stripe' | 'paypal';
  mode: 'sandbox' | 'live';
  sslcommerz?: {
    storeId?: string;
    storePassword?: string;
    sandboxMode: boolean;
  };
  stripe?: {
    publicKey?: string;
    secretKey?: string;
  };
  paypal?: {
    clientId?: string;
    clientSecret?: string;
  };
  currency: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationEnabled: boolean;
  courseApprovalRequired: boolean;
  allowGuestBrowsing: boolean;
  maxFileUploadSize: number;
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
}

export interface FeatureSettings {
  enableCertificates: boolean;
  enableMessaging: boolean;
  enableForums: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableNotifications: boolean;
}

export interface SocialSettings {
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  youtube: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
}

export interface Settings {
  _id: string;
  general: GeneralSettings;
  email: EmailSettings;
  payment: PaymentSettings;
  system: SystemSettings;
  features: FeatureSettings;
  social: SocialSettings;
  seo: SEOSettings;
  lastUpdatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PublicSettings {
  general: Partial<GeneralSettings>;
  system: Partial<SystemSettings>;
  features: FeatureSettings;
  social: SocialSettings;
  seo: Partial<SEOSettings>;
}

export interface UpdateSettingsRequest {
  general?: Partial<GeneralSettings>;
  email?: Partial<EmailSettings>;
  payment?: Partial<PaymentSettings>;
  system?: Partial<SystemSettings>;
  features?: Partial<FeatureSettings>;
  social?: Partial<SocialSettings>;
  seo?: Partial<SEOSettings>;
}

export interface TestEmailRequest {
  recipientEmail: string;
}

export const settingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all settings (admin only)
    getSettings: builder.query<BaseApiResponse<Settings>, void>({
      query: () => '/settings',
      providesTags: ['Setting'],
    }),

    // Get public settings (no auth required)
    getPublicSettings: builder.query<BaseApiResponse<PublicSettings>, void>({
      query: () => '/settings/public',
      providesTags: ['Setting'],
    }),

    // Update all settings at once
    updateSettings: builder.mutation<BaseApiResponse<Settings>, UpdateSettingsRequest>({
      query: (data) => ({
        url: '/settings',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),

    // Update general settings
    updateGeneralSettings: builder.mutation<BaseApiResponse<{ general: GeneralSettings }>, Partial<GeneralSettings>>({
      query: (data) => ({
        url: '/settings/general',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),

    // Update email settings
    updateEmailSettings: builder.mutation<BaseApiResponse<{ email: EmailSettings }>, Partial<EmailSettings>>({
      query: (data) => ({
        url: '/settings/email',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),

    // Update payment settings
    updatePaymentSettings: builder.mutation<BaseApiResponse<{ payment: PaymentSettings }>, Partial<PaymentSettings>>({
      query: (data) => ({
        url: '/settings/payment',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),

    // Update system settings
    updateSystemSettings: builder.mutation<BaseApiResponse<{ system: SystemSettings }>, Partial<SystemSettings>>({
      query: (data) => ({
        url: '/settings/system',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),

    // Update feature settings
    updateFeatureSettings: builder.mutation<BaseApiResponse<{ features: FeatureSettings }>, Partial<FeatureSettings>>({
      query: (data) => ({
        url: '/settings/features',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),

    // Update social settings
    updateSocialSettings: builder.mutation<BaseApiResponse<{ social: SocialSettings }>, Partial<SocialSettings>>({
      query: (data) => ({
        url: '/settings/social',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),

    // Update SEO settings
    updateSEOSettings: builder.mutation<BaseApiResponse<{ seo: SEOSettings }>, Partial<SEOSettings>>({
      query: (data) => ({
        url: '/settings/seo',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),

    // Test email configuration
    testEmailConfiguration: builder.mutation<BaseApiResponse<{ message: string }>, TestEmailRequest>({
      query: (data) => ({
        url: '/settings/test-email',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset settings to default
    resetSettings: builder.mutation<BaseApiResponse<Settings>, void>({
      query: () => ({
        url: '/settings/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Setting'],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetPublicSettingsQuery,
  useUpdateSettingsMutation,
  useUpdateGeneralSettingsMutation,
  useUpdateEmailSettingsMutation,
  useUpdatePaymentSettingsMutation,
  useUpdateSystemSettingsMutation,
  useUpdateFeatureSettingsMutation,
  useUpdateSocialSettingsMutation,
  useUpdateSEOSettingsMutation,
  useTestEmailConfigurationMutation,
  useResetSettingsMutation,
} = settingApi;
