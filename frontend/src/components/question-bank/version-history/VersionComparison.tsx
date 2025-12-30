// src/components/question-bank/version-history/VersionComparison.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, User, Clock } from 'lucide-react'
import { VersionComparison as VersionComparisonType } from '@/store/api/questionVersionApi'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface VersionComparisonProps {
  comparison: VersionComparisonType
}

export function VersionComparison({ comparison }: VersionComparisonProps) {
  const { from, to, changes } = comparison

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'None'
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? JSON.stringify(value, null, 2) : 'Empty array'
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const renderChoices = (choices: any[]): JSX.Element => {
    if (!choices || choices.length === 0) {
      return <div className="text-gray-400 italic">No choices</div>
    }

    return (
      <div className="space-y-2">
        {choices.map((choice, index) => (
          <div
            key={index}
            className={cn(
              "p-2 rounded border",
              choice.isCorrect
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: choice.text || 'Empty choice' }}
                />
              </div>
              {choice.isCorrect && (
                <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                  Correct
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with version info */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Version {from.version}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                {from.changedBy?.name || 'Unknown'}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {formatDistanceToNow(new Date(from.createdAt), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Version {to.version}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                {to.changedBy?.name || 'Unknown'}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {formatDistanceToNow(new Date(to.createdAt), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Changes Summary */}
      {changes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Changes Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 text-sm">
              {changes.modified && changes.modified.length > 0 && (
                <div className="flex items-center">
                  <Badge className="bg-yellow-100 text-yellow-800 mr-2">
                    {changes.modified.length}
                  </Badge>
                  <span className="text-gray-600">Modified</span>
                </div>
              )}
              {changes.added && changes.added.length > 0 && (
                <div className="flex items-center">
                  <Badge className="bg-green-100 text-green-800 mr-2">
                    {changes.added.length}
                  </Badge>
                  <span className="text-gray-600">Added</span>
                </div>
              )}
              {changes.removed && changes.removed.length > 0 && (
                <div className="flex items-center">
                  <Badge className="bg-red-100 text-red-800 mr-2">
                    {changes.removed.length}
                  </Badge>
                  <span className="text-gray-600">Removed</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Side-by-side comparison */}
      {changes?.modified && changes.modified.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Modified Fields</h3>
          {changes.modified.map((change, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                  {change.field}
                  <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
                  <Badge className="bg-yellow-100 text-yellow-800">Changed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Old Value */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      Old Value (v{from.version})
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      {change.field === 'choices' ? (
                        renderChoices(change.oldValue)
                      ) : change.field === 'text' || change.field === 'explanation' ? (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: change.oldValue || '<span class="text-gray-400 italic">Empty</span>'
                          }}
                        />
                      ) : (
                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                          {renderValue(change.oldValue)}
                        </pre>
                      )}
                    </div>
                  </div>

                  {/* New Value */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      New Value (v{to.version})
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      {change.field === 'choices' ? (
                        renderChoices(change.newValue)
                      ) : change.field === 'text' || change.field === 'explanation' ? (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: change.newValue || '<span class="text-gray-400 italic">Empty</span>'
                          }}
                        />
                      ) : (
                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                          {renderValue(change.newValue)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Added fields */}
      {changes?.added && changes.added.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Added Fields</h3>
          {changes.added.map((field, index) => (
            <Card key={index} className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <Badge className="bg-green-100 text-green-800 mb-2">Added</Badge>
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                  {renderValue(field)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Removed fields */}
      {changes?.removed && changes.removed.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Removed Fields</h3>
          {changes.removed.map((field, index) => (
            <Card key={index} className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <Badge className="bg-red-100 text-red-800 mb-2">Removed</Badge>
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                  {renderValue(field)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No changes message */}
      {(!changes ||
        (!changes.modified?.length &&
          !changes.added?.length &&
          !changes.removed?.length)) && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No differences found between these versions</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
