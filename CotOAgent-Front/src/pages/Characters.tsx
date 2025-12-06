import { useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { formatDate, getStatColor } from '../utils/characterUtils'
import { useCharacters, useCharacterDetails } from '../hooks/useCharacterManagement'
import { createCharacterApiHandlers } from '../utils/characterApiHandlers'
import {
  CharacterPageLoading,
  CharacterPageEmpty,
  CharacterPageList,
  CharacterPageModal,
} from '../components/CharacterPageComponents'
import { PageHeader } from '../components/PageHeader'
import type { Character } from '../types/Character'

function Characters() {
  const { addToast } = useToast()

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

  const { handleSaveRevision, handleSubmitRevision, handleDeleteCharacter } =
    createCharacterApiHandlers({ addToast })

    
    const handleViewDetails = (character: Character) => {
      openDetailsModal(character)
    }
    
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
    
    useEffect(() => {
      if (!showDetailsModal && selectedCharacter) {
        refetch().catch((error) => {
          console.error('Failed to refetch characters:', error)
        })
      }
    }, [showDetailsModal, selectedCharacter, refetch])

    const characterCount = characters.length
    
  return (
    <div>
      <PageHeader 
        title="My Characters"
        subtitle={characterCount > 0
          ? `You have ${characterCount} character${characterCount !== 1 ? 's' : ''}`
          : 'No characters yet'}
      />

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
