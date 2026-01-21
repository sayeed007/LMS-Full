"use client";

import React from "react";
import { AlertTriangle, Info, XCircle, Loader2 } from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "info";

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          iconBg: "bg-red-100",
          confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          iconBg: "bg-yellow-100",
          confirmButton:
            "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
        };
      case "info":
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          iconBg: "bg-blue-100",
          confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="p-6">
      {/* Icon */}
      <div className="flex items-center justify-center mb-4">
        <div className={`${styles.iconBg} rounded-full p-3`}>{styles.icon}</div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
        {title}
      </h3>

      {/* Message */}
      <p className="text-gray-600 text-center mb-6 whitespace-pre-wrap">
        {message}
      </p>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isLoading) onCancel();
          }}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isLoading) onConfirm();
          }}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] ${styles.confirmButton}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            confirmText
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialog;
