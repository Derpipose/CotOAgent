import { useEffect, useState } from 'react'
import keycloak from '../keycloak'
import '../css/characters.css'

interface Character {
  id: number
  name: string
  class_name: string | null
  race_name: string | null
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  created_at: string
  last_modified: string
  feedback: string | null
  approval_status: string | null
  revised: boolean
}

function Characters() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get user email from Keycloak
        const userEmail = keycloak.tokenParsed?.email
        if (!userEmail) {
          setError('Unable to retrieve user email')
          setLoading(false)
          return
        }

        // Determine API URL based on environment
        const backendUrl = window.location.protocol === 'https:'
          ? `https://${window.location.hostname}/api`
          : 'http://localhost:3000/api'

        const response = await fetch(`${backendUrl}/characters`, {
          method: 'GET',
          headers: {
            'x-user-email': userEmail.toLowerCase(),
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch characters: ${response.statusText}`)
        }

        const data = await response.json()
        setCharacters(data.characters || [])
      } catch (err) {
        console.error('[Characters] Error fetching characters:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (keycloak.authenticated) {
      fetchCharacters()
    } else {
      setError('You must be logged in to view characters')
      setLoading(false)
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatColor = (statValue: number) => {
    if (statValue >= 16) return 'stat-excellent'
    if (statValue >= 13) return 'stat-good'
    if (statValue >= 10) return 'stat-average'
    return 'stat-poor'
  }

  if (!keycloak.authenticated) {
    return (
      <div className="characters-container">
        <div className="characters-empty">
          <h1>Characters</h1>
          <p>Please log in to view your characters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="characters-container">
      <div className="characters-header">
        <h1>My Characters</h1>
        <p className="characters-subtitle">
          {characters.length > 0
            ? `You have ${characters.length} character${characters.length !== 1 ? 's' : ''}`
            : 'No characters yet'}
        </p>
      </div>

      {error && (
        <div className="characters-error">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="characters-loading">
          <div className="loading-spinner"></div>
          <p>Loading your characters...</p>
        </div>
      )}

      {!loading && characters.length === 0 && !error && (
        <div className="characters-empty">
          <div className="empty-icon">⚔️</div>
          <h2>No Characters Yet</h2>
          <p>Create your first character to begin your adventure!</p>
          <a href="/character-sheet" className="btn btn-primary">
            Create Character
          </a>
        </div>
      )}

      {!loading && characters.length > 0 && (
        <div className="characters-grid">
          {characters.map((character) => (
            <div key={character.id} className="character-card">
              <div className="card-header">
                <h2 className="character-name">{character.name}</h2>
                <div className="card-meta">
                  {character.approval_status && (
                    <span className={`approval-badge approval-${character.approval_status.toLowerCase()}`}>
                      {character.approval_status}
                    </span>
                  )}
                </div>
              </div>

              <div className="card-body">
                <div className="character-info">
                  {character.class_name && (
                    <div className="info-row">
                      <span className="label">Class:</span>
                      <span className="value">{character.class_name}</span>
                    </div>
                  )}
                  {character.race_name && (
                    <div className="info-row">
                      <span className="label">Race:</span>
                      <span className="value">{character.race_name}</span>
                    </div>
                  )}
                </div>

                <div className="stats-grid">
                  <div className={`stat ${getStatColor(character.strength)}`}>
                    <div className="stat-label">STR</div>
                    <div className="stat-value">{character.strength}</div>
                  </div>
                  <div className={`stat ${getStatColor(character.dexterity)}`}>
                    <div className="stat-label">DEX</div>
                    <div className="stat-value">{character.dexterity}</div>
                  </div>
                  <div className={`stat ${getStatColor(character.constitution)}`}>
                    <div className="stat-label">CON</div>
                    <div className="stat-value">{character.constitution}</div>
                  </div>
                  <div className={`stat ${getStatColor(character.intelligence)}`}>
                    <div className="stat-label">INT</div>
                    <div className="stat-value">{character.intelligence}</div>
                  </div>
                  <div className={`stat ${getStatColor(character.wisdom)}`}>
                    <div className="stat-label">WIS</div>
                    <div className="stat-value">{character.wisdom}</div>
                  </div>
                  <div className={`stat ${getStatColor(character.charisma)}`}>
                    <div className="stat-label">CHA</div>
                    <div className="stat-value">{character.charisma}</div>
                  </div>
                </div>

                {character.feedback && (
                  <div className="feedback-section">
                    <p className="feedback-label">Feedback:</p>
                    <p className="feedback-text">{character.feedback}</p>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="dates">
                  <span className="date-created">Created: {formatDate(character.created_at)}</span>
                  <span className="date-modified">Modified: {formatDate(character.last_modified)}</span>
                </div>
                <a href={`/character-sheet?id=${character.id}`} className="btn btn-small">
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Characters
