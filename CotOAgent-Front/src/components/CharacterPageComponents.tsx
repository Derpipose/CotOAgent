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
  <div className="container-max-width mb-12 text-center">
    <h1 className="text-4xl font-bold text-gray-900 mb-2 -tracking-0.5">My Characters</h1>
    <p className="text-lg text-gray-600">
      {characterCount > 0
        ? `You have ${characterCount} character${characterCount !== 1 ? 's' : ''}`
        : 'No characters yet'}
    </p>
  </div>
)

export const CharacterPageLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-96 gap-6">
    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    <p className="text-lg text-gray-600">Loading your characters...</p>
  </div>
)

export const CharacterPageEmpty: React.FC = () => (
  <div className="empty-state">
    <div className="empty-state-icon text-5xl">⚔️</div>
    <h2 className="empty-state-title">No Characters Yet</h2>
    <p className="empty-state-description">Create your first character to begin your adventure!</p>
    <a href="/character-sheet" className="inline-block font-bold py-3 px-8 rounded-lg cursor-pointer transition-all hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0 bg-blue-200 hover:bg-blue-300 text-slate-600">
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
