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
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editedData, setEditedData] = useState<{
    class_name: string
    race_name: string
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  } | null>(null)
  const [races, setRaces] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])

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

  // Fetch races and classes
  useEffect(() => {
    const fetchRacesAndClasses = async () => {
      try {
        const backendUrl = window.location.protocol === 'https:'
          ? `https://${window.location.hostname}/api`
          : 'http://localhost:3000/api'

        const [racesResponse, classesResponse] = await Promise.all([
          fetch(`${backendUrl}/races/names`),
          fetch(`${backendUrl}/classes/names`),
        ])

        if (racesResponse.ok) {
          const raceData = await racesResponse.json()
          setRaces(raceData || [])
        }

        if (classesResponse.ok) {
          const classData = await classesResponse.json()
          setClasses(classData || [])
        }
      } catch (err) {
        console.error('[Characters] Error fetching races/classes:', err)
      }
    }

    fetchRacesAndClasses()
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

  const handleViewDetails = (character: Character) => {
    setSelectedCharacter(character)
    setEditedData({
      class_name: character.class_name || '',
      race_name: character.race_name || '',
      strength: character.strength,
      dexterity: character.dexterity,
      constitution: character.constitution,
      intelligence: character.intelligence,
      wisdom: character.wisdom,
      charisma: character.charisma,
    })
    setShowDetailsModal(true)
  }

  const closeDetailsModal = async () => {
    // Refresh character data to get updated status
    if (selectedCharacter) {
      try {
        const userEmail = keycloak.tokenParsed?.email
        if (userEmail) {
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

          if (response.ok) {
            const data = await response.json()
            setCharacters(data.characters || [])
          }
        }
      } catch (err) {
        console.error('[Characters] Error refreshing character data:', err)
      }
    }

    setShowDetailsModal(false)
    setSelectedCharacter(null)
    setEditedData(null)
  }

  const handleEditChange = (field: string, value: string | number) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value,
      })
    }
  }

  const handleSaveRevision = async () => {
    if (!selectedCharacter || !editedData) return

    try {
      const userEmail = keycloak.tokenParsed?.email
      if (!userEmail) {
        setError('Unable to retrieve user email')
        return
      }

      const backendUrl = window.location.protocol === 'https:'
        ? `https://${window.location.hostname}/api`
        : 'http://localhost:3000/api'

      const response = await fetch(`${backendUrl}/characters/${selectedCharacter.id}`, {
        method: 'PUT',
        headers: {
          'x-user-email': userEmail.toLowerCase(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedCharacter.name,
          class: editedData.class_name,
          race: editedData.race_name,
          stats: {
            Strength: editedData.strength,
            Dexterity: editedData.dexterity,
            Constitution: editedData.constitution,
            Intelligence: editedData.intelligence,
            Wisdom: editedData.wisdom,
            Charisma: editedData.charisma,
          },
          approval_status: 'Revised',
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save character: ${response.statusText}`)
      }

      // Update the character in the list
      setCharacters(
        characters.map((char) =>
          char.id === selectedCharacter.id
            ? {
                ...char,
                class_name: editedData.class_name,
                race_name: editedData.race_name,
                strength: editedData.strength,
                dexterity: editedData.dexterity,
                constitution: editedData.constitution,
                intelligence: editedData.intelligence,
                wisdom: editedData.wisdom,
                charisma: editedData.charisma,
              }
            : char
        )
      )

      // Update selected character for display
      setSelectedCharacter({
        ...selectedCharacter,
        class_name: editedData.class_name,
        race_name: editedData.race_name,
        strength: editedData.strength,
        dexterity: editedData.dexterity,
        constitution: editedData.constitution,
        intelligence: editedData.intelligence,
        wisdom: editedData.wisdom,
        charisma: editedData.charisma,
      })

      closeDetailsModal()
    } catch (err) {
      console.error('[Characters] Error saving revision:', err)
      setError(err instanceof Error ? err.message : 'Failed to save revision')
    }
  }

  const handleSubmitRevision = async () => {
    if (!selectedCharacter) return

    try {
      const userEmail = keycloak.tokenParsed?.email
      if (!userEmail) {
        setError('Unable to retrieve user email')
        return
      }

      const backendUrl = window.location.protocol === 'https:'
        ? `https://${window.location.hostname}/api`
        : 'http://localhost:3000/api'

      const response = await fetch(`${backendUrl}/discord/submit-revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: selectedCharacter.id,
          userEmail: userEmail,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit revision: ${response.statusText}`)
      }

      // Close modal and refresh character data
      await closeDetailsModal()
    } catch (err) {
      console.error('[Characters] Error submitting revision:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit revision')
    }
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
                <button onClick={() => handleViewDetails(character)} className="btn btn-small">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetailsModal && selectedCharacter && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCharacter.name}</h2>
              <button className="modal-close" onClick={closeDetailsModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="character-details">
                <div className="details-info">
                  <div className="detail-row">
                    <label className="detail-label">Class:</label>
                    <select
                      value={editedData?.class_name || ''}
                      onChange={(e) => handleEditChange('class_name', e.target.value)}
                      className="detail-select"
                    >
                      <option value="">Select a class</option>
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="detail-row">
                    <label className="detail-label">Race:</label>
                    <select
                      value={editedData?.race_name || ''}
                      onChange={(e) => handleEditChange('race_name', e.target.value)}
                      className="detail-select"
                    >
                      <option value="">Select a race</option>
                      {races.map((race) => (
                        <option key={race} value={race}>
                          {race}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="character-stats">
                  <h3>Character Stats</h3>
                  <div className="stats-grid-edit">
                    <div className="stat-edit">
                      <label className="stat-label">STR</label>
                      <input
                        type="number"
                        value={editedData?.strength || 0}
                        onChange={(e) => handleEditChange('strength', parseInt(e.target.value, 10) || 0)}
                        className="stat-input"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div className="stat-edit">
                      <label className="stat-label">DEX</label>
                      <input
                        type="number"
                        value={editedData?.dexterity || 0}
                        onChange={(e) => handleEditChange('dexterity', parseInt(e.target.value, 10) || 0)}
                        className="stat-input"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div className="stat-edit">
                      <label className="stat-label">CON</label>
                      <input
                        type="number"
                        value={editedData?.constitution || 0}
                        onChange={(e) => handleEditChange('constitution', parseInt(e.target.value, 10) || 0)}
                        className="stat-input"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div className="stat-edit">
                      <label className="stat-label">INT</label>
                      <input
                        type="number"
                        value={editedData?.intelligence || 0}
                        onChange={(e) => handleEditChange('intelligence', parseInt(e.target.value, 10) || 0)}
                        className="stat-input"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div className="stat-edit">
                      <label className="stat-label">WIS</label>
                      <input
                        type="number"
                        value={editedData?.wisdom || 0}
                        onChange={(e) => handleEditChange('wisdom', parseInt(e.target.value, 10) || 0)}
                        className="stat-input"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div className="stat-edit">
                      <label className="stat-label">CHA</label>
                      <input
                        type="number"
                        value={editedData?.charisma || 0}
                        onChange={(e) => handleEditChange('charisma', parseInt(e.target.value, 10) || 0)}
                        className="stat-input"
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>
                </div>

                {selectedCharacter.feedback && (
                  <div className="feedback-section">
                    <p className="feedback-label">Feedback:</p>
                    <p className="feedback-text">{selectedCharacter.feedback}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetailsModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveRevision}>
                Save Revision
              </button>
              <button className="btn btn-success" onClick={handleSubmitRevision}>
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Characters
