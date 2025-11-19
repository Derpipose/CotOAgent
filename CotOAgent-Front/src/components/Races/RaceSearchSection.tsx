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
    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Enter race description or characteristics..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        />
        <button
          onClick={onSearch}
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
            onClick={onClearSearch}
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
          Showing {resultsCount} results
        </p>
      )}
    </div>
  );
}
