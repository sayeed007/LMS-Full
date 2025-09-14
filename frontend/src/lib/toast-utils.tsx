// toast-utils.ts
import {
    AlertTriangle,
    Bell,
    CheckCircle2,
    Download,
    Heart,
    Save,
    Settings,
    Trash2,
    Upload,
    User,
    XCircle
} from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

// Basic Toast Functions
export const showSuccessToast = (title: string, description?: string, duration?: number) => {
    return toast.success(title, {
        description,
        duration: duration || 4000,
    })
}

export const showErrorToast = (title: string, description?: string, duration?: number) => {
    return toast.error(title, {
        description,
        duration: duration || 5000,
    })
}

export const showInfoToast = (title: string, description?: string, duration?: number) => {
    return toast.info(title, {
        description,
        duration: duration || 4000,
    })
}

export const showWarningToast = (title: string, description?: string, duration?: number) => {
    return toast.warning(title, {
        description,
        duration: duration || 5000,
    })
}

// Form & Validation Toasts
export const showFormSuccessToast = (message?: string) => {
    return toast.success("🎉 Form Submitted Successfully!", {
        description: message || "Your information has been received and is being processed. We'll notify you within 24 hours.",
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        duration: 6000,
        style: {
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderColor: '#16a34a',
            color: '#15803d',
        },
    })
}

export const showFormErrorToast = (message?: string, onRetry?: () => void) => {
    return toast.error("⌐ Submission Failed", {
        description: message || "Something went wrong. Please check your connection and try again.",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        duration: 8000,
        action: onRetry ? {
            label: "Try Again",
            onClick: onRetry,
        } : undefined,
        style: {
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            borderColor: '#dc2626',
            color: '#dc2626',
        },
    })
}

export const showValidationErrorToast = (fields: string[] | string) => {
    const fieldsList = Array.isArray(fields) ? fields.join(', ') : fields
    return toast.error("Validation Failed", {
        description: `Please fill in all required fields: ${fieldsList}`,
        icon: <AlertTriangle className="h-5 w-5" />,
        duration: 5000,
    })
}

// Loading Toasts
export const showLoadingToast = (message: string, description?: string) => {
    return toast.loading(message, {
        description,
    })
}

export const showSaveLoadingToast = () => {
    return toast.loading("Saving changes...", {
        description: "Please wait while we update your information.",
        icon: <Save className="h-5 w-5 animate-pulse" />,
    })
}

export const dismissToast = (toastId: string | number) => {
    toast.dismiss(toastId)
}

// File Operations
export const showFileUploadToast = (fileName?: string) => {
    return toast.loading("Uploading file...", {
        description: fileName ? `Uploading ${fileName}...` : "Please wait while we upload your file.",
        icon: <Upload className="h-5 w-5 animate-pulse" />,
    })
}

export const showFileUploadSuccessToast = (fileName?: string, onViewFile?: () => void) => {
    return toast.success("File uploaded successfully!", {
        description: fileName ? `${fileName} has been saved to the cloud.` : "Your document has been saved to the cloud.",
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        action: onViewFile ? {
            label: "View File",
            onClick: onViewFile,
        } : undefined,
    })
}

export const showFileUploadErrorToast = (error?: string, onRetry?: () => void) => {
    return toast.error("Upload Failed", {
        description: error || "File size exceeds limit. Please compress your file and try again.",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        duration: 8000,
        action: onRetry ? {
            label: "Try Again",
            onClick: onRetry,
        } : undefined,
    })
}

export const showDownloadToast = (fileName?: string, onViewDownloads?: () => void) => {
    return toast.success("Download started", {
        description: fileName ? `${fileName} will be ready shortly.` : "Your file will be ready shortly.",
        icon: <Download className="h-5 w-5 text-blue-600" />,
        action: onViewDownloads ? {
            label: "View Downloads",
            onClick: onViewDownloads,
        } : undefined,
    })
}

// CRUD Operations
export const showDeleteSuccessToast = (itemName?: string, onUndo?: () => void) => {
    return toast.error("Item deleted", {
        description: itemName ? `${itemName} has been moved to trash.` : "The selected item has been moved to trash.",
        icon: <Trash2 className="h-5 w-5 text-red-600" />,
        action: onUndo ? {
            label: "Undo",
            onClick: () => {
                onUndo()
                toast.success("Item restored", {
                    description: "The item has been restored successfully.",
                })
            },
        } : undefined,
        duration: 8000,
    })
}

export const showSaveSuccessToast = (message?: string) => {
    return toast.success("Changes saved successfully!", {
        description: message || "All your settings have been updated.",
        icon: <Save className="h-5 w-5 text-green-600" />,
    })
}

export const showUpdateSuccessToast = (itemName?: string) => {
    return toast.success("Updated successfully!", {
        description: itemName ? `${itemName} has been updated.` : "Your changes have been applied.",
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    })
}

// User Actions
export const showLikeToast = (itemName?: string) => {
    return toast("Liked!", {
        description: itemName ? `${itemName} added to your favorites.` : "Added to your favorites.",
        icon: <Heart className="h-5 w-5 text-pink-500 fill-current" />,
        style: {
            background: 'linear-gradient(135deg, #fef7f7 0%, #fce7f3 100%)',
            borderColor: '#ec4899',
            color: '#be185d',
        },
    })
}

export const showNotificationToast = (count?: number, onViewAll?: () => void) => {
    const message = count ? `You have ${count} unread messages waiting.` : "You have new messages waiting."
    return toast.info("New notification", {
        description: message,
        icon: <Bell className="h-5 w-5 text-blue-600" />,
        action: onViewAll ? {
            label: "View All",
            onClick: onViewAll,
        } : undefined,
    })
}

export const showSettingsToast = (settingName?: string) => {
    return toast("Settings updated", {
        description: settingName ? `${settingName} has been saved automatically.` : "Your preferences have been saved automatically.",
        icon: <Settings className="h-5 w-5 text-gray-600" />,
        duration: 4000,
    })
}

export const showWelcomeToast = (userName?: string, onGetStarted?: () => void) => {
    return toast("🚀 Welcome aboard!", {
        description: userName ? `Welcome ${userName}! Get started by exploring our amazing features.` : "Get started by exploring our amazing features.",
        style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderColor: '#667eea',
            color: 'white',
        },
        action: onGetStarted ? {
            label: "Get Started",
            onClick: onGetStarted,
        } : undefined,
        duration: 6000,
    })
}

// Auth & User Management
export const showLoginSuccessToast = (userName?: string) => {
    return toast.success("Welcome back!", {
        description: userName ? `Hello ${userName}, you're successfully logged in.` : "You're successfully logged in.",
        icon: <User className="h-5 w-5 text-green-600" />,
    })
}

export const showLogoutToast = () => {
    return toast.info("Logged out successfully", {
        description: "You have been safely logged out of your account.",
        icon: <User className="h-5 w-5 text-blue-600" />,
    })
}

export const showAuthErrorToast = (error?: string) => {
    return toast.error("Authentication failed", {
        description: error || "Invalid credentials. Please check your email and password.",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        duration: 6000,
    })
}

// Promise-based Toast
export const showPromiseToast = <T,>(
    promise: Promise<T>,
    messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: unknown) => string)
    }
) => {
    return toast.promise(promise, messages)
}

// Network & API
export const showNetworkErrorToast = (onRetry?: () => void) => {
    return toast.error("Connection failed", {
        description: "Please check your internet connection and try again.",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        action: onRetry ? {
            label: "Retry",
            onClick: onRetry,
        } : undefined,
        duration: 8000,
    })
}

export const showApiErrorToast = (error?: string, onRetry?: () => void) => {
    return toast.error("Server error", {
        description: error || "Something went wrong on our end. Please try again later.",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        action: onRetry ? {
            label: "Try Again",
            onClick: onRetry,
        } : undefined,
        duration: 6000,
    })
}

// Custom Toast with full control
export const showCustomToast = (
    title: string,
    options: {
        description?: string
        icon?: React.ReactNode
        duration?: number
        action?: {
            label: string
            onClick: () => void
        }
        style?: React.CSSProperties
        type?: 'success' | 'error' | 'info' | 'warning' | 'default'
    }
) => {
    const { type = 'default', ...restOptions } = options

    switch (type) {
        case 'success':
            return toast.success(title, restOptions)
        case 'error':
            return toast.error(title, restOptions)
        case 'info':
            return toast.info(title, restOptions)
        case 'warning':
            return toast.warning(title, restOptions)
        default:
            return toast(title, restOptions)
    }
}