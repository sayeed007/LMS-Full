'use client'

import { dismissToast, showDeleteSuccessToast, showDownloadToast, showErrorToast, showFileUploadSuccessToast, showFileUploadToast, showFormErrorToast, showFormSuccessToast, showInfoToast, showLikeToast, showPromiseToast, showSaveLoadingToast, showSaveSuccessToast, showSuccessToast, showValidationErrorToast } from '@/lib/toast-utils';

interface UserData {
    name: string;
}

const ToastExample = () => {
    // Example usage functions for demo
    const testFormSuccess = () => showFormSuccessToast()
    const testFormError = () => showFormErrorToast("Network timeout occurred", () => console.info("Retrying..."))
    const testValidation = () => showValidationErrorToast(["Email", "Password", "Phone Number"])

    const testFileUpload = () => {
        const uploadId = showFileUploadToast("document.pdf")

        setTimeout(() => {
            dismissToast(uploadId)
            showFileUploadSuccessToast("document.pdf", () => console.info("Opening file..."))
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
        showDeleteSuccessToast("Project Alpha", () => console.info("Item restored"))
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
