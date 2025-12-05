import { FileText, Play, ExternalLink } from 'lucide-react';

interface ResourceIconProps {
  type: string;
}

export function ResourceIcon({ type }: ResourceIconProps) {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'video':
      return <Play className="h-5 w-5 text-blue-500" />;
    case 'link':
      return <ExternalLink className="h-5 w-5 text-green-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}
