import { useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { formatDate, getStatColor } from '../utils/characterUtils'
import { useCharacters, useCharacterDetails } from '../hooks/useCharacterManagement'
import { createCharacterApiHandlers } from '../utils/characterApiHandlers'
import {
  CharacterPageHeader,
  CharacterPageLoading,
  CharacterPageEmpty,
  CharacterPageList,
  CharacterPageModal,
} from '../components/CharacterPageComponents'
import type { Character } from '../types/Character'

function Characters() {
  const { addToast } = useToast()

  // Data and UI state management
  const {
    characters,
    setCharacters,
    races,
    classes,
    isLoading,
    refetch,
  } = useCharacters()

  const {
    selectedCharacter,
    setSelectedCharacter,
    showDetailsModal,
    setShowDetailsModal,
    editedData,
    setEditedData,
    lastSubmittedData,
    setLastSubmittedData,
    isSubmitting,
    setIsSubmitting,
    submissionInProgressRef,
    openDetailsModal,
    closeDetailsModal,
    handleEditChange,
  } = useCharacterDetails()

  // Create API handlers with toast notifications
  const { handleSaveRevision, handleSubmitRevision, handleDeleteCharacter } =
    createCharacterApiHandlers({ addToast })

    
    // Handler for viewing character details
    const handleViewDetails = (character: Character) => {
      openDetailsModal(character)
    }
    
    // Handler for saving character revisions
    const handleSaveClick = async () => {
      await handleSaveRevision(
        selectedCharacter,
        editedData,
        characters,
        setCharacters,
        setSelectedCharacter,
        submissionInProgressRef,
        setIsSubmitting,
        closeDetailsModal
      )
    }
    
    // Handler for submitting character revisions
    const handleSubmitClick = async () => {
      await handleSubmitRevision(
        selectedCharacter,
        editedData,
        lastSubmittedData,
        setLastSubmittedData,
        submissionInProgressRef,
        setIsSubmitting,
        closeDetailsModal
      )
    }
    
    // Handler for deleting characters
    const handleDeleteClick = async () => {
      await handleDeleteCharacter(
        selectedCharacter,
        characters,
        setCharacters,
        submissionInProgressRef,
        setIsSubmitting,
        setShowDetailsModal,
        setSelectedCharacter,
        setEditedData,
        setLastSubmittedData
      )
    }
    
    // Refresh data on component mount and after modal closes
    useEffect(() => {
      if (!showDetailsModal && selectedCharacter) {
        // Refresh character data to get updated status
        refetch().catch((error) => {
          console.error('Failed to refetch characters:', error)
        })
      }
    }, [showDetailsModal, selectedCharacter, refetch])
    
  return (
    <div className="page-container bg-gradient-to-br from-blue-50 to-blue-100">
      <CharacterPageHeader characterCount={characters.length} />

      {isLoading && <CharacterPageLoading />}

      {!isLoading && characters.length === 0 && <CharacterPageEmpty />}

      {!isLoading && characters.length > 0 && (
        <CharacterPageList
          characters={characters}
          onViewDetails={handleViewDetails}
          formatDate={formatDate}
          getStatColor={getStatColor}
        />
      )}

      {showDetailsModal && selectedCharacter && editedData && (
        <CharacterPageModal
          character={selectedCharacter}
          editedData={editedData}
          races={races}
          classes={classes}
          onEditChange={handleEditChange}
          onClose={closeDetailsModal}
          onSaveRevision={handleSaveClick}
          onSubmitRevision={handleSubmitClick}
          onDeleteCharacter={handleDeleteClick}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

export default Characters
