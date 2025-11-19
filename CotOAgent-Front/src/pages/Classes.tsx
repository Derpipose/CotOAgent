import { useEffect, useState } from 'react';
import '../css/displaycard.css';
import { SearchSection, ClassesList } from '../components/Classes';

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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/classes', { signal: controller.signal });
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
      const endpoint = '/api/classes/search';

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
      <SearchSection
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        isSearching={isSearching}
        hasSearched={hasSearched}
        searchError={searchError}
        resultsCount={classes.length}
      />
      <ClassesList
        classes={classes}
        expandedClass={expandedClass}
        onToggleExpand={toggleExpand}
      />
    </div>
  );
}
