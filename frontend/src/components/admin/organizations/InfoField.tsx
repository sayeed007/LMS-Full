import Link from 'next/link';

interface InfoFieldProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  link?: boolean;
}

export function InfoField({ icon, label, value, link }: InfoFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      {link ? (
        <Link
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {value}
        </Link>
      ) : (
        <div className="text-gray-900">{value}</div>
      )}
    </div>
  );
}
