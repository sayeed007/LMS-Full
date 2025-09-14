import { CheckCircle, Play, AlertCircle, Clock } from 'lucide-react';

interface StatusIconProps {
    status: string;
}

export const StatusIcon = ({ status }: StatusIconProps) => {
    switch (status) {
        case 'Complete':
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'In Progress':
            return <Play className="h-4 w-4 text-orange-600" />;
        case 'Yet to Start':
            return <AlertCircle className="h-4 w-4 text-red-600" />;
        default:
            return <Clock className="h-4 w-4 text-gray-600" />;
    }
};