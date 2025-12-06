import { ContentCard } from '../ContentCard'

export function ImportInformationSection() {
  return (
    <ContentCard>
      <h3 className="section-header">ℹ️ Import Information</h3>
      <ul className="list-none p-0 space-y-3">
        <li className="text-gray-600 leading-relaxed">
          <strong className="text-gray-800">Races:</strong> Import fantasy races with descriptions and
          stats
        </li>
        <li className="text-gray-600 leading-relaxed">
          <strong className="text-gray-800">Classes:</strong> Import character classes and their properties
        </li>
        <li className="text-gray-600 leading-relaxed">
          <strong className="text-gray-800">Spells:</strong> Import spells with mana costs and descriptions
        </li>
      </ul>
    </ContentCard>
  )
}
