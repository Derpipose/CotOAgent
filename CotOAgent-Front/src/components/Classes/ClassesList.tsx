import ClassItem from './ClassItem';

interface ClassData {
  Classification: string;
  ClassName: string;
  Description: string;
  Distance?: number;
}

interface ClassesListProps {
  classes: ClassData[];
  expandedClass: string | null;
  onToggleExpand: (className: string) => void;
}

export default function ClassesList({ classes, expandedClass, onToggleExpand }: ClassesListProps) {
  return (
    <div className="classes-list-container">
      {classes.map((cls) => (
        <ClassItem
          key={`${cls.ClassName}-${cls.Classification}`}
          classData={cls}
          isExpanded={expandedClass === cls.ClassName}
          onToggleExpand={() => onToggleExpand(cls.ClassName)}
        />
      ))}
    </div>
  );
}
