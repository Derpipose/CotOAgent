import { useEffect, useState, useRef } from 'react'
import keycloak from '../keycloak'
import '../css/characters.css'
import { useToast } from '../context/ToastContext'
import { useApiCall } from '../hooks/useApiCall'
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
  const { call } = useApiCall()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
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
      setLoading(true)

      // Get user email from Keycloak
      const userEmail = keycloak.tokenParsed?.email
      if (!userEmail) {
        addToast('Unable to retrieve user email', 'error')
        setLoading(false)
        return
      }

      const data = await call<{ characters: Character[] }>(
        '/characters',
        {
          method: 'GET',
          headers: {
            'x-user-email': userEmail.toLowerCase(),
          },
        },
        {
          showError: true,
          errorMessage: 'Failed to load characters',
        }
      )

      if (data) {
        setCharacters(data.characters || [])
      }
      setLoading(false)
    }

    if (keycloak.authenticated) {
      fetchCharacters()
    } else {
      addToast('Please log in to view characters', 'warning')
      setLoading(false)
    }
  }, [call, addToast])

  // Fetch races and classes
  useEffect(() => {
    const fetchRacesAndClasses = async () => {
      const [racesData, classesData] = await Promise.all([
        call<string[]>('/races/names', undefined, {
          showError: false,
        }),
        call<string[]>('/classes/names', undefined, {
          showError: false,
        }),
      ])

      if (racesData) {
        setRaces(racesData || [])
      }

      if (classesData) {
        setClasses(classesData || [])
      }
    }

    fetchRacesAndClasses()
  }, [call])

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
      const userEmail = keycloak.tokenParsed?.email
      if (userEmail) {
        const data = await call<{ characters: Character[] }>(
          '/characters',
          {
            method: 'GET',
            headers: {
              'x-user-email': userEmail.toLowerCase(),
            },
          },
          {
            showError: false,
          }
        )

        if (data) {
          setCharacters(data.characters || [])
        }
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

    const userEmail = keycloak.tokenParsed?.email
    if (!userEmail) {
      addToast('Unable to retrieve user email', 'error')
      submissionInProgressRef.current = false
      setIsSubmitting(false)
      return
    }

    const result = await call(
      `/characters/${selectedCharacter.id}`,
      {
        method: 'PUT',
        headers: {
          'x-user-email': userEmail.toLowerCase(),
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
      },
      {
        showSuccess: true,
        successMessage: 'Character saved successfully',
        showError: true,
        errorMessage: 'Failed to save character',
      }
    )

    if (result) {
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
    }

    submissionInProgressRef.current = false
    setIsSubmitting(false)
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

    const userEmail = keycloak.tokenParsed?.email
    if (!userEmail) {
      addToast('Unable to retrieve user email', 'error')
      submissionInProgressRef.current = false
      setIsSubmitting(false)
      return
    }

    const result = await call(
      '/discord/submit-revision',
      {
        method: 'POST',
        body: JSON.stringify({
          characterId: selectedCharacter.id,
          userEmail: userEmail,
        }),
      },
      {
        showSuccess: true,
        successMessage: 'Character revision submitted successfully',
        showError: true,
        errorMessage: 'Failed to submit character revision',
      }
    )

    if (result) {
      // Update lastSubmittedData to the current editedData so user needs to make changes before next submit
      setLastSubmittedData(editedData)

      // Close modal and refresh character data
      await closeDetailsModal()
    }

    submissionInProgressRef.current = false
    setIsSubmitting(false)
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

    const userEmail = keycloak.tokenParsed?.email
    if (!userEmail) {
      addToast('Unable to retrieve user email', 'error')
      submissionInProgressRef.current = false
      setIsSubmitting(false)
      return
    }

    const result = await call(
      `/characters/${selectedCharacter.id}`,
      {
        method: 'DELETE',
        headers: {
          'x-user-email': userEmail.toLowerCase(),
        },
      },
      {
        showSuccess: true,
        successMessage: 'Character deleted successfully',
        showError: true,
        errorMessage: 'Failed to delete character',
      }
    )

    if (result) {
      // Remove the character from the list
      setCharacters(characters.filter((char) => char.id !== selectedCharacter.id))

      // Close modal
      setShowDetailsModal(false)
      setSelectedCharacter(null)
      setEditedData(null)
      setLastSubmittedData(null)
    }

    submissionInProgressRef.current = false
    setIsSubmitting(false)
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

      {loading && (
        <div className="characters-loading">
          <div className="loading-spinner"></div>
          <p>Loading your characters...</p>
        </div>
      )}

      {!loading && characters.length === 0 && (
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
