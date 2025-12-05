'use client';

import { useState } from 'react';
import { useGetAssignmentSubmissionsQuery, useGradeSubmissionMutation, type Submission } from '@/store/api/assignmentApi';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/toast-utils';
import Image from 'next/image';
import Link from 'next/link';

interface AssignmentGradingProps {
  assignmentId: string;
}

export default function AssignmentGrading({ assignmentId }: AssignmentGradingProps) {
  const { data, isLoading } = useGetAssignmentSubmissionsQuery(assignmentId);
  const [gradeSubmission, { isLoading: grading }] = useGradeSubmissionMutation();

  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  const assignment = data?.data?.assignment;
  const submissions = data?.data?.submissions || [];
  const summary = data?.data?.summary;
  const stats = data?.data?.stats;

  const handleGrade = async (submissionId: string) => {
    if (!score || isNaN(Number(score))) {
      toast.error('Please enter a valid score');
      return;
    }

    const scoreNum = Number(score);
    if (scoreNum < 0 || scoreNum > (assignment?.maxScore || 100)) {
      toast.error(`Score must be between 0 and ${assignment?.maxScore || 100}`);
      return;
    }

    try {
      await gradeSubmission({
        assignmentId,
        submissionId,
        data: { score: scoreNum, feedback },
      }).unwrap();
      toast.success('Submission graded successfully!');
      setGradingSubmission(null);
      setScore('');
      setFeedback('');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to grade submission'));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Students</div>
            <div className="text-2xl font-bold">{summary.totalStudents}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Submitted</div>
            <div className="text-2xl font-bold text-green-600">{summary.submitted}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Not Submitted</div>
            <div className="text-2xl font-bold text-red-600">{summary.notSubmitted}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Graded</div>
            <div className="text-2xl font-bold text-blue-600">{summary.graded}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-orange-600">{summary.pending}</div>
          </div>
        </div>
      )}

      {stats && stats.graded > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Class Performance</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Average Score:</span>
              <span className="ml-2 font-semibold">{stats.averageScore.toFixed(1)} / {assignment?.maxScore}</span>
            </div>
            <div>
              <span className="text-gray-600">Pass Rate:</span>
              <span className="ml-2 font-semibold">{stats.passRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Student Submissions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No submissions yet</div>
          ) : (
            submissions.map((submission: Submission) => (
              <div key={submission._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {submission.student.avatar ? (
                      <Image
                        src={submission.student.avatar}
                        alt={submission.student.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {submission.student.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">{submission.student.name}</h4>
                      <p className="text-sm text-gray-600">{submission.student.email}</p>
                      <p className="text-sm text-gray-500">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                      {submission.isLate && <span className="text-xs text-red-600 font-semibold">LATE</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    {submission.grade ? (
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {submission.grade.score} / {submission.grade.maxScore}
                        </div>
                        <div className="text-sm text-gray-600">{submission.grade.percentage.toFixed(1)}%</div>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Submission Content */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  {submission.content && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Submission:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                    </div>
                  )}
                  {submission.url && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">URL:</p>
                      <Link href={submission.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {submission.url}
                      </Link>
                    </div>
                  )}
                  {submission.files && submission.files.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Files:</p>
                      {submission.files.map((file: { url: string; originalName: string }, idx: number) => (
                        <Link key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline text-sm">
                          📎 {file.originalName}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grading Section */}
                {gradingSubmission === submission._id ? (
                  <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h5 className="font-semibold mb-3">Grade Submission</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Score (0 - {assignment?.maxScore})
                        </label>
                        <input
                          type="number"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="0"
                          max={assignment?.maxScore}
                          placeholder="Enter score"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback (optional)</label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Enter feedback for the student..."
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGrade(submission._id)}
                          disabled={grading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {grading ? 'Saving...' : 'Submit Grade'}
                        </button>
                        <button
                          onClick={() => {
                            setGradingSubmission(null);
                            setScore('');
                            setFeedback('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    {submission.grade ? (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {submission.grade.feedback && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Your Feedback:</p>
                            <p className="text-sm text-gray-600 mt-1">{submission.grade.feedback}</p>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setGradingSubmission(submission._id);
                            setScore(submission.grade?.score.toString() || '');
                            setFeedback(submission.grade?.feedback || '');
                          }}
                          className="mt-2 text-sm text-blue-600 hover:underline"
                        >
                          Edit Grade
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setGradingSubmission(submission._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Grade This Submission
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
