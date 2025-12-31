import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableTableHeaderProps {
    label: string;
    sortKey: string;
    currentSortBy: string;
    currentSortOrder: 'asc' | 'desc';
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    className?: string;
}

export const SortableTableHeader = ({
    label,
    sortKey,
    currentSortBy,
    currentSortOrder,
    onSort,
    className = ''
}: SortableTableHeaderProps) => {
    const isActive = currentSortBy === sortKey;

    const handleClick = () => {
        if (isActive) {
            // Toggle sort order if already sorting by this column
            onSort(sortKey, currentSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Start with ascending order for new column
            onSort(sortKey, 'asc');
        }
    };

    const getSortIcon = () => {
        if (!isActive) {
            return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
        }
        return currentSortOrder === 'asc'
            ? <ArrowUp className="h-4 w-4 text-blue-600" />
            : <ArrowDown className="h-4 w-4 text-blue-600" />;
    };

    return (
        <th
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
            onClick={handleClick}
        >
            <div className="flex items-center gap-2 select-none">
                <span className={isActive ? 'text-blue-600 font-semibold' : ''}>
                    {label}
                </span>
                {getSortIcon()}
            </div>
        </th>
    );
};
