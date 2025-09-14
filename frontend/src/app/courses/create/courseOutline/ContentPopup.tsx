"use client";

interface ContentPopupProps {
  showPopup: boolean;
  popupPosition: { x: number; y: number };
  popupTrigger: string;
  onTextClick: () => void;
  onBlocksClick: () => void;
  onClosePopup: () => void;
}

export default function ContentPopup({
  showPopup,
  popupPosition,
  popupTrigger,
  onTextClick,
  onBlocksClick,
  onClosePopup,
}: ContentPopupProps) {

  console.log(popupTrigger);
  if (!showPopup) return null;

  const option = [
    {
      label: "Text",
      icon: <span className="text-blue-600">Aa</span>,
      onClick: onTextClick,
      colorClass: "text-blue-600",
    },
    {
      label: "Blocks",
      icon: <span className="text-green-600">⊞</span>,
      onClick: onBlocksClick,
      colorClass: "text-green-600",
    },
    {
      label: "Video",
      icon: <span className="text-purple-600">▷</span>,
      onClick: onClosePopup,
      colorClass: "text-purple-600",
    },
    {
      label: "Document",
      icon: <span className="text-purple-600">📄</span>,
      onClick: onClosePopup,
      colorClass: "text-purple-600",
    },
    {
      label: "Quiz",
      icon: <span className="text-blue-600">❓</span>,
      onClick: onClosePopup,
      colorClass: "text-blue-600",
    },
    {
      label: "Assignment",
      icon: <span className="text-orange-600">📋</span>,
      onClick: onClosePopup,
      colorClass: "text-orange-600",
    },
  ];

  return (
    <div
      className="fixed z-50"
      style={{
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
      }}
    >
      <div className="bg-white px-4 rounded-lg shadow-lg border border-gray-200 max-w-[200px]">
        <div className="flex justify-between items-center mb-3">
          {/* Optional close button or title */}
        </div>
        <div className="space-y-2">
          {option.map((button, index) => (
            <button
              key={index}
              className="w-full text-sm h-8 px-3 border-b"
              onClick={button.onClick}
            >
              <span className={`mr-2 ${button.colorClass}`}>{button.icon}</span>{" "}
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
