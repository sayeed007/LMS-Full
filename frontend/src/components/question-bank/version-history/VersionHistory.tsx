// src/components/question-bank/version-history/VersionHistory.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Clock, User, RefreshCw, GitCompare, Loader2 } from 'lucide-react'
import { QuestionVersion } from '@/store/api/questionVersionApi'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface VersionHistoryProps {
  questionId: string
  versions: QuestionVersion[]
  currentVersion?: number
  isLoading?: boolean
  onRestore?: (version: number) => void
  onCompare?: (fromVersion: number, toVersion: number) => void
}

export function VersionHistory({
  questionId,
  versions,
  currentVersion,
  isLoading,
  onRestore,
  onCompare
}: VersionHistoryProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([])

  const handleSelectForCompare = (version: number) => {
    if (selectedForCompare.includes(version)) {
      setSelectedForCompare(selectedForCompare.filter(v => v !== version))
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, version])
    } else {
      // Replace the oldest selection
      setSelectedForCompare([selectedForCompare[1], version])
    }
  }

  const handleCompare = () => {
    if (selectedForCompare.length === 2 && onCompare) {
      const [from, to] = selectedForCompare.sort((a, b) => a - b)
      onCompare(from, to)
    }
  }

  const clearCompareSelection = () => {
    setSelectedForCompare([])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No version history available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Compare Actions */}
      {selectedForCompare.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedForCompare.length === 1
                    ? `1 version selected`
                    : `Comparing versions ${selectedForCompare.sort((a, b) => a - b).join(' and ')}`}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompareSelection}
                >
                  Clear
                </Button>
                {selectedForCompare.length === 2 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCompare}
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Compare
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Version items */}
        <div className="space-y-4">
          {versions.map((version, index) => {
            const isSelected = selectedForCompare.includes(version.version)
            const isCurrent = currentVersion === version.version
            const isLatest = index === 0

            return (
              <div
                key={version._id}
                className={cn(
                  "relative pl-16",
                  isSelected && "opacity-75"
                )}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute left-6 w-5 h-5 rounded-full border-4 border-white z-10",
                    isCurrent ? "bg-blue-600" : "bg-gray-300",
                    isSelected && "ring-2 ring-blue-400"
                  )}
                />

                <Card className={cn(
                  "transition-all",
                  isSelected && "border-blue-400 bg-blue-50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            Version {version.version}
                          </h4>
                          {isLatest && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Latest
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Current
                            </span>
                          )}
                          {version.isAutoSaved && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Auto-saved
                            </span>
                          )}
                        </div>

                        {version.changeDescription && (
                          <p className="text-sm text-gray-600 mb-2">
                            {version.changeDescription}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {version.changedBy?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                          </div>
                          {version.modifiedFields && version.modifiedFields.length > 0 && (
                            <div>
                              Changed: {version.modifiedFields.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectForCompare(version.version)}
                          className={cn(
                            isSelected && "bg-blue-100 text-blue-700"
                          )}
                        >
                          <GitCompare className="w-4 h-4" />
                        </Button>
                        {!isCurrent && onRestore && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRestore(version.version)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Preview of changes */}
                    {version.modifiedFields && version.modifiedFields.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {version.modifiedFields.map((field) => (
                            <span
                              key={field}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Version metadata */}
                    {version.dataSize && (
                      <div className="mt-2 text-xs text-gray-400">
                        Size: {(version.dataSize / 1024).toFixed(2)} KB
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Load more button if there are many versions */}
      {versions.length >= 20 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="sm">
            Load More Versions
          </Button>
        </div>
      )}
    </div>
  )
}
