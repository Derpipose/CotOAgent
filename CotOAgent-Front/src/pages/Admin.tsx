import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useMutationApi } from '../hooks/useQueryApi'
import { PageHeader } from '../components/PageHeader'
import { ContentCard } from '../components/ContentCard'

interface EmbeddingProgress {
  completed: number
  total: number
  failed: number
  percentageComplete: number
}

export default function Admin() {
  const { addToast } = useToast()
  const [embeddingLoading, setEmbeddingLoading] = useState<{
    races: boolean
    classes: boolean
    spells: boolean
  }>({
    races: false,
    classes: false,
    spells: false,
  })
  const [embeddingProgress, setEmbeddingProgress] = useState<{
    races?: EmbeddingProgress & { message: string }
    classes?: EmbeddingProgress & { message: string }
    spells?: EmbeddingProgress & { message: string }
  }>({})

  // Import mutations for races, classes, and spells
  const importRacesMutation = useMutationApi<{ savedToDatabase: number }>({
    mutationOptions: {
      mutationFn: async () => {
        const response = await fetch('/api/import/races');
        if (!response.ok) throw new Error('Import failed');
        return response.json();
      },
    },
    showSuccess: true,
    successMessage: 'Successfully imported races',
    showError: true,
    errorMessage: 'Failed to import races',
  })

  const importClassesMutation = useMutationApi<{ savedToDatabase: number }>({
    mutationOptions: {
      mutationFn: async () => {
        const response = await fetch('/api/import/classes');
        if (!response.ok) throw new Error('Import failed');
        return response.json();
      },
    },
    showSuccess: true,
    successMessage: 'Successfully imported classes',
    showError: true,
    errorMessage: 'Failed to import classes',
  })

  const importSpellsMutation = useMutationApi<{ savedToDatabase: number }>({
    mutationOptions: {
      mutationFn: async () => {
        const response = await fetch('/api/import/spells');
        if (!response.ok) throw new Error('Import failed');
        return response.json();
      },
    },
    showSuccess: true,
    successMessage: 'Successfully imported spells',
    showError: true,
    errorMessage: 'Failed to import spells',
  })

  const handleImport = async (type: 'races' | 'classes' | 'spells') => {
    const mutation = 
      type === 'races' ? importRacesMutation :
      type === 'classes' ? importClassesMutation :
      importSpellsMutation

    mutation.mutate({} as Record<string, unknown>)
  }

  const handleEmbed = async (type: 'races' | 'classes' | 'spells') => {
    setEmbeddingLoading((prev) => ({ ...prev, [type]: true }))
    
    const response = await fetch(`/api/embeddings/${type}/generate`, {
      method: 'POST'
    })

    if (response.status === 409) {
      const data = await response.json()
      addToast(data.error || 'Embeddings already exist', 'warning')
      setEmbeddingLoading((prev) => ({ ...prev, [type]: false }))
      return
    }

    if (!response.ok || !response.body) {
      const data = await response.json()
      addToast(data.error || 'Failed to start embedding generation', 'error')
      setEmbeddingLoading((prev) => ({ ...prev, [type]: false }))
      return
    }

    // Handle SSE stream
    try {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            
            if (data.type === 'started') {
              addToast(`Generating embeddings for ${type}...`, 'info')
            } else if (data.type === 'progress') {
              const progress = data.progress as EmbeddingProgress
              setEmbeddingProgress(prev => ({
                ...prev,
                [type]: {
                  ...progress,
                  message: `Processing: ${progress.completed}/${progress.total} (${progress.percentageComplete}%)`
                }
              }))
            }
          }
        }
      }

      // Stream ended, mark as complete and clear loading state
      setEmbeddingLoading((prev) => ({ ...prev, [type]: false }))
      setEmbeddingProgress(prev => ({
        ...prev,
        [type]: undefined
      }))
      addToast(`Embedding generation completed for ${type}!`, 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during streaming'
      addToast(`Error generating embeddings: ${errorMessage}`, 'error')
      setEmbeddingLoading((prev) => ({ ...prev, [type]: false }))
    }
  }

  // Test error functions
  const testSuccessToast = () => {
    addToast('This is a success message! Everything is working great.', 'success')
  }

  const testErrorToast = () => {
    addToast('This is an error message. Something went wrong!', 'error')
  }

  const testWarningToast = () => {
    addToast('This is a warning message. Please be careful!', 'warning')
  }

  const testInfoToast = () => {
    addToast('This is an info message. Just FYI!', 'info')
  }

  const testPersistentToast = () => {
    addToast('This toast will stick around until you dismiss it. Click the X to close.', 'info', 0)
  }

  const testThrowError = () => {
    throw new Error('This is a test error for the Error Boundary!')
  }

  return (
    <div>
      <PageHeader 
        title="Admin Panel"
        subtitle="Manage game data and generate AI embeddings"
      />
      
      {/* Import Section */}
      <ContentCard className="mb-8">
        <h2 className="section-header">📥 Import Game Data</h2>
        <p className="text-section-description">Import races, classes, and spells to the database</p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <div className="btn-container-col-flex">
            <button
              className="btn-primary w-full"
              onClick={() => handleImport('races')}
              disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
            >
              {importRacesMutation.isPending ? '⏳ Importing...' : '🐉 Import Races'}
            </button>
          </div>

          <div className="btn-container-col-flex">
            <button
              className="btn-primary w-full"
              onClick={() => handleImport('classes')}
              disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
            >
              {importClassesMutation.isPending ? '⏳ Importing...' : '⚔️ Import Classes'}
            </button>
          </div>

          <div className="btn-container-col-flex">
            <button
              className="btn-primary w-full"
              onClick={() => handleImport('spells')}
              disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
            >
              {importSpellsMutation.isPending ? '⏳ Importing...' : '✨ Import Spells'}
            </button>
          </div>
        </div>
      </ContentCard>

      {/* Embeddings Section */}
      <ContentCard className="mb-8">
        <h2 className="section-header">🧠 Generate Embeddings</h2>
        <p className="text-section-description">Generate AI embeddings for semantic search</p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <div className="btn-container-col-flex">
            <button
              className="btn-primary w-full"
              onClick={() => handleEmbed('races')}
              disabled={embeddingLoading.races}
            >
              {embeddingLoading.races ? '🧠 Generating...' : '🧠 Embed Races'}
            </button>
            {embeddingProgress.races && (
              <div className="btn-container-col-full">
                <div className="progress-bar">
                  <div className="progress-fill bg-blue-500" style={{ width: `${embeddingProgress.races.percentageComplete}%` }}></div>
                </div>
                <div className="progress-text">{embeddingProgress.races.message}</div>
              </div>
            )}
          </div>

          <div className="btn-container-col-flex">
            <button
              className="btn-primary w-full"
              onClick={() => handleEmbed('classes')}
              disabled={embeddingLoading.classes}
            >
              {embeddingLoading.classes ? '🧠 Generating...' : '🧠 Embed Classes'}
            </button>
            {embeddingProgress.classes && (
              <div className="btn-container-col-full">
                <div className="progress-bar">
                  <div className="progress-fill bg-blue-500" style={{ width: `${embeddingProgress.classes.percentageComplete}%` }}></div>
                </div>
                <div className="progress-text">{embeddingProgress.classes.message}</div>
              </div>
            )}
          </div>

          <div className="btn-container-col-flex">
            <button
              className="btn-primary w-full"
              onClick={() => handleEmbed('spells')}
              disabled={embeddingLoading.spells}
            >
              {embeddingLoading.spells ? '🧠 Generating...' : '🧠 Embed Spells'}
            </button>
            {embeddingProgress.spells && (
              <div className="btn-container-col-full">
                <div className="progress-bar">
                  <div className="progress-fill bg-blue-500" style={{ width: `${embeddingProgress.spells.percentageComplete}%` }}></div>
                </div>
                <div className="progress-text">{embeddingProgress.spells.message}</div>
              </div>
            )}
          </div>
        </div>
      </ContentCard>

      {/* Testing Section */}
      <ContentCard className="mb-8">
        <h2 className="section-header">🧪 Error Handling Tests</h2>
        <p className="text-section-description">Test the error handling and toast notification system</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button className="btn-small-light-green" onClick={testSuccessToast}>
            ✅ Test Success Toast
          </button>
          <button className="btn-small-light-red" onClick={testErrorToast}>
            ❌ Test Error Toast
          </button>
          <button className="btn-small-light-amber" onClick={testWarningToast}>
            ⚠️ Test Warning Toast
          </button>
          <button className="btn-small-light-blue" onClick={testInfoToast}>
            ℹ️ Test Info Toast
          </button>
          <button className="btn-small-light-indigo" onClick={testPersistentToast}>
            📌 Test Persistent Toast
          </button>
          <button className="btn-small-light-pink" onClick={testThrowError}>
            💥 Test Error Boundary
          </button>
        </div>
      </ContentCard>

      {/* Information Section */}
      <ContentCard>
        <h3 className="section-header">ℹ️ Import Information</h3>
        <ul className="list-none p-0 space-y-3">
          <li className="text-gray-600 leading-relaxed"><strong className="text-gray-800">Races:</strong> Import fantasy races with descriptions and stats</li>
          <li className="text-gray-600 leading-relaxed"><strong className="text-gray-800">Classes:</strong> Import character classes and their properties</li>
          <li className="text-gray-600 leading-relaxed"><strong className="text-gray-800">Spells:</strong> Import spells with mana costs and descriptions</li>
        </ul>
      </ContentCard>
    </div>
  )
}
