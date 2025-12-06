import { useState, useRef, useEffect } from 'react'
import keycloak from '../keycloak'
import { useQueryApi } from './useQueryApi'
import type { Character, CharacterEditData } from '../types/Character'
import { initializeCharacterEditData } from '../types/Character'

interface UseCharactersReturn {
  characters: Character[]
  setCharacters: (characters: Character[]) => void
  races: string[]
  classes: string[]
  isLoading: boolean
  refetch: () => Promise<void>
  userEmail: string | undefined
  isAuthenticated: boolean
}

export const useCharacters = (): UseCharactersReturn => {
  const [characters, setCharacters] = useState<Character[]>([])
  
  const userEmail = keycloak.tokenParsed?.email?.toLowerCase()
  const isAuthenticated = keycloak.authenticated

  const { data: races = [] } = useQueryApi<string[]>(
    '/races/names',
    { showError: false }
  )

  const { data: classes = [] } = useQueryApi<string[]>(
    '/classes/names',
    { showError: false }
  )

  const { data: characterData = { characters: [] }, isLoading, refetch: queryRefetch } = useQueryApi<{ characters: Character[] }>(
    '/characters',
    {
      enabled: isAuthenticated && !!userEmail,
      showError: true,
      errorMessage: 'Failed to load characters',
      headers: userEmail ? { 'x-user-email': userEmail } : undefined,
      refetchInterval: 30000, // Poll every 30 seconds
      refetchIntervalInBackground: true, // Continue polling even when tab is unfocused
    }
  )

  useEffect(() => {
    if (isAuthenticated && characterData?.characters && Array.isArray(characterData.characters)) {
      setCharacters((prevCharacters) => {
        if (JSON.stringify(prevCharacters) !== JSON.stringify(characterData.characters)) {
          return characterData.characters
        }
        return prevCharacters
      })
    }
  }, [characterData, isAuthenticated])

  const refetch = async () => {
    try {
      await queryRefetch()
    } catch (error) {
      console.error('Failed to refetch characters:', error)
    }
  }

  return {
    characters,
    setCharacters,
    races,
    classes,
    isLoading,
    refetch,
    userEmail,
    isAuthenticated,
  }
}

interface UseCharacterDetailsReturn {
  selectedCharacter: Character | null
  setSelectedCharacter: (character: Character | null) => void
  showDetailsModal: boolean
  setShowDetailsModal: (show: boolean) => void
  editedData: CharacterEditData | null
  setEditedData: (data: CharacterEditData | null) => void
  lastSubmittedData: CharacterEditData | null
  setLastSubmittedData: (data: CharacterEditData | null) => void
  isSubmitting: boolean
  setIsSubmitting: (submitting: boolean) => void
  submissionInProgressRef: React.MutableRefObject<boolean>
  openDetailsModal: (character: Character) => void
  closeDetailsModal: () => void
  handleEditChange: (field: string, value: string | number) => void
}

export const useCharacterDetails = (): UseCharacterDetailsReturn => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editedData, setEditedData] = useState<CharacterEditData | null>(null)
  const [lastSubmittedData, setLastSubmittedData] = useState<CharacterEditData | null>(null)
  const submissionInProgressRef = useRef(false)

  const openDetailsModal = (character: Character) => {
    const characterData = initializeCharacterEditData(character)
    setSelectedCharacter(character)
    setEditedData(characterData)
    setLastSubmittedData(characterData)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
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

  return {
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
  }
}
