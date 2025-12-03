import { useState } from 'react';
import type { CharacterDto } from '../DTOS/Character.Dto';
import { useAuth } from '../context/useAuth';
import { useQueryApi } from '../hooks/useQueryApi';
import { useToast } from '../context/ToastContext';
import { apiCall, buildApiUrl } from '../utils/api';

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
    <div className="container-max-width my-5 px-4 font-serif bg-gradient-primary border-4 border-amber-900 p-8 rounded-lg">
      <h1 className="text-gray-100 text-center mb-6 text-4xl font-bold">Character Sheet</h1>
      <div className="bg-amber-50 border-2 border-amber-700 p-6 rounded-lg">
        <h2 className="hidden">Character Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-box">
            <strong className="stat-label">Name</strong>
            <input
              type="text"
              value={character.Name}
              onChange={handleNameChange}
              placeholder="Enter character name"
              className="stat-value"
            />
          </div>
          <div className="stat-box">
            <strong className="stat-label">Class</strong>
            <select
              value={character.Class}
              onChange={handleClassChange}
              className="stat-value"
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
          <div className="stat-box">
            <strong className="stat-label">Race</strong>
            <select
              value={character.Race}
              onChange={handleRaceChange}
              className="stat-value"
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

        <div className="bg-amber-50 border-2 border-amber-700 p-6 rounded-lg">
          <h3 className="hidden">Abilities</h3>
          <div className="grid-stats">
            <div className="stat-box">
              <strong className="stat-label">Strength</strong>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Strength}
                onChange={(e) => handleStatChange('Strength', parseInt(e.target.value) || 10)}
                className="stat-value"
              />
              <button 
                onClick={() => generateRandomStat('Strength')}
                className="stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-box">
              <strong className="stat-label">Dexterity</strong>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Dexterity}
                onChange={(e) => handleStatChange('Dexterity', parseInt(e.target.value) || 10)}
                className="stat-value"
              />
              <button 
                onClick={() => generateRandomStat('Dexterity')}
                className="stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-box">
              <strong className="stat-label">Constitution</strong>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Constitution}
                onChange={(e) => handleStatChange('Constitution', parseInt(e.target.value) || 10)}
                className="stat-value"
              />
              <button 
                onClick={() => generateRandomStat('Constitution')}
                className="stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-box">
              <strong className="stat-label">Intelligence</strong>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Intelligence}
                onChange={(e) => handleStatChange('Intelligence', parseInt(e.target.value) || 10)}
                className="stat-value"
              />
              <button 
                onClick={() => generateRandomStat('Intelligence')}
                className="stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-box">
              <strong className="stat-label">Wisdom</strong>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Wisdom}
                onChange={(e) => handleStatChange('Wisdom', parseInt(e.target.value) || 10)}
                className="stat-value"
              />
              <button 
                onClick={() => generateRandomStat('Wisdom')}
                className="stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-box">
              <strong className="stat-label">Charisma</strong>
              <input
                type="number"
                min="10"
                max="18"
                value={character.Stats.Charisma}
                onChange={(e) => handleStatChange('Charisma', parseInt(e.target.value) || 10)}
                className="stat-value"
              />
              <button 
                onClick={() => generateRandomStat('Charisma')}
                className="stat-button"
              >
                Random
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2.5 mt-5">
          <button 
            onClick={saveCharacterToLocalStorage}
            className="btn-primary-gradient"
          >
            Save Character Locally
          </button>
          <button 
            onClick={submitCharacterForApproval}
            className="btn-secondary-gradient disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  )
}
