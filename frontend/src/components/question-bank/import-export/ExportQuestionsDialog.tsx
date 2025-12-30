// src/components/question-bank/import-export/ExportQuestionsDialog.tsx
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
import { Button } from '@/components/ui/Button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, FileText, Database, FileCode, CheckCircle, Loader2, Info } from 'lucide-react'
import { ExportFormat, useLazyExportQuestionsQuery } from '@/store/api/questionImportExportApi'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/Switch'

interface ExportQuestionsDialogProps {
  isOpen: boolean
  onClose: () => void
  questionBankId: string
  questionBankName?: string
}

export function ExportQuestionsDialog({
  isOpen,
  onClose,
  questionBankId,
  questionBankName = 'questions'
}: ExportQuestionsDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const [triggerExport] = useLazyExportQuestionsQuery()

  const formats = [
    {
      value: 'csv' as ExportFormat,
      label: 'CSV',
      description: 'Comma-separated values format',
      icon: FileText,
      extension: '.csv',
      details: 'Best for spreadsheet applications and simple data imports. Includes headers and pipe-separated choices.',
      mimeType: 'text/csv'
    },
    {
      value: 'json' as ExportFormat,
      label: 'JSON',
      description: 'JavaScript Object Notation',
      icon: Database,
      extension: '.json',
      details: 'Best for backups and data migration. Includes complete question data with all metadata.',
      mimeType: 'application/json'
    },
    {
      value: 'qti' as ExportFormat,
      label: 'QTI',
      description: 'IMS QTI 2.1 format (XML)',
      icon: FileCode,
      extension: '.xml',
      details: 'Best for LMS integration. IMS QTI 2.1 compliant format compatible with most learning platforms.',
      mimeType: 'application/xml'
    }
  ]

  const selectedFormatInfo = formats.find(f => f.value === selectedFormat)

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)

    try {
      const result = await triggerExport({
        questionBankId,
        format: selectedFormat,
        includeMetadata
      }).unwrap()

      // Create blob and download
      const blob = new Blob([result], { type: selectedFormatInfo?.mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${questionBankName}-${selectedFormat}-${new Date().toISOString().split('T')[0]}${selectedFormatInfo?.extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    setExportSuccess(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2 text-blue-600" />
            Export Questions
          </DialogTitle>
          <DialogDescription>
            Export your questions in various formats for backup or import into other systems
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success State */}
          {exportSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Export Successful!
              </h3>
              <p className="text-sm text-gray-600">
                Your questions have been downloaded successfully
              </p>
            </div>
          ) : (
            <>
              {/* Format Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Select Export Format
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {formats.map((format) => {
                    const Icon = format.icon
                    const isSelected = selectedFormat === format.value

                    return (
                      <button
                        key={format.value}
                        onClick={() => setSelectedFormat(format.value)}
                        className={cn(
                          "p-4 border-2 rounded-lg text-left transition-all hover:border-blue-300",
                          isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 bg-white"
                        )}
                      >
                        <div className="flex items-start">
                          <Icon className={cn(
                            "w-6 h-6 mr-3 mt-1 flex-shrink-0",
                            isSelected ? "text-blue-600" : "text-gray-400"
                          )} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold text-gray-900">
                                {format.label}
                              </div>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded",
                                isSelected
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                              )}>
                                {format.extension}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {format.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format.details}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Options */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Export Options
                </label>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      Include Metadata
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Include creation dates, authors, and other metadata in the export
                    </p>
                  </div>
                  <Switch
                    checked={includeMetadata}
                    onChange={setIncludeMetadata}
                  />
                </div>
              </div>

              {/* Info Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  {selectedFormat === 'csv' && (
                    <>
                      CSV exports use pipe (|) to separate choices and [*] to mark correct answers.
                      HTML content will be stripped to plain text.
                    </>
                  )}
                  {selectedFormat === 'json' && (
                    <>
                      JSON exports include complete question data with all metadata.
                      This format is ideal for backups and data migration.
                    </>
                  )}
                  {selectedFormat === 'qti' && (
                    <>
                      QTI 2.1 exports are compatible with Moodle, Canvas, Blackboard, and other LMS platforms.
                      Includes question metadata and response processing.
                    </>
                  )}
                </AlertDescription>
              </Alert>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  File Preview
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {selectedFormatInfo && <selectedFormatInfo.icon className="w-4 h-4 mr-2 text-gray-400" />}
                    <span className="font-medium text-gray-900">
                      {questionBankName}-{selectedFormat}-{new Date().toISOString().split('T')[0]}{selectedFormatInfo?.extension}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {selectedFormatInfo?.mimeType}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {exportSuccess ? (
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {selectedFormatInfo?.label}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
