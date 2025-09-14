import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
    status: string;
    percentage?: number;
}

export const StatusBadge = ({ status, percentage }: StatusBadgeProps) => {

    console.info(percentage);

    switch (status) {
        case 'Complete':
            return <Badge className="bg-success-bg text-success hover:bg-success hover:text-white">Complete</Badge>;
        case 'In Progress':
            return <Badge className="bg-warning-bg text-warning hover:bg-warning hover:text-white">In Progress</Badge>;
        case 'Yet to Start':
            return <Badge className="bg-error-bg text-error hover:bg-error hover:text-white">Yet to Start</Badge>;
        default:
            return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
};