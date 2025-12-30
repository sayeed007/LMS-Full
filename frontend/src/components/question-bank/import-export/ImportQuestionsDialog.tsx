// src/components/question-bank/import-export/ImportQuestionsDialog.tsx
'use client'

import { useState, useRef } from 'react'
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
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { ExportFormat, useImportQuestionsMutation } from '@/store/api/questionImportExportApi'
import { cn } from '@/lib/utils'

interface ImportResult {
  data: {
    importedCount: number;
    totalProvided: number;
  };
}

interface ImportQuestionsDialogProps {
  isOpen: boolean
  onClose: () => void
  questionBankId: string
  onSuccess?: (result: ImportResult) => void
}

export function ImportQuestionsDialog({
  isOpen,
  onClose,
  questionBankId,
  onSuccess
}: ImportQuestionsDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importQuestions, { isLoading, isSuccess, isError, error, data }] = useImportQuestionsMutation()

  const formats = [
    {
      value: 'csv' as ExportFormat,
      label: 'CSV',
      description: 'Comma-separated values format',
      accept: '.csv',
      icon: FileText
    },
    {
      value: 'json' as ExportFormat,
      label: 'JSON',
      description: 'JavaScript Object Notation',
      accept: '.json',
      icon: FileText
    },
    {
      value: 'qti' as ExportFormat,
      label: 'QTI',
      description: 'IMS QTI 2.1 format (XML)',
      accept: '.xml',
      icon: FileText
    }
  ]

  const selectedFormatInfo = formats.find(f => f.value === selectedFormat)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setFileContent(content)
    }
    reader.readAsText(selectedFile)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!fileContent) return

    try {
      const result = await importQuestions({
        questionBankId,
        format: selectedFormat,
        data: fileContent
      }).unwrap()

      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      console.error('Import failed:', err)
    }
  }

  const handleClose = () => {
    setFile(null)
    setFileContent('')
    setSelectedFormat('csv')
    setDragActive(false)
    onClose()
  }

  const handleReset = () => {
    setFile(null)
    setFileContent('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            Import Questions
          </DialogTitle>
          <DialogDescription>
            Import questions from a file in CSV, JSON, or QTI format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          {!isSuccess && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Select Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {formats.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setSelectedFormat(format.value)}
                      className={cn(
                        "p-4 border-2 rounded-lg text-left transition-all hover:border-blue-300",
                        selectedFormat === format.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white"
                      )}
                    >
                      <format.icon className={cn(
                        "w-5 h-5 mb-2",
                        selectedFormat === format.value ? "text-blue-600" : "text-gray-400"
                      )} />
                      <div className="font-medium text-sm">{format.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{format.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Upload File
                </label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                    dragActive
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-gray-50",
                    file && "border-green-600 bg-green-50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                      >
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-700">
                          Drop your {selectedFormatInfo?.label} file here
                        </p>
                        <p className="text-sm text-gray-500 mt-1">or</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={selectedFormatInfo?.accept}
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Accepted format: {selectedFormatInfo?.accept}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Format Help */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  {selectedFormat === 'csv' && (
                    <>
                      CSV format: Include headers (text, type, choices, difficulty, points, tags).
                      Use pipe (|) to separate choices and [*] to mark correct answers.
                    </>
                  )}
                  {selectedFormat === 'json' && (
                    <>
                      JSON format: Array of question objects with all required fields.
                      Supports complete question data with metadata.
                    </>
                  )}
                  {selectedFormat === 'qti' && (
                    <>
                      QTI format: IMS QTI 2.1 compliant XML file.
                      Compatible with most LMS platforms.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600 font-medium">Importing questions...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
            </div>
          )}

          {/* Success State */}
          {isSuccess && data && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Import Successful!
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-green-600">
                    {data.data.importedCount}
                  </span>{' '}
                  out of {data.data.totalProvided} questions imported successfully
                </p>
                {data.data.importedCount < data.data.totalProvided && (
                  <p className="text-yellow-600">
                    {data.data.totalProvided - data.data.importedCount} questions were skipped
                    due to validation errors
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <p className="font-medium mb-1">Import failed</p>
                <p className="text-sm">
                  {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
                    ? String(error.data.message)
                    : 'An error occurred while importing questions. Please check your file format and try again.'}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {isSuccess ? (
            <Button variant="default" onClick={handleClose}>
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleImport}
                disabled={!file || !fileContent || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Questions
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
