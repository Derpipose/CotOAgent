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
    <div className="class-item">
      <button
        className="class-header"
        onClick={onToggleExpand}
      >
        <span className="class-name">{ClassName}</span>
        <span className="class-classification">{Classification}</span>
        <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="class-description">
          {Description}
        </div>
      )}
    </div>
  );
}
