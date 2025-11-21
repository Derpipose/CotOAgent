/**
 * Character page rendering components
 */

import React from 'react'
import { CharactersList, CharacterDetailsModal } from '../components/CharacterGallery'
import type { Character, CharacterEditData } from '../types/Character'

interface CharacterPageHeaderProps {
  characterCount: number
}

export const CharacterPageHeader: React.FC<CharacterPageHeaderProps> = ({ characterCount }) => (
  <div className="characters-header">
    <h1>My Characters</h1>
    <p className="characters-subtitle">
      {characterCount > 0
        ? `You have ${characterCount} character${characterCount !== 1 ? 's' : ''}`
        : 'No characters yet'}
    </p>
  </div>
)

export const CharacterPageLoading: React.FC = () => (
  <div className="characters-loading">
    <div className="loading-spinner"></div>
    <p>Loading your characters...</p>
  </div>
)

export const CharacterPageEmpty: React.FC = () => (
  <div className="characters-empty">
    <div className="empty-icon">⚔️</div>
    <h2>No Characters Yet</h2>
    <p>Create your first character to begin your adventure!</p>
    <a href="/character-sheet" className="btn btn-primary">
      Create Character
    </a>
  </div>
)

interface CharacterPageListProps {
  characters: Character[]
  onViewDetails: (character: Character) => void
  formatDate: (dateString: string) => string
  getStatColor: (statValue: number) => string
}

export const CharacterPageList: React.FC<CharacterPageListProps> = ({
  characters,
  onViewDetails,
  formatDate,
  getStatColor,
}) => (
  <CharactersList
    characters={characters}
    onViewDetails={onViewDetails}
    formatDate={formatDate}
    getStatColor={getStatColor}
  />
)

interface CharacterPageModalProps {
  character: Character
  editedData: CharacterEditData
  races: string[]
  classes: string[]
  onEditChange: (field: string, value: string | number) => void
  onClose: () => void
  onSaveRevision: () => void
  onSubmitRevision: () => void
  onDeleteCharacter: () => void
  isSubmitting: boolean
}

export const CharacterPageModal: React.FC<CharacterPageModalProps> = ({
  character,
  editedData,
  races,
  classes,
  onEditChange,
  onClose,
  onSaveRevision,
  onSubmitRevision,
  onDeleteCharacter,
  isSubmitting,
}) => (
  <CharacterDetailsModal
    character={character}
    editedData={editedData}
    races={races}
    classes={classes}
    onEditChange={onEditChange}
    onClose={onClose}
    onSaveRevision={onSaveRevision}
    onSubmitRevision={onSubmitRevision}
    onDeleteCharacter={onDeleteCharacter}
    isSubmitting={isSubmitting}
  />
)
