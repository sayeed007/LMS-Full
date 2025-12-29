'use client';

import { useState } from 'react';
import '@/styles/quill-content.css';
import { articleTemplates, type ArticleTemplate } from '@/constants/articleTemplates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import PrimaryActionButton from '../ui/PrimaryButton';

interface TemplateSelectorProps {
    onSelectTemplate: (template: ArticleTemplate) => void;
    onCancel: () => void;
}

export const TemplateSelector = ({ onSelectTemplate, onCancel }: TemplateSelectorProps) => {
    const [selectedTemplate, setSelectedTemplate] = useState<ArticleTemplate | null>(null);

    const handleConfirm = () => {
        if (selectedTemplate) {
            onSelectTemplate(selectedTemplate);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose a Template</h3>
                <p className="text-gray-600">
                    Select a pre-made template to get started quickly. You can customize it after selection.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {articleTemplates.map((template) => (
                    <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate?.id === template.id
                                ? 'ring-2 ring-blue-500 shadow-md'
                                : 'hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="text-3xl">{template.icon}</div>
                                {selectedTemplate?.id === template.id && (
                                    <div className="bg-blue-500 rounded-full p-1">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>

                            <Badge variant="secondary" className="mb-3 text-xs">
                                {template.category}
                            </Badge>

                            <p className="text-sm text-gray-600 line-clamp-2">
                                {template.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedTemplate && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-blue-900 text-lg">
                                {selectedTemplate.icon} {selectedTemplate.name}
                            </h4>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {selectedTemplate.category}
                            </Badge>
                        </div>
                        <p className="text-sm text-blue-800 mb-4">{selectedTemplate.description}</p>

                        <div className="bg-white border border-blue-200 rounded-lg p-4">
                            <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Template Preview</h5>
                            <div className="max-h-[250px] overflow-y-auto">
                                <div
                                    className="quill-content text-sm"
                                    dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <PrimaryActionButton
                    onClick={handleConfirm}
                    disabled={!selectedTemplate}
                >
                    Use This Template
                </PrimaryActionButton>
            </div>
        </div>
    );
};
