"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LessonContent } from '@/types/backend-models';
import { Upload, ExternalLink } from 'lucide-react';

interface MediaContentEditorProps {
    type: 'video' | 'audio' | 'document';
    data: {
        url?: string;
        filename?: string;
        size?: number;
        mimeType?: string;
        duration?: number;
    };
    onChange: (data: any) => void;
}

export default function MediaContentEditor({ type, data, onChange }: MediaContentEditorProps) {
    const [url, setUrl] = useState(data?.url || '');
    const [filename, setFilename] = useState(data?.filename || '');
    const [duration, setDuration] = useState(data?.duration || 0);

    useEffect(() => {
        setUrl(data?.url || '');
        setFilename(data?.filename || '');
        setDuration(data?.duration || 0);
    }, [data]);

    const handleUpdate = (updates: any) => {
        const newData = { ...data, ...updates };
        onChange(newData);
    };

    const handleUrlChange = (newUrl: string) => {
        setUrl(newUrl);
        handleUpdate({ url: newUrl });
    };

    const handleFilenameChange = (newFilename: string) => {
        setFilename(newFilename);
        handleUpdate({ filename: newFilename });
    };

    const handleDurationChange = (newDuration: number) => {
        setDuration(newDuration);
        handleUpdate({ duration: newDuration });
    };

    const getAcceptedTypes = () => {
        switch (type) {
            case 'video':
                return 'video/*';
            case 'audio':
                return 'audio/*';
            case 'document':
                return '.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx';
            default:
                return '*/*';
        }
    };

    const renderPreview = () => {
        if (!url) return null;

        switch (type) {
            case 'video':
                return (
                    <div className="mt-4">
                        <video
                            src={url}
                            controls
                            className="w-full max-w-md rounded-lg border"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );
            case 'audio':
                return (
                    <div className="mt-4">
                        <audio
                            src={url}
                            controls
                            className="w-full max-w-md"
                        >
                            Your browser does not support the audio tag.
                        </audio>
                    </div>
                );
            case 'document':
                return (
                    <div className="mt-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ExternalLink className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">{filename || 'Document'}</p>
                                    <p className="text-sm text-gray-500">Click to view document</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 capitalize">{type} Content</h3>
            </div>

            <div className="space-y-4">
                {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                            <Button variant="outline" className="mb-2">
                                Upload {type}
                            </Button>
                            <p className="text-sm text-gray-500">
                                Or enter a URL below
                            </p>
                        </div>
                    </div>
                    <input
                        type="file"
                        accept={getAcceptedTypes()}
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                handleFilenameChange(file.name);
                                // In a real app, you'd upload the file and get a URL
                                console.log('File selected:', file);
                            }
                        }}
                    />
                </div>

                {/* URL Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {type.charAt(0).toUpperCase() + type.slice(1)} URL
                    </label>
                    <Input
                        value={url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder={`Enter ${type} URL`}
                        className="w-full"
                    />
                </div>

                {/* Filename */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Name (Optional)
                    </label>
                    <Input
                        value={filename}
                        onChange={(e) => handleFilenameChange(e.target.value)}
                        placeholder="Enter file name"
                        className="w-full"
                    />
                </div>

                {/* Duration for video/audio */}
                {(type === 'video' || type === 'audio') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration (seconds)
                        </label>
                        <Input
                            type="number"
                            value={duration}
                            onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
                            placeholder="Enter duration in seconds"
                            className="w-full"
                        />
                    </div>
                )}

                {/* Preview */}
                {renderPreview()}
            </div>

            <div className="text-sm text-gray-500">
                <p>Tips:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Upload files directly or provide a URL to external {type} content</li>
                    <li>For best performance, keep file sizes reasonable</li>
                    {type === 'video' && <li>Supported formats: MP4, WebM, OGV</li>}
                    {type === 'audio' && <li>Supported formats: MP3, WAV, OGG</li>}
                    {type === 'document' && <li>Supported formats: PDF, Word, PowerPoint, Excel, Text</li>}
                </ul>
            </div>
        </div>
    );
}