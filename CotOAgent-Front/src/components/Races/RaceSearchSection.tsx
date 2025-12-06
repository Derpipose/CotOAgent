interface RaceSearchSectionProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  isSearching: boolean;
  hasSearched: boolean;
  searchError: string | null;
  resultsCount: number;
}

export default function RaceSearchSection({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onClearSearch,
  isSearching,
  hasSearched,
  searchError,
  resultsCount,
}: RaceSearchSectionProps) {
  return (
    <div className="race-search-section-container">
      <div className="race-search-section-input-group">
        <input
          type="text"
          placeholder="Enter race description or characteristics..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="race-search-section-input"
        />
        <button
          onClick={onSearch}
          disabled={isSearching}
          className="race-search-section-button"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        {hasSearched && (
          <button
            onClick={onClearSearch}
            className="race-search-section-clear-button"
          >
            Clear Search
          </button>
        )}
      </div>
      {searchError && (
        <p className="race-search-section-error">
          {searchError}
        </p>
      )}
      {hasSearched && (
        <p className="race-search-section-results">
          Showing {resultsCount} results
        </p>
      )}
    </div>
  );
}
