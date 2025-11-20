import { useState, useEffect } from 'react';
import type { CharacterDto } from '../DTOS/Character.Dto';
import { useAuth } from '../context/useAuth';
import { useApiCall } from '../hooks/useApiCall';
import { useToast } from '../context/ToastContext';
import '../css/charactersheet.css';

export default function CharacterSheet() {
  const { userEmail } = useAuth();
  const { call } = useApiCall();
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

  const [classes, setClasses] = useState<string[]>([]);
  const [races, setRaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [classesData, racesData] = await Promise.all([
        call<string[]>('/classes/names', undefined, { showError: false }),
        call<string[]>('/races/names', undefined, { showError: false }),
      ]);

      if (classesData) {
        setClasses(classesData);
      }

      if (racesData) {
        setRaces(racesData);
      }

      setLoading(false);
    };

    fetchData();
  }, [call]);

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
    const data = await call<{ numbers: number }>(
      '/random/8',
      undefined,
      {
        showError: true,
        errorMessage: 'Failed to generate random number',
      }
    );

    if (data) {
      const randomNumber = data.numbers;
      const newStatValue = 10 + randomNumber;
      handleStatChange(statName, newStatValue);
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

    // Step 1: Save character to database
    const createData = await call<{ characterId: number }>(
      '/characters/create',
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
      },
      {
        showSuccess: false,
        showError: true,
        errorMessage: 'Failed to create character',
      }
    );

    if (!createData) {
      setSubmitting(false);
      return;
    }

    // Step 2: Submit for approval
    await call(
      '/discord/submit-character',
      {
        method: 'POST',
        headers: {
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          characterId: createData.characterId,
          userEmail: userEmail,
        }),
      },
      {
        showSuccess: true,
        successMessage: 'Character submitted for approval! Check Discord for the submission.',
        showError: true,
        errorMessage: 'Failed to submit character for approval',
      }
    );

    setSubmitting(false);
  };

  return (
    <div className="character-sheet-container">
      <h1>Character Sheet</h1>
      <div className="character-details-card">
        <h2>Character Details</h2>
        <div className="character-info">
          <div className="info-item">
            <strong>Name</strong>
            <input
              type="text"
              value={character.Name}
              onChange={handleNameChange}
              placeholder="Enter character name"
              className="info-input"
            />
          </div>
          <div className="info-item">
            <strong>Class</strong>
            <select
              value={character.Class}
              onChange={handleClassChange}
              className="info-select"
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
          <div className="info-item">
            <strong>Race</strong>
            <select
              value={character.Race}
              onChange={handleRaceChange}
              className="info-select"
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

        <div className="stats-section">
          <h3>Abilities</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Strength</strong>
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
                className="random-stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-item">
              <strong>Dexterity</strong>
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
                className="random-stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-item">
              <strong>Constitution</strong>
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
                className="random-stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-item">
              <strong>Intelligence</strong>
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
                className="random-stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-item">
              <strong>Wisdom</strong>
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
                className="random-stat-button"
              >
                Random
              </button>
            </div>
            <div className="stat-item">
              <strong>Charisma</strong>
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
                className="random-stat-button"
              >
                Random
              </button>
            </div>
          </div>
        </div>

        <div className="button-section">
          <button 
            onClick={saveCharacterToLocalStorage}
            className="save-button"
          >
            Save Character Locally
          </button>
          <button 
            onClick={submitCharacterForApproval}
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  )
}
