// import React from 'react';
// import Select from 'react-select';

// type SelectOption = {
//     value: string;
//     label: string;
// };

// type BaseSelectProps = {
//     options?: SelectOption[];
//     placeholder?: string;
//     isSearchable?: boolean;
//     isDisabled?: boolean;
//     isLoading?: boolean;
//     isClearable?: boolean;
//     className?: string;
//     width?: string;
//     size?: "small" | "medium" | "large";
//     variant?: "default" | "outline" | "filled";
//     error?: boolean;
// };

// type SingleSelectProps = BaseSelectProps & {
//     isMulti?: false;
//     value?: string | null;
//     onChange?: (value: string | null) => void;
// };

// type MultiSelectProps = BaseSelectProps & {
//     isMulti: true;
//     value?: string[];
//     onChange?: (value: string[]) => void;
// };

// type CustomSelectProps = SingleSelectProps | MultiSelectProps;

// export const CustomSelect = ({
//     options = [],
//     value,
//     onChange,
//     placeholder = "Select an option",
//     isSearchable = false,
//     isDisabled = false,
//     isLoading = false,
//     isClearable = false,
//     isMulti = false,
//     className = "",
//     width = "320px",
//     size = "medium", // small, medium, large
//     variant = "default", // default, outline, filled
//     error = false,
//     ...props
// }: CustomSelectProps) => {
//     // Size configurations
//     const sizeConfig = {
//         small: {
//             minHeight: '32px',
//             fontSize: '12px',
//             padding: '1px 4px'
//         },
//         medium: {
//             minHeight: '40px',
//             fontSize: '14px',
//             padding: '2px 4px'
//         },
//         large: {
//             minHeight: '48px',
//             fontSize: '16px',
//             padding: '4px 8px'
//         }
//     };

//     // Variant configurations
//     const variantConfig = {
//         default: {
//             backgroundColor: 'white',
//             border: error ? '1px solid #ef4444' : '1px solid #e5e7eb',
//             focusBorderColor: error ? '#ef4444' : '#3b82f6',
//             focusBoxShadow: error ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : '0 0 0 2px rgba(59, 130, 246, 0.2)'
//         },
//         outline: {
//             backgroundColor: 'transparent',
//             border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
//             focusBorderColor: error ? '#ef4444' : '#3b82f6',
//             focusBoxShadow: 'none'
//         },
//         filled: {
//             backgroundColor: '#f9fafb',
//             border: error ? '1px solid #ef4444' : '1px solid transparent',
//             focusBorderColor: error ? '#ef4444' : '#3b82f6',
//             focusBoxShadow: error ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : '0 0 0 2px rgba(59, 130, 246, 0.2)'
//         }
//     };

//     const currentSize = sizeConfig[size];
//     const currentVariant = variantConfig[variant];

//     const customStyles = {
//         control: (provided, state) => ({
//             ...provided,
//             width: width,
//             backgroundColor: currentVariant.backgroundColor,
//             border: currentVariant.border,
//             borderRadius: '8px',
//             padding: currentSize.padding,
//             fontSize: currentSize.fontSize,
//             minHeight: currentSize.minHeight,
//             boxShadow: state.isFocused ? currentVariant.focusBoxShadow : 'none',
//             borderColor: state.isFocused ? currentVariant.focusBorderColor : currentVariant.border.split(' ')[2],
//             cursor: isDisabled ? 'not-allowed' : 'pointer',
//             opacity: isDisabled ? 0.6 : 1,
//             transition: 'all 0.2s ease',
//             '&:hover': {
//                 borderColor: state.isFocused ? currentVariant.focusBorderColor : '#d1d5db'
//             }
//         }),

//         menu: (provided) => ({
//             ...provided,
//             zIndex: 9999,
//             borderRadius: '8px',
//             border: '1px solid #e5e7eb',
//             boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
//             overflow: 'hidden'
//         }),

//         menuList: (provided) => ({
//             ...provided,
//             padding: '4px',
//             maxHeight: '200px'
//         }),

//         option: (provided, state) => ({
//             ...provided,
//             backgroundColor: state.isSelected
//                 ? '#3b82f6'
//                 : state.isFocused
//                     ? '#f3f4f6'
//                     : 'transparent',
//             color: state.isSelected ? 'white' : '#374151',
//             padding: '8px 12px',
//             fontSize: currentSize.fontSize,
//             borderRadius: '6px',
//             margin: '2px 0',
//             cursor: 'pointer',
//             transition: 'all 0.15s ease',
//             '&:hover': {
//                 backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6'
//             },
//             '&:active': {
//                 backgroundColor: state.isSelected ? '#2563eb' : '#e5e7eb'
//             }
//         }),

//         singleValue: (provided) => ({
//             ...provided,
//             color: '#374151',
//             fontSize: currentSize.fontSize,
//             fontWeight: '400'
//         }),

//         multiValue: (provided) => ({
//             ...provided,
//             backgroundColor: '#f3f4f6',
//             borderRadius: '6px',
//             border: '1px solid #e5e7eb'
//         }),

//         multiValueLabel: (provided) => ({
//             ...provided,
//             color: '#374151',
//             fontSize: currentSize.fontSize,
//             padding: '2px 6px'
//         }),

//         multiValueRemove: (provided) => ({
//             ...provided,
//             color: '#6b7280',
//             borderRadius: '0 4px 4px 0',
//             '&:hover': {
//                 backgroundColor: '#ef4444',
//                 color: 'white'
//             }
//         }),

//         placeholder: (provided) => ({
//             ...provided,
//             color: '#9ca3af',
//             fontSize: currentSize.fontSize,
//             fontWeight: '400'
//         }),

//         input: (provided) => ({
//             ...provided,
//             color: '#374151',
//             fontSize: currentSize.fontSize
//         }),

//         indicatorSeparator: () => ({
//             display: 'none'
//         }),

//         dropdownIndicator: (provided, state) => ({
//             ...provided,
//             color: '#6b7280',
//             padding: '8px',
//             transition: 'all 0.2s ease',
//             transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
//             '&:hover': {
//                 color: '#374151'
//             }
//         }),

//         clearIndicator: (provided) => ({
//             ...provided,
//             color: '#6b7280',
//             padding: '8px',
//             '&:hover': {
//                 color: '#ef4444'
//             }
//         }),

//         loadingIndicator: (provided) => ({
//             ...provided,
//             color: '#3b82f6'
//         }),

//         noOptionsMessage: (provided) => ({
//             ...provided,
//             color: '#6b7280',
//             fontSize: currentSize.fontSize,
//             padding: '12px'
//         })
//     };

//     // Handle value conversion
//     const getSelectValue = () => {
//         if (!value) return null;

//         if (isMulti) {
//             return Array.isArray(value)
//                 ? options.filter(option => value.includes(option.value))
//                 : [];
//         }

//         return options.find(option => option.value === value) || null;
//     };

//     // Handle change conversion
//     const handleChange = (selectedOption) => {
//         if (isMulti) {
//             const values = selectedOption ? selectedOption.map(option => option.value) : [];
//             onChange?.(values);
//         } else {
//             onChange?.(selectedOption ? selectedOption.value : null);
//         }
//     };

//     return (
//         <div className={className}>
//             <Select
//                 options={options}
//                 value={getSelectValue()}
//                 onChange={handleChange}
//                 placeholder={placeholder}
//                 isSearchable={isSearchable}
//                 isDisabled={isDisabled}
//                 isLoading={isLoading}
//                 isClearable={isClearable}
//                 isMulti={isMulti}
//                 styles={customStyles}
//                 menuPosition="fixed"
//                 menuPlacement="auto"
//                 noOptionsMessage={() => "No options found"}
//                 loadingMessage={() => "Loading..."}
//                 {...props}
//             />
//         </div>
//     );
// };

// // // Usage Examples:
// // const ExampleUsage = () => {
// //     const [selectedCourse, setSelectedCourse] = React.useState('foundation-ui-ux');
// //     const [multiSelected, setMultiSelected] = React.useState([]);

// //     const courseOptions = [
// //         { value: 'foundation-ui-ux', label: 'Foundation of UI/UX' },
// //         { value: 'advanced-react', label: 'Advanced React' },
// //         { value: 'javascript-fundamentals', label: 'JavaScript Fundamentals' },
// //         { value: 'web-design-principles', label: 'Web Design Principles' },
// //         { value: 'nodejs-backend', label: 'Node.js Backend Development' }
// //     ];

// //     return (
// //         <div className="p-8 space-y-6">
// //             <div>
// //                 <h3 className="text-lg font-semibold mb-2">Default Select</h3>
// //                 <CustomSelect
// //                     options={courseOptions}
// //                     value={selectedCourse}
// //                     onChange={setSelectedCourse}
// //                     placeholder="Select a course"
// //                 />
// //             </div>

// //             <div>
// //                 <h3 className="text-lg font-semibold mb-2">Searchable Select</h3>
// //                 <CustomSelect
// //                     options={courseOptions}
// //                     value={selectedCourse}
// //                     onChange={setSelectedCourse}
// //                     placeholder="Search courses..."
// //                     isSearchable={true}
// //                     isClearable={true}
// //                 />
// //             </div>

// //             <div>
// //                 <h3 className="text-lg font-semibold mb-2">Multi Select</h3>
// //                 <CustomSelect
// //                     options={courseOptions}
// //                     value={multiSelected}
// //                     onChange={setMultiSelected}
// //                     placeholder="Select multiple courses"
// //                     isMulti={true}
// //                     isSearchable={true}
// //                 />
// //             </div>

// //             <div>
// //                 <h3 className="text-lg font-semibold mb-2">Different Sizes</h3>
// //                 <div className="space-y-3">
// //                     <CustomSelect
// //                         options={courseOptions}
// //                         placeholder="Small size"
// //                         size="small"
// //                         width="250px"
// //                     />
// //                     <CustomSelect
// //                         options={courseOptions}
// //                         placeholder="Medium size (default)"
// //                         size="medium"
// //                     />
// //                     <CustomSelect
// //                         options={courseOptions}
// //                         placeholder="Large size"
// //                         size="large"
// //                         width="400px"
// //                     />
// //                 </div>
// //             </div>

// //             <div>
// //                 <h3 className="text-lg font-semibold mb-2">Different Variants</h3>
// //                 <div className="space-y-3">
// //                     <CustomSelect
// //                         options={courseOptions}
// //                         placeholder="Default variant"
// //                         variant="default"
// //                     />
// //                     <CustomSelect
// //                         options={courseOptions}
// //                         placeholder="Outline variant"
// //                         variant="outline"
// //                     />
// //                     <CustomSelect
// //                         options={courseOptions}
// //                         placeholder="Filled variant"
// //                         variant="filled"
// //                     />
// //                 </div>
// //             </div>

// //             <div>
// //                 <h3 className="text-lg font-semibold mb-2">Error State</h3>
// //                 <CustomSelect
// //                     options={courseOptions}
// //                     placeholder="Select with error"
// //                     error={true}
// //                 />
// //             </div>
// //         </div>
// //     );
// // };

// // export default CustomSelect;