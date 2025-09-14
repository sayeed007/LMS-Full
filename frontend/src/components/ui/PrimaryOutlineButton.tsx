import React, { MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PrimaryOutlineButtonProps {
    children: React.ReactNode;
    onClick?: ((e?: React.MouseEvent) => void) | (() => void);
    disabled?: boolean;
    loading?: boolean;
    variant?: 'info' | 'success' | 'warning' | 'danger' | 'primary';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    icon?: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
}

const PrimaryOutlineButton: React.FC<PrimaryOutlineButtonProps> = ({
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
    // Variant color mappings for outline style
    const variantStyles = {
        info: 'border-info text-info hover:bg-info hover:text-white',
        success: 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white',
        warning: 'border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white',
        danger: 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white',
        primary: 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
    };

    // Size mappings
    const sizeStyles = {
        sm: 'px-4 py-1.5 text-sm',
        md: 'px-6 py-2',
        lg: 'px-8 py-3 text-lg'
    };

    // Disabled state
    const isDisabled = disabled || loading;

    const handleClick = (e: React.MouseEvent) => {
        if (!isDisabled && onClick) {
            onClick(e);
        }
    };

    return (
        <Button
            type={type}
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isDisabled}
            className={`
        cursor-pointer bg-transparent border-2 rounded-lg font-medium shadow-sm transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled
                    ? 'opacity-50 cursor-not-allowed border-gray-400 text-gray-400 hover:bg-transparent hover:text-gray-400'
                    : 'active:scale-95 hover:shadow-md'
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

export default PrimaryOutlineButton;