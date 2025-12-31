interface ProgressBarProps {
  value: number; // Percentage value (0-100)
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  colorScheme?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const heightClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const colorSchemes = {
  default: {
    bg: 'bg-gray-200',
    fill: 'bg-blue-600',
  },
  success: {
    bg: 'bg-gray-200',
    fill: 'bg-green-600',
  },
  warning: {
    bg: 'bg-gray-200',
    fill: 'bg-orange-500',
  },
  danger: {
    bg: 'bg-gray-200',
    fill: 'bg-red-600',
  },
};

export function ProgressBar({
  value,
  showLabel = false,
  height = 'md',
  colorScheme = 'default',
  className = '',
}: ProgressBarProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // Determine color based on value if using default scheme
  let activeColorScheme = colorScheme;
  if (colorScheme === 'default') {
    if (normalizedValue >= 80) {
      activeColorScheme = 'success';
    } else if (normalizedValue >= 40) {
      activeColorScheme = 'warning';
    } else if (normalizedValue > 0) {
      activeColorScheme = 'danger';
    }
  }

  const colors = colorSchemes[activeColorScheme];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 ${colors.bg} rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${colors.fill} ${heightClasses[height]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 min-w-[45px] text-right">
          {normalizedValue}%
        </span>
      )}
    </div>
  );
}
