// src/components/question-bank/QuestionBankActions.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Download, Upload } from 'lucide-react'
import { ImportQuestionsDialog } from './import-export/ImportQuestionsDialog'
import { ExportQuestionsDialog } from './import-export/ExportQuestionsDialog'
import { showSuccessToast } from '@/lib/toast-utils'

interface QuestionBankActionsProps {
  questionBankId: string
  questionBankName?: string
  onImportSuccess?: () => void
}

export function QuestionBankActions({
  questionBankId,
  questionBankName,
  onImportSuccess
}: QuestionBankActionsProps) {
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  const handleImportSuccess = (result: any) => {
    showSuccessToast(
      `Successfully imported ${result.data.importedCount} questions`,
      result.data.importedCount < result.data.totalProvided
        ? `${result.data.totalProvided - result.data.importedCount} questions were skipped`
        : undefined
    )
    setShowImportDialog(false)
    if (onImportSuccess) {
      onImportSuccess()
    }
  }

  return (
    <>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportDialog(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExportDialog(true)}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Import Dialog */}
      <ImportQuestionsDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        questionBankId={questionBankId}
        onSuccess={handleImportSuccess}
      />

      {/* Export Dialog */}
      <ExportQuestionsDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        questionBankId={questionBankId}
        questionBankName={questionBankName}
      />
    </>
  )
}
