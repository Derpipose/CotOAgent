import { useEffect, useState } from 'react';
import '../css/displaycard.css';

interface ClassData {
  Classification: string;
  ClassName: string;
  Description: string;
}

export default function Classes() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/classes`);
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const toggleExpand = (className: string) => {
    setExpandedClass(expandedClass === className ? null : className);
  };

  if (loading) {
    return <div><h1>Classes</h1><p>Loading...</p></div>;
  }

  if (error) {
    return <div><h1>Classes</h1><p>Error: {error}</p></div>;
  }

  return (
    <div>
      <h1>Classes</h1>
      <div className="classes-list">
        {classes.map((cls) => (
          <div key={cls.ClassName} className="class-item">
            <button
              className="class-header"
              onClick={() => toggleExpand(cls.ClassName)}
            >
              <span className="class-name">{cls.ClassName}</span>
              <span className="class-classification">{cls.Classification}</span>
              <span className={`expand-arrow ${expandedClass === cls.ClassName ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedClass === cls.ClassName && (
              <div className="class-description">
                {cls.Description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
