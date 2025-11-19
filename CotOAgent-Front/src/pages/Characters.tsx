import { useEffect, useState, useRef } from 'react'
import keycloak from '../keycloak'
import '../css/characters.css'
import { useToast } from '../context/ToastContext'
import { CharactersList, CharacterDetailsModal } from '../components/CharacterGallery'

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
  const { addToast } = useToast()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const [lastSubmittedData, setLastSubmittedData] = useState<{
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
  const submissionInProgressRef = useRef(false)

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

        const response = await fetch(`/api/characters`, {
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
        const [racesResponse, classesResponse] = await Promise.all([
          fetch(`/api/races/names`),
          fetch(`/api/classes/names`),
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
    const characterData = {
      class_name: character.class_name || '',
      race_name: character.race_name || '',
      strength: character.strength,
      dexterity: character.dexterity,
      constitution: character.constitution,
      intelligence: character.intelligence,
      wisdom: character.wisdom,
      charisma: character.charisma,
    }
    setSelectedCharacter(character)
    setEditedData(characterData)
    setLastSubmittedData(characterData)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = async () => {
    // Refresh character data to get updated status
    if (selectedCharacter) {
      try {
        const userEmail = keycloak.tokenParsed?.email
        if (userEmail) {
          const response = await fetch(`/api/characters`, {
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
    setLastSubmittedData(null)
    setIsSubmitting(false)
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

    // Prevent double submission using ref (immediate check)
    if (submissionInProgressRef.current) return
    submissionInProgressRef.current = true
    setIsSubmitting(true)

    try {
      const userEmail = keycloak.tokenParsed?.email
      if (!userEmail) {
        setError('Unable to retrieve user email')
        submissionInProgressRef.current = false
        setIsSubmitting(false)
        return
      }

      const response = await fetch(`/api/characters/${selectedCharacter.id}`, {
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
    } finally {
      submissionInProgressRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleSubmitRevision = async () => {
    if (!selectedCharacter || !editedData) return

    // Prevent double submission using ref (immediate check)
    if (submissionInProgressRef.current) return
    submissionInProgressRef.current = true
    setIsSubmitting(true)

    // Check if any changes were made since last submission
    const hasChanges =
      editedData.class_name !== (lastSubmittedData?.class_name || '') ||
      editedData.race_name !== (lastSubmittedData?.race_name || '') ||
      editedData.strength !== (lastSubmittedData?.strength || 0) ||
      editedData.dexterity !== (lastSubmittedData?.dexterity || 0) ||
      editedData.constitution !== (lastSubmittedData?.constitution || 0) ||
      editedData.intelligence !== (lastSubmittedData?.intelligence || 0) ||
      editedData.wisdom !== (lastSubmittedData?.wisdom || 0) ||
      editedData.charisma !== (lastSubmittedData?.charisma || 0)

    if (!hasChanges) {
      addToast('No changes were made since the last submission. Please edit the character before submitting again.', 'warning')
      submissionInProgressRef.current = false
      setIsSubmitting(false)
      return
    }

    try {
      const userEmail = keycloak.tokenParsed?.email
      if (!userEmail) {
        addToast('Unable to retrieve user email', 'error')
        submissionInProgressRef.current = false
        setIsSubmitting(false)
        return
      }

      const response = await fetch(`/api/discord/submit-revision`, {
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

      // Update lastSubmittedData to the current editedData so user needs to make changes before next submit
      setLastSubmittedData(editedData)

      // Close modal and refresh character data
      await closeDetailsModal()
    } catch (err) {
      console.error('[Characters] Error submitting revision:', err)
      addToast(err instanceof Error ? err.message : 'Failed to submit revision', 'error')
    } finally {
      submissionInProgressRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleDeleteCharacter = async () => {
    if (!selectedCharacter) return

    // Confirm deletion with the user
    if (!window.confirm(`Are you sure you want to delete "${selectedCharacter.name}"? This action cannot be undone.`)) {
      return
    }

    if (submissionInProgressRef.current) return
    submissionInProgressRef.current = true
    setIsSubmitting(true)

    try {
      const userEmail = keycloak.tokenParsed?.email
      if (!userEmail) {
        setError('Unable to retrieve user email')
        return
      }

      const response = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': userEmail.toLowerCase(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete character: ${response.statusText}`)
      }

      // Remove the character from the list
      setCharacters(characters.filter((char) => char.id !== selectedCharacter.id))

      // Close modal
      setShowDetailsModal(false)
      setSelectedCharacter(null)
      setEditedData(null)
      setLastSubmittedData(null)
    } catch (err) {
      console.error('[Characters] Error deleting character:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete character')
    } finally {
      submissionInProgressRef.current = false
      setIsSubmitting(false)
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
        <CharactersList
          characters={characters}
          onViewDetails={handleViewDetails}
          formatDate={formatDate}
          getStatColor={getStatColor}
        />
      )}

      {showDetailsModal && selectedCharacter && editedData && (
        <CharacterDetailsModal
          character={selectedCharacter}
          editedData={editedData}
          races={races}
          classes={classes}
          onEditChange={handleEditChange}
          onClose={closeDetailsModal}
          onSaveRevision={handleSaveRevision}
          onSubmitRevision={handleSubmitRevision}
          onDeleteCharacter={handleDeleteCharacter}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

export default Characters
