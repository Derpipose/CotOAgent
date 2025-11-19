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
    <div className="race-item">
      <button
        className="race-header"
        onClick={onToggleExpand}
      >
        <span className="race-name">{Name}</span>
        <span className="race-campaign">{Campaign}</span>
        <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="race-description">
          {Description}
        </div>
      )}
    </div>
  );
}
