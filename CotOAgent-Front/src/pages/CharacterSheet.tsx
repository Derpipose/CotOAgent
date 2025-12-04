import { useState } from 'react';
import type { CharacterDto } from '../DTOS/Character.Dto';
import { useAuth } from '../context/useAuth';
import { useQueryApi } from '../hooks/useQueryApi';
import { useToast } from '../context/ToastContext';
import { apiCall, buildApiUrl } from '../utils/api';
import { PageHeader } from '../components/PageHeader';
import { ContentCard } from '../components/ContentCard';

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

  // Fetch classes and races
  const { data: classes = [], isLoading: classesLoading } = useQueryApi<string[]>(
    '/classes/names',
    { showError: false }
  );

  const { data: races = [], isLoading: racesLoading } = useQueryApi<string[]>(
    '/races/names',
    { showError: false }
  );

  const loading = classesLoading || racesLoading;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacter({ ...character, Name: e.target.value });
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCharacter({ ...character, Class: e.target.value });
  };

  const handleRaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCharacter({ ...character, Race: e.target.value });
  };

  const handleStatChange = (statName: keyof typeof character.Stats, value: number) => {
    setCharacter({
      ...character,
      Stats: {
        ...character.Stats,
        [statName]: value,
      },
    });
  };

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
    // Validate that required fields are filled in
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
    // Validate required fields
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
      // Step 1: Save character to database
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

      // Step 2: Submit for approval
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
        
        {/* Basic Character Info */}
        <div className="mb-8">
          <h3 className="section-header">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="input-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Character Name</label>
              <input
                type="text"
                value={character.Name}
                onChange={handleNameChange}
                placeholder="Enter character name"
                className="input-large"
              />
            </div>
            <div className="input-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
              <select
                value={character.Class}
                onChange={handleClassChange}
                className="select-base"
                disabled={loading}
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Race</label>
              <select
                value={character.Race}
                onChange={handleRaceChange}
                className="select-base"
                disabled={loading}
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
        </div>

        {/* Character Stats */}
        <div className="mb-8">
          <h3 className="section-header">Abilities</h3>
          <div className="grid-stats">
            <div className="stat-box-modern">
              <label className="stat-label-modern">Strength</label>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Strength}
                onChange={(e) => handleStatChange('Strength', parseInt(e.target.value) || 10)}
                className="stat-input"
              />
              <button 
                onClick={() => generateRandomStat('Strength')}
                className="stat-button-modern"
              >
                Random
              </button>
            </div>
            <div className="stat-box-modern">
              <label className="stat-label-modern">Dexterity</label>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Dexterity}
                onChange={(e) => handleStatChange('Dexterity', parseInt(e.target.value) || 10)}
                className="stat-input"
              />
              <button 
                onClick={() => generateRandomStat('Dexterity')}
                className="stat-button-modern"
              >
                Random
              </button>
            </div>
            <div className="stat-box-modern">
              <label className="stat-label-modern">Constitution</label>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Constitution}
                onChange={(e) => handleStatChange('Constitution', parseInt(e.target.value) || 10)}
                className="stat-input"
              />
              <button 
                onClick={() => generateRandomStat('Constitution')}
                className="stat-button-modern"
              >
                Random
              </button>
            </div>
            <div className="stat-box-modern">
              <label className="stat-label-modern">Intelligence</label>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Intelligence}
                onChange={(e) => handleStatChange('Intelligence', parseInt(e.target.value) || 10)}
                className="stat-input"
              />
              <button 
                onClick={() => generateRandomStat('Intelligence')}
                className="stat-button-modern"
              >
                Random
              </button>
            </div>
            <div className="stat-box-modern">
              <label className="stat-label-modern">Wisdom</label>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Wisdom}
                onChange={(e) => handleStatChange('Wisdom', parseInt(e.target.value) || 10)}
                className="stat-input"
              />
              <button 
                onClick={() => generateRandomStat('Wisdom')}
                className="stat-button-modern"
              >
                Random
              </button>
            </div>
            <div className="stat-box-modern">
              <label className="stat-label-modern">Charisma</label>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Charisma}
                onChange={(e) => handleStatChange('Charisma', parseInt(e.target.value) || 10)}
                className="stat-input"
              />
              <button 
                onClick={() => generateRandomStat('Charisma')}
                className="stat-button-modern"
              >
                Random
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 justify-center">
          <button 
            onClick={saveCharacterToLocalStorage}
            className="btn-cyan-gradient flex-1"
          >
            Save Character Locally
          </button>
          <button 
            onClick={submitCharacterForApproval}
            className="btn-primary-gradient flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </ContentCard>
    </div>
  )
}
