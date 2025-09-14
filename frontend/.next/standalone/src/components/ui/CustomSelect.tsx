import React from 'react';
import Select, {
    StylesConfig,
    GroupBase,
    SingleValue,
    MultiValue,
    ActionMeta,
    MenuPlacement,
    MenuPosition
} from 'react-select';

type SelectOption = {
    value: string;
    label: string;
};

type SelectSize = "small" | "medium" | "large";
type SelectVariant = "default" | "outline" | "filled";

type BaseSelectProps = {
    options?: SelectOption[];
    placeholder?: string;
    isSearchable?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    isClearable?: boolean;
    className?: string;
    width?: string;
    size?: SelectSize;
    variant?: SelectVariant;
    error?: boolean;
    menuPlacement?: MenuPlacement;
    menuPosition?: MenuPosition;
};

type SingleSelectProps = BaseSelectProps & {
    isMulti?: false;
    value?: string | null;
    onChange?: (value: string | null, actionMeta: ActionMeta<SelectOption>) => void;
};

type MultiSelectProps = BaseSelectProps & {
    isMulti: true;
    value?: string[];
    onChange?: (value: string[], actionMeta: ActionMeta<SelectOption>) => void;
};

type CustomSelectProps = SingleSelectProps | MultiSelectProps;

// Size configuration type
type SizeConfig = {
    minHeight: string;
    fontSize: string;
    padding: string;
};

// Variant configuration type
type VariantConfig = {
    backgroundColor: string;
    border: string;
    focusBorderColor: string;
    focusBoxShadow: string;
};

export const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    isSearchable = false,
    isDisabled = false,
    isLoading = false,
    isClearable = false,
    isMulti = false,
    className = "",
    width = "320px",
    size = "medium",
    variant = "default",
    error = false,
    menuPlacement = "auto",
    menuPosition = "fixed",
    ...props
}: CustomSelectProps) => {
    // Size configurations with proper typing
    const sizeConfig: Record<SelectSize, SizeConfig> = {
        small: {
            minHeight: '32px',
            fontSize: '12px',
            padding: '1px 4px'
        },
        medium: {
            minHeight: '40px',
            fontSize: '14px',
            padding: '2px 4px'
        },
        large: {
            minHeight: '48px',
            fontSize: '16px',
            padding: '4px 8px'
        }
    };

    // Variant configurations with proper typing
    const variantConfig: Record<SelectVariant, VariantConfig> = {
        default: {
            backgroundColor: 'white',
            border: error ? '1px solid #ef4444' : '1px solid #e5e7eb',
            focusBorderColor: error ? '#ef4444' : '#3b82f6',
            focusBoxShadow: error ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : '0 0 0 2px rgba(59, 130, 246, 0.2)'
        },
        outline: {
            backgroundColor: 'transparent',
            border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
            focusBorderColor: error ? '#ef4444' : '#3b82f6',
            focusBoxShadow: 'none'
        },
        filled: {
            backgroundColor: '#f9fafb',
            border: error ? '1px solid #ef4444' : '1px solid transparent',
            focusBorderColor: error ? '#ef4444' : '#3b82f6',
            focusBoxShadow: error ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : '0 0 0 2px rgba(59, 130, 246, 0.2)'
        }
    };

    const currentSize = sizeConfig[size];
    const currentVariant = variantConfig[variant];

    // Properly typed custom styles
    const customStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
        control: (provided, state) => ({
            ...provided,
            width: width,
            backgroundColor: currentVariant.backgroundColor,
            border: currentVariant.border,
            borderRadius: '8px',
            padding: currentSize.padding,
            fontSize: currentSize.fontSize,
            minHeight: currentSize.minHeight,
            boxShadow: state.isFocused ? currentVariant.focusBoxShadow : 'none',
            borderColor: state.isFocused ? currentVariant.focusBorderColor : currentVariant.border.split(' ')[2],
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.6 : 1,
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: state.isFocused ? currentVariant.focusBorderColor : '#d1d5db'
            }
        }),

        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
        }),

        menuList: (provided) => ({
            ...provided,
            padding: '4px',
            maxHeight: '200px'
        }),

        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#3b82f6'
                : state.isFocused
                    ? '#f3f4f6'
                    : 'transparent',
            color: state.isSelected ? 'white' : '#374151',
            padding: '8px 12px',
            fontSize: currentSize.fontSize,
            borderRadius: '6px',
            margin: '2px 0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': {
                backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6'
            },
            '&:active': {
                backgroundColor: state.isSelected ? '#2563eb' : '#e5e7eb'
            }
        }),

        singleValue: (provided) => ({
            ...provided,
            color: '#374151',
            fontSize: currentSize.fontSize,
            fontWeight: '400'
        }),

        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
        }),

        multiValueLabel: (provided) => ({
            ...provided,
            color: '#374151',
            fontSize: currentSize.fontSize,
            padding: '2px 6px'
        }),

        multiValueRemove: (provided) => ({
            ...provided,
            color: '#6b7280',
            borderRadius: '0 4px 4px 0',
            '&:hover': {
                backgroundColor: '#ef4444',
                color: 'white'
            }
        }),

        placeholder: (provided) => ({
            ...provided,
            color: '#9ca3af',
            fontSize: currentSize.fontSize,
            fontWeight: '400'
        }),

        input: (provided) => ({
            ...provided,
            color: '#374151',
            fontSize: currentSize.fontSize
        }),

        indicatorSeparator: () => ({
            display: 'none'
        }),

        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: '#6b7280',
            padding: '8px',
            transition: 'all 0.2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            '&:hover': {
                color: '#374151'
            }
        }),

        clearIndicator: (provided) => ({
            ...provided,
            color: '#6b7280',
            padding: '8px',
            '&:hover': {
                color: '#ef4444'
            }
        }),

        loadingIndicator: (provided) => ({
            ...provided,
            color: '#3b82f6'
        }),

        noOptionsMessage: (provided) => ({
            ...provided,
            color: '#6b7280',
            fontSize: currentSize.fontSize,
            padding: '12px'
        })
    };

    // Handle value conversion with proper typing
    const getSelectValue = (): SelectOption | SelectOption[] | null => {
        if (!value) return null;

        if (isMulti) {
            return Array.isArray(value)
                ? options.filter(option => value.includes(option.value))
                : [];
        }

        return options.find(option => option.value === value) || null;
    };

    // Handle change conversion with proper typing
    const handleChange = (
        selectedOption: SingleValue<SelectOption> | MultiValue<SelectOption>,
        actionMeta: ActionMeta<SelectOption>
    ): void => {
        if (isMulti) {
            const values = selectedOption && Array.isArray(selectedOption)
                ? selectedOption.map(option => option.value)
                : [];
            (onChange as MultiSelectProps['onChange'])?.(values, actionMeta);
        } else {
            const singleOption = selectedOption as SingleValue<SelectOption>;
            (onChange as SingleSelectProps['onChange'])?.(
                singleOption ? singleOption.value : null,
                actionMeta
            );
        }
    };

    return (
        <div className={className}>
            <Select<SelectOption, boolean, GroupBase<SelectOption>>
                options={options}
                value={getSelectValue()}
                onChange={handleChange}
                placeholder={placeholder}
                isSearchable={isSearchable}
                isDisabled={isDisabled}
                isLoading={isLoading}
                isClearable={isClearable}
                isMulti={isMulti}
                styles={customStyles}
                menuPosition={menuPosition}
                menuPlacement={menuPlacement}
                noOptionsMessage={() => "No options found"}
                loadingMessage={() => "Loading..."}
                {...props}
            />
        </div>
    );
};