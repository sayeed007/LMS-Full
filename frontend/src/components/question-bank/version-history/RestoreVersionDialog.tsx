// src/components/question-bank/version-history/RestoreVersionDialog.tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Clock, User, Loader2 } from 'lucide-react'
import { QuestionVersion } from '@/store/api/questionVersionApi'
import { formatDistanceToNow } from 'date-fns'

interface RestoreVersionDialogProps {
  isOpen: boolean
  onClose: () => void
  version: QuestionVersion | null
  currentVersion?: number
  onConfirm: (version: number) => void
  isRestoring?: boolean
}

export function RestoreVersionDialog({
  isOpen,
  onClose,
  version,
  currentVersion,
  onConfirm,
  isRestoring = false
}: RestoreVersionDialogProps) {
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    if (version) {
      onConfirm(version.version)
    }
  }

  const handleClose = () => {
    setConfirmed(false)
    onClose()
  }

  if (!version) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
            Restore Version {version.version}
          </DialogTitle>
          <DialogDescription>
            You are about to restore this question to a previous version
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Alert */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Restoring this version will create a new version with the content from version {version.version}.
              Your current changes will be preserved in the version history.
            </AlertDescription>
          </Alert>

          {/* Version Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Version Information</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Version Number:</span>
                  <span className="font-semibold">#{version.version}</span>
                </div>
                {currentVersion && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Version:</span>
                    <span className="font-semibold">#{currentVersion}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Version Details</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  {version.changedBy?.name || 'Unknown'}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>

            {version.changeDescription && (
              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs font-medium text-gray-500 mb-1">Change Description</div>
                <p className="text-sm text-gray-700">{version.changeDescription}</p>
              </div>
            )}

            {version.modifiedFields && version.modifiedFields.length > 0 && (
              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs font-medium text-gray-500 mb-2">Modified Fields</div>
                <div className="flex flex-wrap gap-1">
                  {version.modifiedFields.map((field) => (
                    <span
                      key={field}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="confirm-restore"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="confirm-restore" className="text-sm text-gray-700">
              I understand that restoring this version will create a new version and the current content
              will be replaced with the content from version {version.version}.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRestoring}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!confirmed || isRestoring}
          >
            {isRestoring ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Restore Version
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
