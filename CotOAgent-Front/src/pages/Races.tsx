import { useEffect, useState } from 'react';
import '../css/displaycard.css';

interface RaceData {
  Campaign: string;
  SubType: string;
  Name: string;
  Description: string;
  Starter: string;
  Special: string;
  Pinterest_Inspo_Board: string;
}

export default function Races() {
  const [races, setRaces] = useState<RaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRace, setExpandedRace] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        // Determine API endpoint based on environment
        const apiUrl = import.meta.env.VITE_API_URL;
        
        // Check if VITE_API_URL is set and valid (for Docker dev)
        const isDevMode = apiUrl && apiUrl !== 'undefined' && apiUrl.trim() !== '' && apiUrl.startsWith('http');
        
        let endpoint: string;
        if (isDevMode) {
          // Docker dev mode - use absolute URL
          endpoint = `${apiUrl}/api/races`;
          console.log(`[Races] Dev mode - fetching from: ${endpoint}`);
        } else {
          // Kubernetes/production mode - use relative path through nginx proxy
          endpoint = '/api/races';
          console.log(`[Races] Production mode - fetching from: ${endpoint}`);
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
          throw new Error(`Failed to fetch races: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setRaces(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        if (err instanceof Error && err.name === 'AbortError') {
          console.error('[Races] Error: Request timeout (10s) - backend may be unreachable');
          setError('Request timeout - backend is not responding');
        } else {
          console.error('[Races] Error:', errorMessage);
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  const toggleExpand = (raceName: string) => {
    setExpandedRace(expandedRace === raceName ? null : raceName);
  };

  if (loading) {
    return <div><h1>Races</h1><p>Loading...</p></div>;
  }

  if (error) {
    return <div><h1>Races</h1><p>Error: {error}</p></div>;
  }

  return (
    <div>
      <h1>Races</h1>
      <div className="races-list">
        {races.map((race) => (
          <div key={race.Name} className="race-item">
            <button
              className="race-header"
              onClick={() => toggleExpand(race.Name)}
            >
              <span className="race-name">{race.Name}</span>
              <span className="race-campaign">{race.Campaign}</span>
              <span className={`expand-arrow ${expandedRace === race.Name ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedRace === race.Name && (
              <div className="race-description">
                {race.Description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
