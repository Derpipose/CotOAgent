import type { ReactNode } from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  isSearching?: boolean;
  hasSearched?: boolean;
  searchError?: string | null;
  resultsCount?: number;
  placeholder?: string;
  children?: ReactNode;
}

export function SearchBar({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onClearSearch,
  isSearching = false,
  hasSearched = false,
  searchError = null,
  resultsCount = 0,
  placeholder = 'Search...',
  children,
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            disabled={isSearching}
          />
          <button
            onClick={onSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="btn-primary-gradient disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {hasSearched && (
            <button
              onClick={onClearSearch}
              className="btn-secondary-gradient"
            >
              Clear
            </button>
          )}
        </div>

        {searchError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {searchError}
          </div>
        )}

        {hasSearched && (
          <div className="text-sm text-gray-600">
            Found {resultsCount} result{resultsCount !== 1 ? 's' : ''}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
