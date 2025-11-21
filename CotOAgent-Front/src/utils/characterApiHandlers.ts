/**
 * Character API operations and handlers
 */

import keycloak from '../keycloak'
import { apiCall, buildApiUrl } from '../utils/api'
import type { Character, CharacterEditData } from '../types/Character'
import { updateCharacter, updateCharacterInList, hasCharacterChanges } from '../types/Character'

interface CharacterApiHandlersProps {
  addToast: (message: string, type: 'success' | 'error' | 'warning') => void
}

export const createCharacterApiHandlers = ({ addToast }: CharacterApiHandlersProps) => {
  const getUserEmail = (): string | null => {
    const email = keycloak.tokenParsed?.email
    return email ? email.toLowerCase() : null
  }

  const handleSaveRevision = async (
    selectedCharacter: Character | null,
    editedData: CharacterEditData | null,
    characters: Character[],
    setCharacters: (characters: Character[]) => void,
    setSelectedCharacter: (character: Character | null) => void,
    submissionInProgressRef: React.MutableRefObject<boolean>,
    setIsSubmitting: (submitting: boolean) => void,
    closeDetailsModal: () => void
  ): Promise<boolean> => {
    if (!selectedCharacter || !editedData) return false

    // Prevent double submission
    if (submissionInProgressRef.current) return false
    submissionInProgressRef.current = true
    setIsSubmitting(true)

    const userEmail = getUserEmail()
    if (!userEmail) {
      addToast('Unable to retrieve user email', 'error')
      submissionInProgressRef.current = false
      setIsSubmitting(false)
      return false
    }

    try {
      const result = await apiCall(
        buildApiUrl(`/characters/${selectedCharacter.id}`),
        {
          method: 'PUT',
          headers: {
            'x-user-email': userEmail,
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
        }
      )

      if (result) {
        addToast('Character saved successfully', 'success')
        
        // Update the character in the list
        setCharacters(updateCharacterInList(characters, selectedCharacter.id, editedData))

        // Update selected character for display
        setSelectedCharacter(updateCharacter(selectedCharacter, editedData))

        await closeDetailsModal()
        return true
      }
      return false
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save character'
      addToast(errorMsg, 'error')
      return false
    } finally {
      submissionInProgressRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleSubmitRevision = async (
    selectedCharacter: Character | null,
    editedData: CharacterEditData | null,
    lastSubmittedData: CharacterEditData | null,
    setLastSubmittedData: (data: CharacterEditData | null) => void,
    submissionInProgressRef: React.MutableRefObject<boolean>,
    setIsSubmitting: (submitting: boolean) => void,
    closeDetailsModal: () => void
  ): Promise<boolean> => {
    if (!selectedCharacter || !editedData) return false

    // Prevent double submission
    if (submissionInProgressRef.current) return false
    submissionInProgressRef.current = true
    setIsSubmitting(true)

    // Check if any changes were made since last submission
    if (!hasCharacterChanges(editedData, lastSubmittedData)) {
      addToast('No changes were made since the last submission. Please edit the character before submitting again.', 'warning')
      submissionInProgressRef.current = false
      setIsSubmitting(false)
      return false
    }

    const userEmail = keycloak.tokenParsed?.email
    if (!userEmail) {
      addToast('Unable to retrieve user email', 'error')
      submissionInProgressRef.current = false
      setIsSubmitting(false)
      return false
    }

    try {
      const result = await apiCall(
        buildApiUrl('/discord/submit-revision'),
        {
          method: 'POST',
          body: JSON.stringify({
            characterId: selectedCharacter.id,
            userEmail: userEmail,
          }),
        }
      )

      if (result) {
        addToast('Character revision submitted successfully', 'success')
        // Update lastSubmittedData to the current editedData so user needs to make changes before next submit
        setLastSubmittedData(editedData)

        // Close modal and refresh character data
        await closeDetailsModal()
        return true
      }
      return false
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit character revision'
      addToast(errorMsg, 'error')
      return false
    } finally {
      submissionInProgressRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleDeleteCharacter = async (
    selectedCharacter: Character | null,
    characters: Character[],
    setCharacters: (characters: Character[]) => void,
    submissionInProgressRef: React.MutableRefObject<boolean>,
    setIsSubmitting: (submitting: boolean) => void,
    setShowDetailsModal: (show: boolean) => void,
    setSelectedCharacter: (character: Character | null) => void,
    setEditedData: (data: CharacterEditData | null) => void,
    setLastSubmittedData: (data: CharacterEditData | null) => void
  ): Promise<boolean> => {
    if (!selectedCharacter) return false

    // Confirm deletion with the user
    if (!window.confirm(`Are you sure you want to delete "${selectedCharacter.name}"? This action cannot be undone.`)) {
      return false
    }

    if (submissionInProgressRef.current) return false
    submissionInProgressRef.current = true
    setIsSubmitting(true)

    const userEmail = getUserEmail()
    if (!userEmail) {
      addToast('Unable to retrieve user email', 'error')
      submissionInProgressRef.current = false
      setIsSubmitting(false)
      return false
    }

    try {
      const result = await apiCall(
        buildApiUrl(`/characters/${selectedCharacter.id}`),
        {
          method: 'DELETE',
          headers: {
            'x-user-email': userEmail,
          },
        }
      )

      if (result) {
        addToast('Character deleted successfully', 'success')
        // Remove the character from the list
        setCharacters(characters.filter((char) => char.id !== selectedCharacter.id))

        // Close modal
        setShowDetailsModal(false)
        setSelectedCharacter(null)
        setEditedData(null)
        setLastSubmittedData(null)
        return true
      }
      return false
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete character'
      addToast(errorMsg, 'error')
      return false
    } finally {
      submissionInProgressRef.current = false
      setIsSubmitting(false)
    }
  }

  return {
    handleSaveRevision,
    handleSubmitRevision,
    handleDeleteCharacter,
  }
}
