import { useState } from 'react'
import type { CharacterDto } from '../DTOS/Character.Dto'
import { useAuth } from '../context/useAuth'
import { useQueryApi } from '../hooks/useQueryApi'
import { useToast } from '../context/ToastContext'
import { apiCall, buildApiUrl } from '../utils/api'
import { PageHeader } from '../components/PageHeader'
import { ContentCard } from '../components/ContentCard'
import {
  BasicInfoSection,
  AbilitiesSection,
  ActionButtonsSection,
} from '../components/CharacterSheet'

type StatKey = keyof CharacterDto['Stats']

export default function CharacterSheet() {
  const { userEmail } = useAuth();
  const { addToast } = useToast();
  
  const [character, setCharacter] = useState<CharacterDto>({
    Name: '',
    Class: '',
    Race: '',
    Stats: {
      Strength: 10,
      Dexterity: 10,
      Constitution: 10,
      Intelligence: 10,
      Wisdom: 10,
      Charisma: 10,
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const { data: classes = [], isLoading: classesLoading } = useQueryApi<string[]>(
    '/classes/names',
    { showError: false }
  );

  const { data: races = [], isLoading: racesLoading } = useQueryApi<string[]>(
    '/races/names',
    { showError: false }
  );

  const loading = classesLoading || racesLoading;

  const handleNameChange = (name: string) => {
    setCharacter({ ...character, Name: name })
  }

  const handleClassChange = (cls: string) => {
    setCharacter({ ...character, Class: cls })
  }

  const handleRaceChange = (race: string) => {
    setCharacter({ ...character, Race: race })
  }

  const handleStatChange = (statName: StatKey, value: number) => {
    setCharacter({
      ...character,
      Stats: {
        ...character.Stats,
        [statName]: value,
      },
    })
  }

  const generateRandomStat = async (statName: keyof typeof character.Stats) => {
    try {
      const data = await apiCall<{ numbers: number }>(
        buildApiUrl('/random/8')
      );

      if (data) {
        const randomNumber = data.numbers;
        const newStatValue = 10 + randomNumber;
        handleStatChange(statName, newStatValue);
      }
    } catch {
      addToast('Failed to generate random number', 'error');
    }
  };

  const saveCharacterToLocalStorage = () => {
    if (!character.Name || character.Name.trim() === '') {
      addToast('Please enter a character name', 'warning');
      return;
    }

    if (!character.Class) {
      addToast('Please select a character class', 'warning');
      return;
    }

    if (!character.Race) {
      addToast('Please select a character race', 'warning');
      return;
    }

    localStorage.setItem('character', JSON.stringify(character));
    addToast('Character saved successfully!', 'success');
  };

  const submitCharacterForApproval = async () => {
    if (!character.Name || character.Name.trim() === '') {
      addToast('Please enter a character name', 'warning');
      return;
    }

    if (!character.Class) {
      addToast('Please select a character class', 'warning');
      return;
    }

    if (!character.Race) {
      addToast('Please select a character race', 'warning');
      return;
    }

    if (!userEmail) {
      addToast('Error: Could not determine user email', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const createData = await apiCall<{ characterId: number }>(
        buildApiUrl('/characters/create'),
        {
          method: 'POST',
          headers: {
            'x-user-email': userEmail,
          },
          body: JSON.stringify({
            name: character.Name,
            class: character.Class,
            race: character.Race,
            stats: character.Stats,
          }),
        }
      );

      if (!createData) {
        addToast('Failed to create character', 'error');
        setSubmitting(false);
        return;
      }

      await apiCall(
        buildApiUrl('/discord/submit-character'),
        {
          method: 'POST',
          headers: {
            'x-user-email': userEmail,
          },
          body: JSON.stringify({
            characterId: createData.characterId,
            userEmail: userEmail,
          }),
        }
      );

      addToast('Character submitted for approval! Check Discord for the submission.', 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit character for approval';
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Character Sheet"
        subtitle="Create and customize your character for Chronicles of the Omuns"
      />
      
      <ContentCard variant="elevated">
        <h2 className="hidden">Character Details</h2>
        
        <BasicInfoSection
          character={character}
          loading={loading}
          classes={classes}
          races={races}
          onNameChange={handleNameChange}
          onClassChange={handleClassChange}
          onRaceChange={handleRaceChange}
        />

        <AbilitiesSection
          character={character}
          onStatChange={handleStatChange}
          onGenerateRandomStat={generateRandomStat}
        />

        <ActionButtonsSection
          submitting={submitting}
          onSaveLocally={saveCharacterToLocalStorage}
          onSubmitForApproval={submitCharacterForApproval}
        />
      </ContentCard>
    </div>
  )
}
