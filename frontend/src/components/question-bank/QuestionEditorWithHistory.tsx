// src/components/question-bank/QuestionEditorWithHistory.tsx
'use client'

import { useState } from 'react'
import { QuestionEditor } from './QuestionEditor'
import { VersionHistory } from './version-history/VersionHistory'
import { VersionComparison } from './version-history/VersionComparison'
import { RestoreVersionDialog } from './version-history/RestoreVersionDialog'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { History, GitCompare, X } from 'lucide-react'
import { Question } from '@/types'
import {
  useGetQuestionVersionsQuery,
  useCompareVersionsQuery,
  useRestoreVersionMutation,
  QuestionVersion
} from '@/store/api/questionVersionApi'
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils'
import { cn } from '@/lib/utils'

interface QuestionEditorWithHistoryProps {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: (id: string) => void
  showVersionHistory?: boolean
}

export function QuestionEditorWithHistory({
  question,
  onUpdate,
  onDelete,
  showVersionHistory = true
}: QuestionEditorWithHistoryProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [compareVersions, setCompareVersions] = useState<{ from: number; to: number } | null>(null)
  const [restoreVersion, setRestoreVersion] = useState<QuestionVersion | null>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor')

  const questionId = question._id || question.id

  // Fetch version history
  const {
    data: versionsData,
    isLoading: isLoadingVersions,
    refetch: refetchVersions
  } = useGetQuestionVersionsQuery(
    { questionId: questionId || '', page: 1, limit: 50 },
    { skip: !questionId || !showHistory }
  )

  // Fetch comparison data
  const {
    data: comparisonData,
    isLoading: isLoadingComparison
  } = useCompareVersionsQuery(
    {
      questionId: questionId || '',
      from: compareVersions?.from || 0,
      to: compareVersions?.to || 0
    },
    { skip: !compareVersions || !questionId }
  )

  const [restoreVersionMutation, { isLoading: isRestoring }] = useRestoreVersionMutation()

  const versions = versionsData?.data?.versions || []
  const latestVersion = versions.length > 0 ? versions[0].version : undefined

  const handleShowHistory = () => {
    setShowHistory(true)
    setActiveTab('history')
  }

  const handleCompare = (from: number, to: number) => {
    setCompareVersions({ from, to })
  }

  const handleCloseComparison = () => {
    setCompareVersions(null)
  }

  const handleRestoreClick = (version: number) => {
    const versionToRestore = versions.find(v => v.version === version)
    if (versionToRestore) {
      setRestoreVersion(versionToRestore)
    }
  }

  const handleConfirmRestore = async (version: number) => {
    if (!questionId) return

    try {
      const result = await restoreVersionMutation({
        questionId,
        versionNumber: version
      }).unwrap()

      showSuccessToast('Version restored successfully')
      setRestoreVersion(null)
      refetchVersions()

      // Update the question in the parent component
      if (result.data.question) {
        onUpdate(result.data.question)
      }
    } catch (error) {
      showErrorToast('Failed to restore version', 'Please try again')
    }
  }

  return (
    <div className="space-y-4">
      {showVersionHistory && questionId && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'editor' | 'history')}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <History className="w-4 h-4 mr-2" />
                Version History
                {versions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {versions.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {activeTab === 'editor' && versions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowHistory}
              >
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
            )}
          </div>

          <TabsContent value="editor" className="mt-0">
            <QuestionEditor
              question={question}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {compareVersions && comparisonData ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <GitCompare className="w-5 h-5 mr-2 text-blue-600" />
                      <h3 className="text-lg font-semibold">
                        Version Comparison: v{compareVersions.from} vs v{compareVersions.to}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseComparison}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {isLoadingComparison ? (
                    <div className="text-center py-12 text-gray-500">
                      Loading comparison...
                    </div>
                  ) : (
                    <VersionComparison comparison={comparisonData.data} />
                  )}
                </CardContent>
              </Card>
            ) : (
              <VersionHistory
                questionId={questionId}
                versions={versions}
                currentVersion={latestVersion}
                isLoading={isLoadingVersions}
                onRestore={handleRestoreClick}
                onCompare={handleCompare}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      {!showVersionHistory && (
        <QuestionEditor
          question={question}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}

      {/* Restore Version Dialog */}
      <RestoreVersionDialog
        isOpen={!!restoreVersion}
        onClose={() => setRestoreVersion(null)}
        version={restoreVersion}
        currentVersion={latestVersion}
        onConfirm={handleConfirmRestore}
        isRestoring={isRestoring}
      />
    </div>
  )
}
