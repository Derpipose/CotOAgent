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

interface RaceItemProps {
  race: RaceData;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function RaceItem({ race, isExpanded, onToggleExpand }: RaceItemProps) {
  const { Name, Campaign, Description } = race;

  return (
    <div className="race-item-container">
      <button
        className="race-item-button"
        onClick={onToggleExpand}
      >
        <span className="race-item-name">{Name}</span>
        <span className="race-item-campaign">{Campaign}</span>
        <span className={`race-item-chevron ${isExpanded ? 'race-item-chevron-expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="race-item-description">
          {Description}
        </div>
      )}
    </div>
  );
}
