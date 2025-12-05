import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResourceIcon } from './ResourceIcon';

interface Resource {
  title: string;
  type: string;
  url: string;
  downloadable: boolean;
}

interface LessonResourcesListProps {
  resources: Resource[];
}

export function LessonResourcesList({ resources }: LessonResourcesListProps) {
  const handleDownload = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!resources || resources.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">No resources available for this lesson.</p>
    );
  }

  return (
    <div className="space-y-3">
      {resources.map((resource, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <ResourceIcon type={resource.type} />
            <div>
              <p className="font-medium">{resource.title}</p>
              <p className="text-sm text-gray-500">{resource.type.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(resource.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
            {resource.downloadable && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(resource.url, resource.title)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
