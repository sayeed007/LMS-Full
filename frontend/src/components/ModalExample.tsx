"use client"
import { ModalOptions } from '@/lib/modal-context';
import { useModalActions } from '@/lib/modal-utils';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Info,
    Mail,
    MapPin,
    Phone,
    Pickaxe,
    Settings,
    ShoppingCart,
    Trash2,
    User,
    XCircle
} from 'lucide-react';
import Image from 'next/image';
import React, { FormEvent, ReactNode, useState } from 'react';

interface ModalProps {
    onClose: () => void;
}

// interface ConfirmModalProps {
//     title: string;
//     message: string;
//     variant: string;
//     onConfirm: () => void;
//     onCancel: () => void;
// }
interface ConfirmModalProps {
    title: string;
    message: string;
    variant?: 'danger' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface VariantConfig {
    color: string;
    icon: ReactNode;
    buttonClass: string;
}

// Demo Modal Components
const SimpleModal = ({ onClose }: ModalProps) => (
    <div className="p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Simple Modal
        </h2>
        <p className="text-gray-600 mb-4">
            This is a basic modal with simple content. Perfect for displaying information or simple interactions.
        </p>
        <div className="flex gap-2 justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Got it
            </button>
        </div>
    </div>
);

const ContactFormModal = ({ onClose }: ModalProps) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onClose();
    };

    return (
        <div className="p-6 max-w-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Contact Form
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                    </label>
                    <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Tell us how we can help you..."
                    />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Send Message
                    </button>
                </div>
            </form>
        </div>
    );
};

const UserProfileModal = ({ onClose }: ModalProps) => (
    <div className="p-0 max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">John Doe</h2>
                    <p className="text-blue-100">Senior Developer</p>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">john.doe@company.com</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">San Francisco, CA</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {['React', 'TypeScript', 'Node.js', 'Python', 'AWS'].map((skill) => (
                            <span
                                key={skill}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                </button>
            </div>
        </div>
    </div>
);

const ImageGalleryModal = ({ onClose }: ModalProps) => {
    const [currentImage, setCurrentImage] = useState(0);
    const images = [
        `https://picsum.photos/800/600?random=1`,
        `https://picsum.photos/800/600?random=2`,
        `https://picsum.photos/800/600?random=3`,
        `https://picsum.photos/800/600?random=4`,
        `https://picsum.photos/800/600?random=5`,
        `https://picsum.photos/800/600?random=6`,
        `https://picsum.photos/800/600?random=7`,
        `https://picsum.photos/800/600?random=8`,
        `https://picsum.photos/800/600?random=9`,
    ];

    return (
        <div className="bg-black overflow-hidden flex flex-col h-full">
            <div className="relative h-4/5 overflow-clip">
                <Image
                    width={800}
                    height={600}
                    src={images[currentImage]}
                    alt={`Gallery image ${currentImage + 1}`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImage + 1} of {images.length}
                </div>
            </div>

            <div className="h-1/5 p-4 bg-gray-900">
                <div className="flex gap-2 justify-center mb-4">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImage(index)}
                            className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${currentImage === index ? 'border-white' : 'border-gray-600'
                                }`}
                        >
                            <Image
                                width={48}
                                height={48}
                                src={images[index]}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Next
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConfirmModal = ({ title, message, variant = 'info', onConfirm, onCancel }: ConfirmModalProps) => {
    const variants = {
        danger: {
            color: 'red',
            icon: <XCircle className="h-6 w-6 text-red-600" />,
            buttonClass: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            color: 'yellow',
            icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
            buttonClass: 'bg-yellow-600 hover:bg-yellow-700'
        },
        success: {
            color: 'green',
            icon: <CheckCircle className="h-6 w-6 text-green-600" />,
            buttonClass: 'bg-green-600 hover:bg-green-700'
        },
        info: {
            color: 'blue',
            icon: <Info className="h-6 w-6 text-blue-600" />,
            buttonClass: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const config: VariantConfig = variants?.[variant];

    return (
        <div className="p-6 max-w-md">
            <div className="flex items-center gap-3 mb-4">
                {config.icon}
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>

            <p className="text-gray-600 mb-6">{message}</p>

            <div className="flex gap-3 justify-end">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${config.buttonClass}`}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
};

const ShoppingCartModal = ({ onClose }: ModalProps) => {
    const [items, setItems] = useState([
        { id: 1, name: 'Wireless Headphones', price: 99.99, quantity: 1, image: 'https://picsum.photos/80/80?random=5' },
        { id: 2, name: 'Smartphone Case', price: 24.99, quantity: 2, image: 'https://picsum.photos/80/80?random=6' },
        { id: 3, name: 'USB Cable', price: 12.99, quantity: 1, image: 'https://picsum.photos/80/80?random=7' }
    ]);

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity === 0) {
            setItems(prev => prev.filter(item => item.id !== id));
        } else {
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="p-6 max-w-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Shopping Cart ({items.length} items)
            </h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Image
                            width={80}
                            height={80}
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-green-600 font-semibold">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                                -
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Continue Shopping
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Checkout
                </button>
            </div>
        </div>
    );
};

const SettingsModal = ({ onClose }: ModalProps) => {
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: false,
        language: 'en',
        autoSave: true
    });

    const updateSetting = (key: string, value: boolean | string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Settings
            </h2>

            <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Push Notifications</span>
                    <button
                        onClick={() => updateSetting('notifications', !settings.notifications)}
                        className={`w-11 h-6 rounded-full relative transition-colors ${settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dark Mode</span>
                    <button
                        onClick={() => updateSetting('darkMode', !settings.darkMode)}
                        className={`w-11 h-6 rounded-full relative transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto Save</span>
                    <button
                        onClick={() => updateSetting('autoSave', !settings.autoSave)}
                        className={`w-11 h-6 rounded-full relative transition-colors ${settings.autoSave ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                    </label>
                    <select
                        value={settings.language}
                        onChange={(e) => updateSetting('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        onClose();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

// Main Showcase Component
const ModalExample = () => {
    const { openModal, closeModal, closeAllModals, modals } = useModalActions();

    const showModal = (component: ReactNode, options: ModalOptions = {}) => {
        const safeOptions: Required<ModalOptions> = {
            size: options.size ?? 'md',
            position: options.position ?? 'center',
            closable: options.closable ?? true,
            backdrop: options.backdrop ?? true,
            persistent: options.persistent ?? false,
            showCloseButton: options.showCloseButton ?? true,
            className: options.className ?? '',
            overlayClassName: options.overlayClassName ?? '',
            onClose: options.onClose ?? (() => { }),
            onOpen: options.onOpen ?? (() => { }),
        };
        const modalId = openModal(component, safeOptions);
        return modalId;
    };

    const demoModals = [
        {
            category: "Basic Modals",
            items: [
                {
                    name: "Simple Modal",
                    description: "Basic modal with simple content",
                    icon: <Info className="h-4 w-4" />,
                    action: () => showModal(<SimpleModal onClose={() => closeModal()} />, { size: 'sm' }),
                    color: "blue"
                },
                {
                    name: "Contact Form",
                    description: "Modal with form elements",
                    icon: <Mail className="h-4 w-4" />,
                    action: () => showModal(<ContactFormModal onClose={() => closeModal()} />, { size: 'md' }),
                    color: "green"
                },
                {
                    name: "User Profile",
                    description: "Rich content modal",
                    icon: <User className="h-4 w-4" />,
                    action: () => showModal(<UserProfileModal onClose={() => closeModal()} />, { size: 'lg' }),
                    color: "purple"
                }
            ]
        },
        {
            category: "Position Examples",
            items: [
                {
                    name: "Top Position",
                    description: "Modal positioned at top",
                    icon: <Calendar className="h-4 w-4" />,
                    action: () => showModal(<SimpleModal onClose={() => closeModal()} />, {
                        size: 'md',
                        position: 'top'
                    }),
                    color: "indigo"
                },
                {
                    name: "Bottom Position",
                    description: "Modal positioned at bottom",
                    icon: <Clock className="h-4 w-4" />,
                    action: () => showModal(<SimpleModal onClose={() => closeModal()} />, {
                        size: 'md',
                        position: 'bottom'
                    }),
                    color: "pink"
                },
                {
                    name: "Full Screen",
                    description: "Full screen modal",
                    icon: <Pickaxe className="h-4 w-4" />,
                    action: () => showModal(<ImageGalleryModal onClose={() => closeModal()} />, {
                        size: 'full'
                    }),
                    color: "red"
                }
            ]
        },
        {
            category: "Confirmation Modals",
            items: [
                {
                    name: "Delete Confirmation",
                    description: "Dangerous action confirmation",
                    icon: <Trash2 className="h-4 w-4" />,
                    action: () => showModal(
                        <ConfirmModal
                            title="Delete Item"
                            message="Are you sure you want to delete this item? This action cannot be undone."
                            variant="danger"
                            onConfirm={() => {
                                closeModal();
                            }}
                            onCancel={() => closeModal()}
                        />,
                        { size: 'sm', persistent: true }
                    ),
                    color: "red"
                },
                {
                    name: "Save Changes",
                    description: "Save confirmation modal",
                    icon: <CheckCircle className="h-4 w-4" />,
                    action: () => showModal(
                        <ConfirmModal
                            title="Save Changes"
                            message="Do you want to save your changes before leaving?"
                            variant="success"
                            onConfirm={() => {
                                closeModal();
                            }}
                            onCancel={() => closeModal()}
                        />,
                        { size: 'sm' }
                    ),
                    color: "green"
                }
            ]
        },
        {
            category: "Advanced Examples",
            items: [
                {
                    name: "Shopping Cart",
                    description: "Interactive shopping cart",
                    icon: <ShoppingCart className="h-4 w-4" />,
                    action: () => showModal(<ShoppingCartModal onClose={() => closeModal()} />, {
                        size: 'md',
                        position: 'right'
                    }),
                    color: "emerald"
                },
                {
                    name: "Settings Panel",
                    description: "Settings with toggles",
                    icon: <Settings className="h-4 w-4" />,
                    action: () => showModal(<SettingsModal onClose={() => closeModal()} />, {
                        size: 'md'
                    }),
                    color: "gray"
                },
                {
                    name: "Persistent Modal",
                    description: "Cannot close by clicking outside",
                    icon: <AlertCircle className="h-4 w-4" />,
                    action: () => showModal(<SimpleModal onClose={() => closeModal()} />, {
                        size: 'sm',
                        persistent: true,
                        showCloseButton: true
                    }),
                    color: "orange"
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Modal System Showcase</h1>
                    <p className="text-gray-600 mb-4">
                        Comprehensive examples of modal usage patterns for your Next.js project
                    </p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={closeAllModals}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                            Close All Modals ({modals.length})
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-8">
                    {demoModals.map((category) => (
                        <div key={category.category} className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.items.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={item.action}
                                        className={`p-4 rounded-lg border-2 border-${item.color}-200 bg-${item.color}-50 hover:bg-${item.color}-100 transition-all duration-200 text-left group hover:scale-105`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 bg-${item.color}-200 rounded-lg group-hover:bg-${item.color}-300 transition-colors`}>
                                                {item.icon}
                                            </div>
                                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default ModalExample;