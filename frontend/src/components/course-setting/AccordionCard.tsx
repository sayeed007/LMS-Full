import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";

interface AccordionCardProps {
  expanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AccordionCard({
  expanded,
  onToggle,
  icon,
  title,
  subtitle,
  children,
}: AccordionCardProps) {
  return (
    <div className="bg-white/80 rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 text-left p-4"
      >
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-gray-100/80">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </div>
        <div className="text-gray-500">
          {expanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Body */}
      {expanded && <div className="px-2 pb-4">{children}</div>}
    </div>
  );
}
