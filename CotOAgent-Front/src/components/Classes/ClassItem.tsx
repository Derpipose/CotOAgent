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
    <div className="class-item-container">
      <button
        className="class-item-button"
        onClick={onToggleExpand}
      >
        <span className="class-item-name">{ClassName}</span>
        <span className="class-item-classification">{Classification}</span>
        <span className={`class-item-chevron ${isExpanded ? 'class-item-chevron-expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="class-item-description">
          {Description}
        </div>
      )}
    </div>
  );
}
