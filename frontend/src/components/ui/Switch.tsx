// components/ui/switch.tsx
import React from 'react'

interface SwitchProps {
    id?: string;
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
    className?: string
}

export function Switch({ id, checked, onChange, disabled = false, className = '' }: SwitchProps) {
    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 ease-in-out focus:outline-none
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
        >
            <span
                className={`
          inline-block h-4 w-4 transform rounded-full bg-white
          transition-transform duration-200 ease-in-out shadow-sm
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
            />
        </button>
    )
}