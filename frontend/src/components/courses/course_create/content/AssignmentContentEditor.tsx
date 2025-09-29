"use client";

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ContentAssignment } from '@/types/backend-models';
import { useState } from 'react';

interface AssignmentContentEditorProps {
    data: { assignment?: ContentAssignment };
    onChange: (data: any) => void;
}

export default function AssignmentContentEditor({ data, onChange }: AssignmentContentEditorProps) {
    const assignment = data?.assignment || {
        title: '',
        description: '',
        instructions: '',
        submissionType: 'file' as const,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: [],
        maxSubmissions: 1,
        maxPoints: 100,
        gradingRubric: '',
        autoGrade: false,
        allowLateSubmission: false,
        lateSubmissionPenalty: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const [title, setTitle] = useState(assignment.title || '');
    const [description, setDescription] = useState(assignment.description || '');
    const [instructions, setInstructions] = useState(assignment.instructions || '');
    const [submissionType, setSubmissionType] = useState(assignment.submissionType || 'file');
    const [maxPoints, setMaxPoints] = useState(assignment.maxPoints || 100);
    const [maxSubmissions, setMaxSubmissions] = useState(assignment.maxSubmissions || 1);
    const [dueDate, setDueDate] = useState(assignment.dueDate || '');
    const [allowLateSubmission, setAllowLateSubmission] = useState(assignment.allowLateSubmission || false);
    const [lateSubmissionPenalty, setLateSubmissionPenalty] = useState(assignment.lateSubmissionPenalty || 0);

    const updateAssignment = (updates: Partial<ContentAssignment>) => {
        const newAssignment = { ...assignment, ...updates };
        onChange({ assignment: newAssignment });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Assignment Content</h3>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignment Title *
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                updateAssignment({ title: e.target.value });
                            }}
                            placeholder="Enter assignment title"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <Textarea
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                updateAssignment({ description: e.target.value });
                            }}
                            placeholder="Describe what students need to do"
                            rows={4}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instructions (Optional)
                        </label>
                        <Textarea
                            value={instructions}
                            onChange={(e) => {
                                setInstructions(e.target.value);
                                updateAssignment({ instructions: e.target.value });
                            }}
                            placeholder="Detailed instructions for completing the assignment"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Submission Settings */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-900">Submission Settings</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Submission Type
                        </label>
                        <select
                            value={submissionType}
                            onChange={(e) => {
                                const value = e.target.value as ContentAssignment['submissionType'];
                                setSubmissionType(value);
                                updateAssignment({ submissionType: value });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="file">File Upload</option>
                            <option value="text">Text Entry</option>
                            <option value="url">URL Submission</option>
                            <option value="mixed">Mixed (Multiple Types)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Points
                            </label>
                            <Input
                                type="number"
                                value={maxPoints}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 100;
                                    setMaxPoints(value);
                                    updateAssignment({ maxPoints: value });
                                }}
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Submissions
                            </label>
                            <Input
                                type="number"
                                value={maxSubmissions}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    setMaxSubmissions(value);
                                    updateAssignment({ maxSubmissions: value });
                                }}
                                min="1"
                            />
                        </div>
                    </div>

                    {submissionType === 'file' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Allowed File Types (Optional)
                            </label>
                            <Input
                                value={assignment.allowedFileTypes?.join(', ') || ''}
                                onChange={(e) => {
                                    const types = e.target.value.split(',').map(type => type.trim()).filter(Boolean);
                                    updateAssignment({ allowedFileTypes: types });
                                }}
                                placeholder="pdf, doc, docx, txt (leave blank for all types)"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Comma-separated list of file extensions
                            </p>
                        </div>
                    )}
                </div>

                {/* Deadlines */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-900">Deadlines</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date (Optional)
                        </label>
                        <Input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => {
                                setDueDate(e.target.value);
                                updateAssignment({ dueDate: e.target.value });
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="allow-late"
                            checked={allowLateSubmission}
                            onChange={(e) => {
                                setAllowLateSubmission(e.target.checked);
                                updateAssignment({ allowLateSubmission: e.target.checked });
                            }}
                            className="rounded"
                        />
                        <label htmlFor="allow-late" className="text-sm font-medium text-gray-700">
                            Allow Late Submissions
                        </label>
                    </div>

                    {allowLateSubmission && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Late Submission Penalty (%)
                            </label>
                            <Input
                                type="number"
                                value={lateSubmissionPenalty}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    setLateSubmissionPenalty(value);
                                    updateAssignment({ lateSubmissionPenalty: value });
                                }}
                                min="0"
                                max="100"
                            />
                        </div>
                    )}
                </div>

                {/* Grading */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-900">Grading</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grading Rubric (Optional)
                        </label>
                        <Textarea
                            value={assignment.gradingRubric || ''}
                            onChange={(e) => updateAssignment({ gradingRubric: e.target.value })}
                            placeholder="Describe how this assignment will be graded"
                            rows={4}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="auto-grade"
                            checked={assignment.autoGrade}
                            onChange={(e) => updateAssignment({ autoGrade: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="auto-grade" className="text-sm font-medium text-gray-700">
                            Enable Auto-Grading (if available)
                        </label>
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-500">
                <p>Assignment features:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Students can submit files, text, or URLs based on your settings</li>
                    <li>Set deadlines and configure late submission policies</li>
                    <li>Control the maximum number of submission attempts</li>
                    <li>Create detailed grading rubrics for consistent evaluation</li>
                </ul>
            </div>
        </div>
    );
}