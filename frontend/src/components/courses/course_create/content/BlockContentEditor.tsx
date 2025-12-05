"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ContentBlockItem } from '@/types/backend-models';
import { Plus, Trash2, GripVertical, FileText, Image, Video, File } from 'lucide-react';

interface BlockContentEditorProps {
    data: { items?: ContentBlockItem[] };
    onChange: (data: { items?: ContentBlockItem[] }) => void;
}

const blockItemTypes = [
    { type: 'text' as const, label: 'Text', icon: FileText },
    { type: 'image' as const, label: 'Image', icon: Image },
    { type: 'video' as const, label: 'Video', icon: Video },
    { type: 'audio' as const, label: 'Audio', icon: Video },
    { type: 'document' as const, label: 'Document', icon: File },
];

export default function BlockContentEditor({ data, onChange }: BlockContentEditorProps) {
    const [items, setItems] = useState<ContentBlockItem[]>(data?.items || []);

    useEffect(() => {
        setItems(data?.items || []);
    }, [data?.items]);

    const updateItems = (newItems: ContentBlockItem[]) => {
        // Update order numbers
        const orderedItems = newItems.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        setItems(orderedItems);
        onChange({ items: orderedItems });
    };

    const addItem = (type: ContentBlockItem['type']) => {
        const newItem: ContentBlockItem = {
            _id: `temp_${Date.now()}`,
            type,
            order: items.length + 1,
            data: getDefaultItemData(type),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        updateItems([...items, newItem]);
    };

    const updateItem = (index: number, updates: Partial<ContentBlockItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        updateItems(newItems);
    };

    const deleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        updateItems(newItems);
    };

    // const moveItem = (fromIndex: number, toIndex: number) => {
    //     const newItems = [...items];
    //     const [movedItem] = newItems.splice(fromIndex, 1);
    //     newItems.splice(toIndex, 0, movedItem);
    //     updateItems(newItems);
    // };

    const getDefaultItemData = (type: ContentBlockItem['type']) => {
        switch (type) {
            case 'text':
                return { text: '' };
            case 'image':
                return { url: '', alt: '', title: '' };
            case 'video':
            case 'audio':
                return { url: '', title: '', duration: 0 };
            case 'document':
                return { url: '', filename: '', title: '' };
            default:
                return {};
        }
    };

    const renderItemEditor = (item: ContentBlockItem, index: number) => {
        const updateItemData = (dataUpdates: Record<string, unknown>) => {
            updateItem(index, {
                data: { ...item.data, ...dataUpdates }
            });
        };

        switch (item.type) {
            case 'text':
                return (
                    <Textarea
                        value={item.data.text || ''}
                        onChange={(e) => updateItemData({ text: e.target.value })}
                        placeholder="Enter text content"
                        className="min-h-[100px]"
                    />
                );

            case 'image':
                return (
                    <div className="space-y-3">
                        <Input
                            value={item.data.url || ''}
                            onChange={(e) => updateItemData({ url: e.target.value })}
                            placeholder="Image URL"
                        />
                        <Input
                            value={item.data.alt || ''}
                            onChange={(e) => updateItemData({ alt: e.target.value })}
                            placeholder="Alt text (for accessibility)"
                        />
                        <Input
                            value={item.data.title || ''}
                            onChange={(e) => updateItemData({ title: e.target.value })}
                            placeholder="Image title (optional)"
                        />
                    </div>
                );

            case 'video':
            case 'audio':
                return (
                    <div className="space-y-3">
                        <Input
                            value={item.data.url || ''}
                            onChange={(e) => updateItemData({ url: e.target.value })}
                            placeholder={`${item.type} URL`}
                        />
                        <Input
                            value={item.data.title || ''}
                            onChange={(e) => updateItemData({ title: e.target.value })}
                            placeholder="Title"
                        />
                        <Input
                            type="number"
                            value={item.data.duration || 0}
                            onChange={(e) => updateItemData({ duration: parseInt(e.target.value) || 0 })}
                            placeholder="Duration (seconds)"
                        />
                    </div>
                );

            case 'document':
                return (
                    <div className="space-y-3">
                        <Input
                            value={item.data.url || ''}
                            onChange={(e) => updateItemData({ url: e.target.value })}
                            placeholder="Document URL"
                        />
                        <Input
                            value={item.data.filename || ''}
                            onChange={(e) => updateItemData({ filename: e.target.value })}
                            placeholder="File name"
                        />
                        <Input
                            value={item.data.title || ''}
                            onChange={(e) => updateItemData({ title: e.target.value })}
                            placeholder="Document title"
                        />
                    </div>
                );

            default:
                return <div>Unsupported item type</div>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Block Content</h3>
                <div className="relative">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </Button>
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[180px] hidden group-hover:block">
                        {blockItemTypes.map((type) => {
                            const IconComponent = type.icon;
                            return (
                                <button
                                    key={type.type}
                                    onClick={() => addItem(type.type)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                                >
                                    <IconComponent className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm">{type.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="space-y-4">
                        <p className="text-gray-500">No items added yet</p>
                        <div className="flex justify-center gap-2">
                            {blockItemTypes.map((type) => {
                                const IconComponent = type.icon;
                                return (
                                    <Button
                                        key={type.type}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addItem(type.type)}
                                        className="flex items-center gap-2"
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        {type.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item, index) => {
                        const typeInfo = blockItemTypes.find(t => t.type === item.type);
                        const IconComponent = typeInfo?.icon || File;

                        return (
                            <div
                                key={item._id}
                                className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                        <IconComponent className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium capitalize">{item.type} Item</span>
                                        <span className="text-sm text-gray-500">#{item.order}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteItem(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {renderItemEditor(item, index)}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="text-sm text-gray-500">
                <p>Block content allows you to combine multiple types of content in a single lesson section. Each item will be displayed in the order shown above.</p>
            </div>
        </div>
    );
}