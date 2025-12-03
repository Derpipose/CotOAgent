interface ClassData {
  Classification: string;
  ClassName: string;
  Description: string;
  Distance?: number;
}

interface ClassItemProps {
  classData: ClassData;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function ClassItem({ classData, isExpanded, onToggleExpand }: ClassItemProps) {
  const { ClassName, Classification, Description } = classData;

  return (
    <div className="border border-b-0 last:border-b border-gray-300">
      <button
        className="flex items-center justify-between w-full px-5 py-4 bg-gray-50 border-none cursor-pointer transition-colors duration-200 text-base text-left hover:bg-gray-100 active:bg-gray-200"
        onClick={onToggleExpand}
      >
        <span className="flex-1 font-semibold text-gray-800 min-w-36">{ClassName}</span>
        <span className="flex-0 flex-shrink-0 text-gray-600 text-sm text-center px-5 w-30">{Classification}</span>
        <span className={`flex-0 w-7 h-7 flex items-center justify-center text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="px-5 py-5 bg-white border-t border-gray-200 text-gray-700 leading-relaxed text-sm animate-slideDown">
          {Description}
        </div>
      )}
    </div>
  );
}
