import { useEffect, useState } from 'react';
import '../css/displaycard.css';

interface ClassData {
  Classification: string;
  ClassName: string;
  Description: string;
  Distance?: number;
}

export default function Classes() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
        setAllClasses(data);
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const isDevMode = apiUrl && apiUrl !== 'undefined' && apiUrl.trim() !== '' && apiUrl.startsWith('http');

      const endpoint = isDevMode ? `${apiUrl}/api/classes/search` : '/api/classes/search';

      console.log(`[Classes] Searching for: "${searchQuery}" via ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to search classes: ${response.status} ${response.statusText}`);
      }

      const results = await response.json();
      setClasses(results);
      setHasSearched(true);
      setExpandedClass(null);
      console.log(`[Classes] Search returned ${results.length} results`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during search';
      console.error('[Classes] Search error:', errorMessage);
      setSearchError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setClasses(allClasses);
    setHasSearched(false);
    setSearchError(null);
    setExpandedClass(null);
  };

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
      
      {/* Search Section */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter class description or characteristics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              opacity: isSearching ? 0.6 : 1,
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {hasSearched && (
            <button
              onClick={handleClearSearch}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear Search
            </button>
          )}
        </div>
        {searchError && (
          <p style={{ color: 'red', margin: '10px 0 0 0', fontSize: '14px' }}>
            {searchError}
          </p>
        )}
        {hasSearched && (
          <p style={{ color: '#666', margin: '10px 0 0 0', fontSize: '14px' }}>
            Showing {classes.length} results
          </p>
        )}
      </div>

      <div className="classes-list">
        {classes.map((cls) => (
          <div key={`${cls.ClassName}-${cls.Classification}`} className="class-item">
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
