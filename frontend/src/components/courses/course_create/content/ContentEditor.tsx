"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import {
    useGetContentByIdQuery,
    useUpdateContentMutation,
    UpdateContentRequest
} from '@/store/api/courseApi';
import { LessonContent } from '@/types/backend-models';
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import TextContentEditor from './TextContentEditor';
import BlockContentEditor from './BlockContentEditor';
import MediaContentEditor from './MediaContentEditor';
import QuizContentEditor from './QuizContentEditor';
import AssignmentContentEditor from './AssignmentContentEditor';

interface ContentEditorProps {
    courseId: string;
    lessonId: string;
    contentId: string;
}

export default function ContentEditor({ courseId, lessonId, contentId }: ContentEditorProps) {
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [objectives, setObjectives] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [contentData, setContentData] = useState<any>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // API hooks
    const {
        data: contentResponse,
        isLoading: isLoadingContent,
        error: contentError
    } = useGetContentByIdQuery({
        courseId,
        lessonId,
        contentId
    });

    const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();

    const content = contentResponse?.data?.content;

    // Initialize form data when content loads
    useEffect(() => {
        if (content) {
            setTitle(content.title);
            setDescription(content.description || '');
            setIsPublished(content.isPublished);
            setIsPreview(content.isPreview);
            setObjectives(content.objectives || []);
            setTags(content.tags || []);
            setContentData(content.data || {});
        }
    }, [content]);

    // Mark as having unsaved changes when data changes
    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [title, description, isPublished, isPreview, objectives, tags, contentData]);

    const handleSave = async () => {
        if (!content) return;

        try {
            const updateData: UpdateContentRequest = {
                title: title.trim(),
                description: description.trim(),
                data: contentData,
                isPublished,
                isPreview,
                objectives: objectives.filter(obj => obj.trim()),
                tags: tags.filter(tag => tag.trim())
            };

            await updateContent({
                courseId,
                lessonId,
                contentId,
                data: updateData
            }).unwrap();

            showSuccessToast('Content saved successfully!');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error saving content:', error);
            showErrorToast('Failed to save content');
        }
    };

    const handleBack = () => {
        if (hasUnsavedChanges) {
            const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
            if (!confirmed) return;
        }
        router.push(`/courses/create/${courseId}/courseOutline`);
    };

    const renderContentEditor = () => {
        if (!content) return null;

        switch (content.type) {
            case 'text':
                return (
                    <TextContentEditor
                        data={contentData}
                        onChange={setContentData}
                    />
                );
            case 'block':
                return (
                    <BlockContentEditor
                        data={contentData}
                        onChange={setContentData}
                    />
                );
            case 'video':
            case 'audio':
            case 'document':
                return (
                    <MediaContentEditor
                        type={content.type}
                        data={contentData}
                        onChange={setContentData}
                    />
                );
            case 'quiz':
                return (
                    <QuizContentEditor
                        data={contentData}
                        onChange={setContentData}
                    />
                );
            case 'assignment':
                return (
                    <AssignmentContentEditor
                        data={contentData}
                        onChange={setContentData}
                    />
                );
            default:
                return <div>Unsupported content type</div>;
        }
    };

    if (isLoadingContent) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (contentError || !content) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-600">Failed to load content</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Course Outline
                            </Button>
                            <div className="h-6 w-px bg-gray-300" />
                            <div>
                                <h1 className="text-lg font-semibold">{content.title}</h1>
                                <p className="text-sm text-gray-500 capitalize">{content.type} Content</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsPreview(!isPreview)}
                                className="flex items-center gap-2"
                            >
                                {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {isPreview ? 'Hide Preview' : 'Preview'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setIsPublished(!isPublished)}
                                className={`flex items-center gap-2 ${
                                    isPublished
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                            >
                                {isPublished ? 'Published' : 'Draft'}
                            </Button>

                            <Button
                                onClick={handleSave}
                                disabled={isUpdating || !hasUnsavedChanges}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isUpdating ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Content Editor */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {/* Basic Info */}
                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content Title
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter content title"
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter content description"
                                        className="w-full"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Content Type-specific Editor */}
                            {renderContentEditor()}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Learning Objectives */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Objectives</h3>
                            <div className="space-y-2">
                                {objectives.map((objective, index) => (
                                    <Input
                                        key={index}
                                        value={objective}
                                        onChange={(e) => {
                                            const newObjectives = [...objectives];
                                            newObjectives[index] = e.target.value;
                                            setObjectives(newObjectives);
                                        }}
                                        placeholder="Enter learning objective"
                                    />
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={() => setObjectives([...objectives, ''])}
                                    className="w-full"
                                >
                                    Add Objective
                                </Button>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                            <Input
                                value={tags.join(', ')}
                                onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
                                placeholder="Enter tags separated by commas"
                            />
                        </div>

                        {/* Content Stats */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Content Stats</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Views:</span>
                                    <span>{content.views}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className={isPublished ? 'text-green-600' : 'text-gray-600'}>
                                        {isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Created:</span>
                                    <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Modified:</span>
                                    <span>{new Date(content.lastModified).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}