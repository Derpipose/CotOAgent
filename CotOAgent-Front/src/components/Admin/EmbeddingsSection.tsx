import { ContentCard } from '../ContentCard'

interface EmbeddingProgress {
  completed: number
  total: number
  failed: number
  percentageComplete: number
}

interface EmbeddingsSectionProps {
  onEmbed: (type: 'races' | 'classes' | 'spells') => void
  embeddingLoading: {
    races: boolean
    classes: boolean
    spells: boolean
  }
  embeddingProgress: {
    races?: EmbeddingProgress & { message: string }
    classes?: EmbeddingProgress & { message: string }
    spells?: EmbeddingProgress & { message: string }
  }
}

export function EmbeddingsSection({
  onEmbed,
  embeddingLoading,
  embeddingProgress,
}: EmbeddingsSectionProps) {
  return (
    <ContentCard className="mb-8">
      <h2 className="section-header">🧠 Generate Embeddings</h2>
      <p className="text-section-description">Generate AI embeddings for semantic search</p>

      <div className="flex gap-4 justify-center flex-wrap">
        <div className="btn-container-col-flex">
          <button
            className="btn-primary w-full"
            onClick={() => onEmbed('races')}
            disabled={embeddingLoading.races}
          >
            {embeddingLoading.races ? '🧠 Generating...' : '🧠 Embed Races'}
          </button>
          {embeddingProgress.races && (
            <div className="btn-container-col-full">
              <div className="progress-bar">
                <div
                  className="progress-fill bg-blue-500"
                  style={{ width: `${embeddingProgress.races.percentageComplete}%` }}
                ></div>
              </div>
              <div className="progress-text">{embeddingProgress.races.message}</div>
            </div>
          )}
        </div>

        <div className="btn-container-col-flex">
          <button
            className="btn-primary w-full"
            onClick={() => onEmbed('classes')}
            disabled={embeddingLoading.classes}
          >
            {embeddingLoading.classes ? '🧠 Generating...' : '🧠 Embed Classes'}
          </button>
          {embeddingProgress.classes && (
            <div className="btn-container-col-full">
              <div className="progress-bar">
                <div
                  className="progress-fill bg-blue-500"
                  style={{ width: `${embeddingProgress.classes.percentageComplete}%` }}
                ></div>
              </div>
              <div className="progress-text">{embeddingProgress.classes.message}</div>
            </div>
          )}
        </div>

        <div className="btn-container-col-flex">
          <button
            className="btn-primary w-full"
            onClick={() => onEmbed('spells')}
            disabled={embeddingLoading.spells}
          >
            {embeddingLoading.spells ? '🧠 Generating...' : '🧠 Embed Spells'}
          </button>
          {embeddingProgress.spells && (
            <div className="btn-container-col-full">
              <div className="progress-bar">
                <div
                  className="progress-fill bg-blue-500"
                  style={{ width: `${embeddingProgress.spells.percentageComplete}%` }}
                ></div>
              </div>
              <div className="progress-text">{embeddingProgress.spells.message}</div>
            </div>
          )}
        </div>
      </div>
    </ContentCard>
  )
}
