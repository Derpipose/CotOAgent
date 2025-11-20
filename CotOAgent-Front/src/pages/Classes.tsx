import { useEffect, useState } from 'react';
import '../css/displaycard.css';
import { useApiCall } from '../hooks/useApiCall';
import { SearchSection, ClassesList } from '../components/Classes';

interface ClassData {
  Classification: string;
  ClassName: string;
  Description: string;
  Distance?: number;
}

export default function Classes() {
  const { call } = useApiCall();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      const data = await call<ClassData[]>(
        '/classes',
        undefined,
        {
          showError: true,
          errorMessage: 'Failed to load classes',
        }
      );

      if (data) {
        setClasses(data);
        setAllClasses(data);
      }
      setLoading(false);
    };

    fetchClasses();
  }, [call]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const results = await call<ClassData[]>(
      '/classes/search',
      {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery.trim() }),
      },
      {
        showError: true,
        errorMessage: 'Failed to search classes',
      }
    );

    if (results) {
      setClasses(results);
      setHasSearched(true);
      setExpandedClass(null);
    }
    setIsSearching(false);
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
