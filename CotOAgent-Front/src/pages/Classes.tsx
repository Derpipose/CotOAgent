import { useState } from 'react';
import '../css/displaycard.css';
import { useQueryApi, useMutationApi } from '../hooks/useQueryApi';
import { SearchSection, ClassesList } from '../components/Classes';

interface ClassData {
  Classification: string;
  ClassName: string;
  Description: string;
  Distance?: number;
}

export default function Classes() {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch all classes on mount
  const { data: allClasses = [], isLoading } = useQueryApi<ClassData[]>(
    '/classes',
    {
      showError: true,
      errorMessage: 'Failed to load classes',
    }
  );

  // Search mutation
  const searchMutation = useMutationApi<ClassData[], { query: string }>({
    showError: true,
    errorMessage: 'Failed to search classes',
  });

  // Determine which classes to display
  const displayedClasses = hasSearched ? searchMutation.data || [] : allClasses;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setSearchError(null);
    searchMutation.mutate({ query: searchQuery.trim() }, {
      onSuccess: () => {
        setHasSearched(true);
        setExpandedClass(null);
      },
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setSearchError(null);
    setExpandedClass(null);
  };

  const toggleExpand = (className: string) => {
    setExpandedClass(expandedClass === className ? null : className);
  };

  if (isLoading) {
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
        isSearching={searchMutation.isPending}
        hasSearched={hasSearched}
        searchError={searchError}
        resultsCount={displayedClasses.length}
      />
      <ClassesList
        classes={displayedClasses}
        expandedClass={expandedClass}
        onToggleExpand={toggleExpand}
      />
    </div>
  );
}
