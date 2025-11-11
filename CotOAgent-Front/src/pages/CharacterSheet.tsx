import { useState, useEffect } from 'react';
import type { CharacterDto } from '../DTOS/Character.Dto';
import '../css/charactersheet.css';

export default function CharacterSheet() {
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
