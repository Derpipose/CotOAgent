import { useMutationApi } from '../../hooks/useQueryApi'
import { ContentCard } from '../ContentCard'

interface ImportDataSectionProps {
  onImport: (type: 'races' | 'classes' | 'spells') => void
  importRacesMutation: ReturnType<typeof useMutationApi>
  importClassesMutation: ReturnType<typeof useMutationApi>
  importSpellsMutation: ReturnType<typeof useMutationApi>
}

export function ImportDataSection({
  onImport,
  importRacesMutation,
  importClassesMutation,
  importSpellsMutation,
}: ImportDataSectionProps) {
  const isAnyLoading =
    importRacesMutation.isPending ||
    importClassesMutation.isPending ||
    importSpellsMutation.isPending

  return (
    <ContentCard className="mb-8">
      <h2 className="section-header">📥 Import Game Data</h2>
      <p className="text-section-description">Import races, classes, and spells to the database</p>

      <div className="flex gap-4 justify-center flex-wrap">
        <div className="btn-container-col-flex">
          <button
            className="btn-primary w-full"
            onClick={() => onImport('races')}
            disabled={isAnyLoading}
          >
            {importRacesMutation.isPending ? '⏳ Importing...' : '🐉 Import Races'}
          </button>
        </div>

        <div className="btn-container-col-flex">
          <button
            className="btn-primary w-full"
            onClick={() => onImport('classes')}
            disabled={isAnyLoading}
          >
            {importClassesMutation.isPending ? '⏳ Importing...' : '⚔️ Import Classes'}
          </button>
        </div>

        <div className="btn-container-col-flex">
          <button
            className="btn-primary w-full"
            onClick={() => onImport('spells')}
            disabled={isAnyLoading}
          >
            {importSpellsMutation.isPending ? '⏳ Importing...' : '✨ Import Spells'}
          </button>
        </div>
      </div>
    </ContentCard>
  )
}
