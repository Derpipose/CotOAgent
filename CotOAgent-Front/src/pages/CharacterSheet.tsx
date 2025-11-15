import { useState, useEffect } from 'react';
import type { CharacterDto } from '../DTOS/Character.Dto';
import { useAuth } from '../context/useAuth';
import '../css/charactersheet.css';

export default function CharacterSheet() {
  const { userEmail } = useAuth();
  
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
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [, setCharacterId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, racesRes] = await Promise.all([
          fetch('/api/classes/names'),
          fetch('/api/races/names'),
        ]);

        if (classesRes.ok) {
          const classesData = await classesRes.json();
          console.log('Classes data:', classesData);
          setClasses(classesData);
        } else {
          console.error('Classes response not ok:', classesRes.status, classesRes.statusText);
        }

        if (racesRes.ok) {
          const racesData = await racesRes.json();
          console.log('Races data:', racesData);
          setRaces(racesData);
        } else {
          console.error('Races response not ok:', racesRes.status, racesRes.statusText);
        }
      } catch (error) {
        console.error('Error fetching classes or races:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      const response = await fetch('/api/random/8');
      if (!response.ok) {
        throw new Error('Failed to generate random number');
      }
      const data = await response.json();
      const randomNumber = data.numbers as number;
      const newStatValue = 10 + randomNumber;
      handleStatChange(statName, newStatValue);
    } catch (error) {
      console.error('Error generating random stat:', error);
    }
  };

  const saveCharacterToLocalStorage = () => {
    // Validate that required fields are filled in
    if (!character.Name || character.Name.trim() === '') {
      setSaveMessage('Please enter a character name');
      setIsError(true);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    if (!character.Class) {
      setSaveMessage('Please select a character class');
      setIsError(true);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    if (!character.Race) {
      setSaveMessage('Please select a character race');
      setIsError(true);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    try {
      localStorage.setItem('character', JSON.stringify(character));
      setSaveMessage('Character saved successfully!');
      setIsError(false);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving character to local storage:', error);
      setSaveMessage('Error saving character');
      setIsError(true);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const submitCharacterForApproval = async () => {
    // Validate required fields
    if (!character.Name || character.Name.trim() === '') {
      setSaveMessage('Please enter a character name');
      setIsError(true);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    if (!character.Class) {
      setSaveMessage('Please select a character class');
      setIsError(true);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    if (!character.Race) {
      setSaveMessage('Please select a character race');
      setIsError(true);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    if (!userEmail) {
      setSaveMessage('Error: Could not determine user email');
      setIsError(true);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const backendUrl = window.location.protocol === 'https:' 
        ? `https://${window.location.hostname}/api`
        : 'http://localhost:3000/api';

      // Step 1: Save character to database
      console.log('[CharacterSheet] Creating character...');
      const createResponse = await fetch(`${backendUrl}/characters/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          name: character.Name,
          class: character.Class,
          race: character.Race,
          stats: character.Stats,
        }),
      });

      if (!createResponse.ok) {
        const createError = await createResponse.json();
        throw new Error(createError.error || 'Failed to create character');
      }

      const createData = await createResponse.json();
      const newCharacterId = createData.characterId;
      setCharacterId(newCharacterId);
      console.log('[CharacterSheet] Character created with ID:', newCharacterId);

      // Step 2: Submit for approval
      console.log('[CharacterSheet] Submitting for approval...');
      const submitResponse = await fetch(`${backendUrl}/discord/submit-character`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          characterId: newCharacterId,
          userEmail: userEmail,
        }),
      });

      const submitData = await submitResponse.json();

      if (!submitResponse.ok) {
        throw new Error(submitData.error || 'Failed to submit character');
      }

      setSaveMessage('Character submitted for approval! Check Discord for the submission.');
      setIsError(false);
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      console.error('Error submitting character:', error);
      setSaveMessage(
        error instanceof Error ? error.message : 'Error submitting character for approval'
      );
      setIsError(true);
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSubmitting(false);
    }
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
          {saveMessage && <div className={`save-message ${isError ? 'error' : ''}`}>{saveMessage}</div>}
        </div>
      </div>
    </div>
  )
}
