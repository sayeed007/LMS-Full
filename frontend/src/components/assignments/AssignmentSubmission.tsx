'use client';

import { useState } from 'react';
import { useSubmitAssignmentMutation, useGetMySubmissionQuery } from '@/store/api/assignmentApi';
import { toast } from 'sonner';

interface AssignmentSubmissionProps {
  assignmentId: string;
  submissionType: 'text' | 'file' | 'url' | 'code';
  maxScore: number;
  dueDate: string;
}

export default function AssignmentSubmission({
  assignmentId,
  submissionType,
  maxScore,
  dueDate,
}: AssignmentSubmissionProps) {
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<any[]>([]);

  const { data: submissionData, isLoading: loadingSubmission } = useGetMySubmissionQuery(assignmentId);
  const [submitAssignment, { isLoading: submitting }] = useSubmitAssignmentMutation();

  const mySubmission = submissionData?.data;
  const hasSubmitted = mySubmission?.hasSubmitted;
  const canSubmit = mySubmission?.canSubmit;
  const isGraded = mySubmission?.isGraded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData: any = {};

    if (submissionType === 'text' || submissionType === 'code') {
      if (!content.trim()) {
        toast.error('Please enter your submission content');
        return;
      }
      submissionData.content = content;
    } else if (submissionType === 'url') {
      if (!url.trim()) {
        toast.error('Please enter a valid URL');
        return;
      }
      submissionData.url = url;
    } else if (submissionType === 'file') {
      if (files.length === 0) {
        toast.error('Please upload at least one file');
        return;
      }
      submissionData.files = files;
    }

    try {
      await submitAssignment({ id: assignmentId, data: submissionData }).unwrap();
      toast.success('Assignment submitted successfully!');
      setContent('');
      setUrl('');
      setFiles([]);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit assignment');
    }
  };

  if (loadingSubmission) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Submit Assignment</h2>

      {/* Submission Status */}
      {hasSubmitted && (
        <div className={`mb-6 p-4 rounded-lg ${
          isGraded ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h3 className="font-semibold mb-2">
            {isGraded ? '✅ Graded' : '📝 Submitted - Awaiting Grade'}
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Submitted: {new Date(mySubmission.submission?.submittedAt || '').toLocaleString()}</p>
            {isGraded && mySubmission.submission?.grade && (
              <>
                <p className="font-semibold text-lg mt-2">
                  Score: {mySubmission.submission.grade.score} / {maxScore} ({mySubmission.submission.grade.percentage.toFixed(1)}%)
                </p>
                {mySubmission.submission.grade.feedback && (
                  <div className="mt-3">
                    <p className="font-semibold">Instructor Feedback:</p>
                    <p className="mt-1 text-gray-600">{mySubmission.submission.grade.feedback}</p>
                  </div>
                )}
              </>
            )}
            {mySubmission.attemptsRemaining && mySubmission.attemptsRemaining > 0 && (
              <p className="mt-2">Attempts remaining: {mySubmission.attemptsRemaining}</p>
            )}
          </div>
        </div>
      )}

      {/* Submission Form */}
      {canSubmit && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {(submissionType === 'text' || submissionType === 'code') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your {submissionType === 'code' ? 'Code' : 'Answer'}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-64"
                placeholder={`Enter your ${submissionType} here...`}
                required
              />
            </div>
          )}

          {submissionType === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
                required
              />
            </div>
          )}

          {submissionType === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Note: File upload requires Cloudinary integration. Enter file info manually for demo.
              </p>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="File URL (from Cloudinary)"
                onChange={(e) => {
                  if (e.target.value) {
                    setFiles([{ filename: 'file', originalName: 'submission', url: e.target.value, size: 1024, mimeType: 'application/pdf' }]);
                  }
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-gray-600">
              Due: {new Date(dueDate).toLocaleString()}
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      )}

      {!canSubmit && hasSubmitted && (
        <p className="text-center text-gray-600 py-4">
          You have used all available attempts for this assignment.
        </p>
      )}
    </div>
  );
}
