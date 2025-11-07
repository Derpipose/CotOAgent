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
        // Determine API URL based on environment
        let apiUrl = import.meta.env.VITE_API_URL;
        
        if (!apiUrl) {
          // If no VITE_API_URL is set, use relative path (works with nginx proxy in Kubernetes/production)
          apiUrl = '/api';
        }
        
        const endpoint = `${apiUrl}/api/classes`;
        console.log(`[Classes] Fetching from: ${endpoint}`);
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('text/html')) {
            throw new Error(`Backend returned HTML (${response.status}). Check if the backend URL is correct.`);
          }
          throw new Error(`Failed to fetch classes: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        console.error('[Classes] Error:', errorMessage);
        setError(errorMessage);
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
