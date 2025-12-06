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
    <div className="search-bar-container">
      <div className="search-bar-box">
        <div className="search-bar-inputs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="search-bar-input"
            disabled={isSearching}
          />
          <div className="search-bar-button-group">
            <button
              onClick={onSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            {hasSearched && (
              <button
                onClick={onClearSearch}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {searchError && (
          <div className="search-bar-error">
            {searchError}
          </div>
        )}

        {hasSearched && (
          <div className="search-bar-results">
            Found {resultsCount} result{resultsCount !== 1 ? 's' : ''}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
