import RaceItem from './RaceItem';

interface RaceData {
  id?: number;
  Campaign: string;
  SubType?: string;
  Name: string;
  Description: string;
  Starter?: string;
  Special?: string;
  Pinterest_Inspo_Board?: string;
  Distance?: number;
}

interface RacesListProps {
  races: RaceData[];
  expandedRaceKey: string | null;
  onToggleExpand: (raceKey: string) => void;
}

export default function RacesList({ races, expandedRaceKey, onToggleExpand }: RacesListProps) {
  return (
    <div className="races-list">
      {races.map((race) => {
        const raceKey = `${race.Name}-${race.Campaign}`;
        return (
          <RaceItem
            key={`${race.id}-${race.Name}-${race.Campaign}`}
            race={race}
            isExpanded={expandedRaceKey === raceKey}
            onToggleExpand={() => onToggleExpand(raceKey)}
          />
        );
      })}
    </div>
  );
}
