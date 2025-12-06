interface SearchSectionProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  isSearching: boolean;
  hasSearched: boolean;
  searchError: string | null;
  resultsCount: number;
}

export default function SearchSection({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onClearSearch,
  isSearching,
  hasSearched,
  searchError,
  resultsCount,
}: SearchSectionProps) {
  return (
    <div className="search-section-container">
      <div className="search-section-input-group">
        <input
          type="text"
          placeholder="Enter class description or characteristics..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="search-section-input"
        />
        <button
          onClick={onSearch}
          disabled={isSearching}
          className="search-section-button"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        {hasSearched && (
          <button
            onClick={onClearSearch}
            className="search-section-clear-button"
          >
            Clear Search
          </button>
        )}
      </div>
      {searchError && (
        <p className="search-section-error">
          {searchError}
        </p>
      )}
      {hasSearched && (
        <p className="search-section-results">
          Showing {resultsCount} results
        </p>
      )}
    </div>
  );
}
