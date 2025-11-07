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
        // Determine API endpoint based on environment
        const apiUrl = import.meta.env.VITE_API_URL;
        
        // Check if VITE_API_URL is set and valid (for Docker dev)
        const isDevMode = apiUrl && apiUrl !== 'undefined' && apiUrl.trim() !== '' && apiUrl.startsWith('http');
        
        let endpoint: string;
        if (isDevMode) {
          // Docker dev mode - use absolute URL
          endpoint = `${apiUrl}/api/classes`;
          console.log(`[Classes] Dev mode - fetching from: ${endpoint}`);
        } else {
          // Kubernetes/production mode - use relative path through nginx proxy
          endpoint = '/api/classes';
          console.log(`[Classes] Production mode - fetching from: ${endpoint}`);
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);
        
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
        if (err instanceof Error && err.name === 'AbortError') {
          console.error('[Classes] Error: Request timeout (10s) - backend may be unreachable');
          setError('Request timeout - backend is not responding');
        } else {
          console.error('[Classes] Error:', errorMessage);
          setError(errorMessage);
        }
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
