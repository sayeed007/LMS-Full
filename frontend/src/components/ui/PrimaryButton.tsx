import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PrimaryActionButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'info' | 'success' | 'warning' | 'danger' | 'primary';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    icon?: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
}

const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
    children,
    onClick,
    disabled = false,
    loading = false,
    variant = 'info',
    size = 'md',
    className = '',
    icon,
    type = 'button',
    ...props
}) => {
    // Variant color mappings
    const variantStyles = {
        info: 'bg-info hover:bg-info/90',
        success: 'bg-green-600 hover:bg-green-700',
        warning: 'bg-yellow-600 hover:bg-yellow-700',
        danger: 'bg-red-600 hover:bg-red-700',
        primary: 'bg-blue-600 hover:bg-blue-700'
    };

    // Size mappings
    const sizeStyles = {
        sm: 'px-4 py-1.5 text-sm',
        md: 'px-6 py-2',
        lg: 'px-8 py-3 text-lg'
    };

    // Disabled state
    const isDisabled = disabled || loading;

    const handleClick = () => {
        if (!isDisabled && onClick) {
            onClick();
        }
    };

    return (
        <Button
            type={type}
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={isDisabled}
            className={`
        cursor-pointer text-white rounded-lg font-medium shadow-drop transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled
                    ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400'
                    : 'active:scale-95 hover:shadow-lg'
                }
        ${className}
      `}
            {...props}
        >
            <div className="flex items-center gap-2">
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : icon ? (
                    icon
                ) : null}
                {children}
            </div>
        </Button>
    );
};

export default PrimaryActionButton;