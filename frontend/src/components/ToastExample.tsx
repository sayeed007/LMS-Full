'use client'

import { dismissToast, showDeleteSuccessToast, showDownloadToast, showErrorToast, showFileUploadSuccessToast, showFileUploadToast, showFormErrorToast, showFormSuccessToast, showInfoToast, showLikeToast, showPromiseToast, showSaveLoadingToast, showSaveSuccessToast, showSuccessToast, showValidationErrorToast } from '@/lib/toast-utils';

interface UserData {
    name: string;
}

const ToastExample = () => {
    // Example usage functions for demo
    const testFormSuccess = () => showFormSuccessToast()
    const testFormError = () => showFormErrorToast("Network timeout occurred", () => console.log("Retrying..."))
    const testValidation = () => showValidationErrorToast(["Email", "Password", "Phone Number"])

    const testFileUpload = () => {
        const uploadId = showFileUploadToast("document.pdf")

        setTimeout(() => {
            dismissToast(uploadId)
            showFileUploadSuccessToast("document.pdf", () => console.log("Opening file..."))
        }, 3000)
    }

    const testSaveProcess = () => {
        const saveId = showSaveLoadingToast()

        setTimeout(() => {
            dismissToast(saveId)
            showSaveSuccessToast("Your profile settings have been updated.")
        }, 2000)
    }

    const testDelete = () => {
        showDeleteSuccessToast("Project Alpha", () => console.log("Item restored"))
    }

    const testPromise = () => {
        const myPromise = new Promise<UserData>((resolve, reject) => {
            setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                Math.random() > 0.5
                    ? resolve({ name: 'John Doe' })
                    : reject(new Error('Failed to fetch user'));
            }, 2000);
        });

        showPromiseToast(myPromise, {
            loading: 'Fetching user data...',
            success: (data: UserData) => `Welcome back, ${data.name}!`,
            error: 'Failed to load user information',
        });
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm">
            <div className="bg-white rounded-lg shadow-lg p-4 border">
                <h3 className="text-sm font-semibold mb-3 text-gray-800">Toast Utilities Demo</h3>

                <div className="space-y-2">
                    {/* Basic Toasts */}
                    <div className="border-b pb-2">
                        <p className="text-xs font-medium text-gray-600 mb-2">Basic:</p>
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => showSuccessToast("Success!", "Operation completed successfully")}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                                Success
                            </button>
                            <button
                                onClick={() => showErrorToast("Error!", "Something went wrong")}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                                Error
                            </button>
                            <button
                                onClick={() => showInfoToast("Info", "Here's some information")}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                                Info
                            </button>
                        </div>
                    </div>

                    {/* Form Toasts */}
                    <div className="border-b pb-2">
                        <p className="text-xs font-medium text-gray-600 mb-2">Forms:</p>
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={testFormSuccess}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                                Form Success
                            </button>
                            <button
                                onClick={testFormError}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                                Form Error
                            </button>
                            <button
                                onClick={testValidation}
                                className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                            >
                                Validation
                            </button>
                        </div>
                    </div>

                    {/* File Operations */}
                    <div className="border-b pb-2">
                        <p className="text-xs font-medium text-gray-600 mb-2">Files:</p>
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={testFileUpload}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                                Upload
                            </button>
                            <button
                                onClick={() => showDownloadToast("report.pdf")}
                                className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                            >
                                Download
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Actions:</p>
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={testSaveProcess}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={testDelete}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => showLikeToast("Article")}
                                className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
                            >
                                Like
                            </button>
                            <button
                                onClick={testPromise}
                                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                            >
                                Promise
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-500 mt-3 italic">
                    Import functions from toast-utils.ts
                </p>
            </div>
        </div>
    )
}

export default ToastExample












// 'use client'

// import React from 'react'
// import { toast } from 'sonner'
// import {
//     CheckCircle2,
//     XCircle,
//     AlertTriangle,
//     Info,
//     Upload,
//     Download,
//     Heart,
//     Bell,
//     Settings,
//     Trash2
// } from 'lucide-react'

// const ToastExample = () => {
//     // Basic Toast Examples
//     const showBasicSuccess = () => {
//         toast.success("Success!", {
//             description: "Your action completed successfully.",
//         })
//     }

//     const showBasicError = () => {
//         toast.error("Error!", {
//             description: "Something went wrong. Please try again.",
//         })
//     }

//     const showBasicInfo = () => {
//         toast.info("Info", {
//             description: "Here's some important information for you.",
//         })
//     }

//     const showBasicWarning = () => {
//         toast.warning("Warning", {
//             description: "Please review your settings before continuing.",
//         })
//     }

//     // Advanced Toast Examples
//     const showAdvancedSuccess = () => {
//         toast.success("🎉 Form Submitted Successfully!", {
//             description: "Your application has been received and is being processed. We'll notify you within 24 hours.",
//             icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
//             duration: 6000,
//             action: {
//                 label: "View Details",
//                 onClick: () => console.log("Viewing submission details..."),
//             },
//             style: {
//                 background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
//                 borderColor: '#16a34a',
//                 color: '#15803d',
//             },
//         })
//     }

//     const showAdvancedError = () => {
//         toast.error("⌐ Upload Failed", {
//             description: "File size exceeds 10MB limit. Please compress your file and try again.",
//             icon: <XCircle className="h-5 w-5 text-red-600" />,
//             duration: 8000,
//             action: {
//                 label: "Try Again",
//                 onClick: () => console.log("Retrying upload..."),
//             },
//             style: {
//                 background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
//                 borderColor: '#dc2626',
//                 color: '#dc2626',
//             },
//         })
//     }

//     const showValidationError = () => {
//         toast.error("Validation Failed", {
//             description: "Please fill in all required fields: Email, Password, and Phone Number.",
//             icon: <AlertTriangle className="h-5 w-5" />,
//             duration: 5000,
//         })
//     }

//     // Loading Toast Examples
//     const showLoadingToast = () => {
//         const loadingToast = toast.loading("Processing your request...", {
//             description: "Please wait while we save your changes.",
//         })

//         // Simulate API call
//         setTimeout(() => {
//             toast.dismiss(loadingToast)
//             toast.success("Changes saved successfully!", {
//                 description: "All your settings have been updated.",
//             })
//         }, 3000)
//     }

//     const showFileUploadProgress = () => {
//         const uploadToast = toast.loading("Uploading file...", {
//             description: "0% complete",
//             icon: <Upload className="h-5 w-5 animate-pulse" />,
//         })

//         // Simulate upload progress
//         let progress = 0
//         const interval = setInterval(() => {
//             progress += 20

//             if (progress < 100) {
//                 toast.loading("Uploading file...", {
//                     id: uploadToast,
//                     description: `${progress}% complete`,
//                     icon: <Upload className="h-5 w-5 animate-pulse" />,
//                 })
//             } else {
//                 clearInterval(interval)
//                 toast.dismiss(uploadToast)
//                 toast.success("File uploaded successfully!", {
//                     description: "Your document has been saved to the cloud.",
//                     icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
//                 })
//             }
//         }, 600)
//     }

//     // Action-specific Toasts
//     const showDownloadToast = () => {
//         toast.success("Download started", {
//             description: "Your file will be ready shortly.",
//             icon: <Download className="h-5 w-5 text-blue-600" />,
//             action: {
//                 label: "View Downloads",
//                 onClick: () => console.log("Opening downloads folder..."),
//             },
//         })
//     }

//     const showDeleteConfirmation = () => {
//         toast.error("Item deleted", {
//             description: "The selected item has been moved to trash.",
//             icon: <Trash2 className="h-5 w-5 text-red-600" />,
//             action: {
//                 label: "Undo",
//                 onClick: () => {
//                     toast.success("Item restored", {
//                         description: "The item has been restored successfully.",
//                     })
//                 },
//             },
//             duration: 8000,
//         })
//     }

//     const showLikeToast = () => {
//         toast("Liked!", {
//             description: "Added to your favorites.",
//             icon: <Heart className="h-5 w-5 text-pink-500 fill-current" />,
//             style: {
//                 background: 'linear-gradient(135deg, #fef7f7 0%, #fce7f3 100%)',
//                 borderColor: '#ec4899',
//                 color: '#be185d',
//             },
//         })
//     }

//     const showNotificationToast = () => {
//         toast.info("New notification", {
//             description: "You have 3 unread messages waiting.",
//             icon: <Bell className="h-5 w-5 text-blue-600" />,
//             action: {
//                 label: "View All",
//                 onClick: () => console.log("Opening notifications..."),
//             },
//         })
//     }

//     const showSettingsToast = () => {
//         toast("Settings updated", {
//             description: "Your preferences have been saved automatically.",
//             icon: <Settings className="h-5 w-5 text-gray-600" />,
//             duration: 4000,
//         })
//     }

//     // Custom styled toast
//     const showCustomToast = () => {
//         toast("🚀 Welcome aboard!", {
//             description: "Get started by exploring our amazing features.",
//             style: {
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 borderColor: '#667eea',
//                 color: 'white',
//             },
//             action: {
//                 label: "Get Started",
//                 onClick: () => console.log("Starting tour..."),
//             },
//             duration: 6000,
//         })
//     }

//     // Promise-based toast
//     const showPromiseToast = () => {
//         const myPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 Math.random() > 0.5 ? resolve({ name: 'John Doe' }) : reject(new Error('Failed to fetch user'))
//             }, 2000)
//         })

//         toast.promise(myPromise, {
//             loading: 'Fetching user data...',
//             success: (data: any) => `Welcome back, ${data.name}!`,
//             error: 'Failed to load user information',
//         })
//     }

//     return (
//         <div className="fixed bottom-4 left-4 z-50 max-w-sm">
//             <div className="bg-white rounded-lg shadow-lg p-4 border">
//                 <h3 className="text-sm font-semibold mb-3 text-gray-800">Toast Examples</h3>

//                 <div className="space-y-2">
//                     {/* Basic Toasts */}
//                     <div className="border-b pb-2">
//                         <p className="text-xs font-medium text-gray-600 mb-2">Basic Toasts:</p>
//                         <div className="flex flex-wrap gap-1">
//                             <button
//                                 onClick={showBasicSuccess}
//                                 className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
//                             >
//                                 Success
//                             </button>
//                             <button
//                                 onClick={showBasicError}
//                                 className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
//                             >
//                                 Error
//                             </button>
//                             <button
//                                 onClick={showBasicInfo}
//                                 className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
//                             >
//                                 Info
//                             </button>
//                             <button
//                                 onClick={showBasicWarning}
//                                 className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
//                             >
//                                 Warning
//                             </button>
//                         </div>
//                     </div>

//                     {/* Advanced Toasts */}
//                     <div className="border-b pb-2">
//                         <p className="text-xs font-medium text-gray-600 mb-2">Advanced:</p>
//                         <div className="flex flex-wrap gap-1">
//                             <button
//                                 onClick={showAdvancedSuccess}
//                                 className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
//                             >
//                                 Rich Success
//                             </button>
//                             <button
//                                 onClick={showAdvancedError}
//                                 className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
//                             >
//                                 Rich Error
//                             </button>
//                             <button
//                                 onClick={showValidationError}
//                                 className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
//                             >
//                                 Validation
//                             </button>
//                         </div>
//                     </div>

//                     {/* Loading Toasts */}
//                     <div className="border-b pb-2">
//                         <p className="text-xs font-medium text-gray-600 mb-2">Loading:</p>
//                         <div className="flex flex-wrap gap-1">
//                             <button
//                                 onClick={showLoadingToast}
//                                 className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
//                             >
//                                 Loading
//                             </button>
//                             <button
//                                 onClick={showFileUploadProgress}
//                                 className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
//                             >
//                                 Upload
//                             </button>
//                             <button
//                                 onClick={showPromiseToast}
//                                 className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
//                             >
//                                 Promise
//                             </button>
//                         </div>
//                     </div>

//                     {/* Action Toasts */}
//                     <div>
//                         <p className="text-xs font-medium text-gray-600 mb-2">Actions:</p>
//                         <div className="flex flex-wrap gap-1">
//                             <button
//                                 onClick={showDownloadToast}
//                                 className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
//                             >
//                                 Download
//                             </button>
//                             <button
//                                 onClick={showDeleteConfirmation}
//                                 className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
//                             >
//                                 Delete
//                             </button>
//                             <button
//                                 onClick={showLikeToast}
//                                 className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
//                             >
//                                 Like
//                             </button>
//                             <button
//                                 onClick={showNotificationToast}
//                                 className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
//                             >
//                                 Notify
//                             </button>
//                             <button
//                                 onClick={showSettingsToast}
//                                 className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
//                             >
//                                 Settings
//                             </button>
//                             <button
//                                 onClick={showCustomToast}
//                                 className="px-2 py-1 text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded hover:from-purple-200 hover:to-blue-200 transition-colors"
//                             >
//                                 Custom
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 <p className="text-xs text-gray-500 mt-3 italic">
//                     Click buttons to see different toast examples
//                 </p>
//             </div>
//         </div>
//     )
// }

// export default ToastExample