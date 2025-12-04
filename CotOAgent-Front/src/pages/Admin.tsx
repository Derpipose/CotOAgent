import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useMutationApi } from '../hooks/useQueryApi'

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
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-5xl font-bold text-center mb-2 text-gray-800">Admin Panel</h1>
      <p className="text-center text-gray-500 text-lg mb-8">Import game data to the database</p>
      
      <div className="flex gap-8 justify-center flex-wrap mb-8">
        <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
          <button
            className="btn-primary-gradient w-full"
            onClick={() => handleImport('races')}
            disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
          >
            {importRacesMutation.isPending ? '⏳ Importing...' : '🐉 Import Races'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
          <button
            className="btn-secondary-gradient w-full"
            onClick={() => handleImport('classes')}
            disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
          >
            {importClassesMutation.isPending ? '⏳ Importing...' : '⚔️ Import Classes'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
          <button
            className="btn-cyan-gradient w-full"
            onClick={() => handleImport('spells')}
            disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
          >
            {importSpellsMutation.isPending ? '⏳ Importing...' : '✨ Import Spells'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-blue-700 m-0 mb-2">Generate Embeddings</h2>
        <p className="text-center text-blue-600 text-base mb-6 mt-0">Generate AI embeddings for semantic search</p>
        
        <div className="flex gap-8 justify-center flex-wrap">
          <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
            <button
              className="btn-primary-gradient w-full"
              onClick={() => handleEmbed('races')}
              disabled={embeddingLoading.races}
            >
              {embeddingLoading.races ? '🧠 Generating...' : '🧠 Embed Races'}
            </button>
            {embeddingProgress.races && (
              <div className="flex flex-col gap-2 w-full">
                <div className="progress-bar">
                  <div className="progress-fill bg-gradient-to-r from-indigo-600 to-violet-700" style={{ width: `${embeddingProgress.races.percentageComplete}%` }}></div>
                </div>
                <div className="progress-text">{embeddingProgress.races.message}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
            <button
              className="btn-secondary-gradient w-full"
              onClick={() => handleEmbed('classes')}
              disabled={embeddingLoading.classes}
            >
              {embeddingLoading.classes ? '🧠 Generating...' : '🧠 Embed Classes'}
            </button>
            {embeddingProgress.classes && (
              <div className="flex flex-col gap-2 w-full">
                <div className="progress-bar">
                  <div className="progress-fill bg-gradient-to-r from-pink-500 to-rose-600" style={{ width: `${embeddingProgress.classes.percentageComplete}%` }}></div>
                </div>
                <div className="progress-text">{embeddingProgress.classes.message}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
            <button
              className="btn-cyan-gradient w-full"
              onClick={() => handleEmbed('spells')}
              disabled={embeddingLoading.spells}
            >
              {embeddingLoading.spells ? '🧠 Generating...' : '🧠 Embed Spells'}
            </button>
            {embeddingProgress.spells && (
              <div className="flex flex-col gap-2 w-full">
                <div className="progress-bar">
                  <div className="progress-fill bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${embeddingProgress.spells.percentageComplete}%` }}></div>
                </div>
                <div className="progress-text">{embeddingProgress.spells.message}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-elevated my-12">
        <h2 className="section-header">🧪 Error Handling Tests</h2>
        <p className="text-center text-gray-600 text-sm mb-6">Test the error handling and toast notification system</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <button className="btn-small bg-emerald-500 text-white border-2 border-emerald-600" onClick={testSuccessToast}>
            ✅ Test Success Toast
          </button>
          <button className="btn-small bg-red-500 text-white border-2 border-red-600" onClick={testErrorToast}>
            ❌ Test Error Toast
          </button>
          <button className="btn-small bg-amber-500 text-white border-2 border-amber-600" onClick={testWarningToast}>
            ⚠️ Test Warning Toast
          </button>
          <button className="btn-small bg-blue-500 text-white border-2 border-blue-600" onClick={testInfoToast}>
            ℹ️ Test Info Toast
          </button>
          <button className="btn-small bg-violet-500 text-white border-2 border-violet-600" onClick={testPersistentToast}>
            📌 Test Persistent Toast
          </button>
          <button className="btn-small bg-pink-500 text-white border-2 border-pink-600" onClick={testThrowError}>
            💥 Test Error Boundary
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mt-8">
        <h3 className="mt-0 text-gray-800 text-xl">Import Information</h3>
        <ul className="list-none p-0">
          <li className="py-2 text-gray-600 leading-relaxed"><strong className="text-gray-800">Races:</strong> Import fantasy races with descriptions and stats</li>
          <li className="py-2 text-gray-600 leading-relaxed"><strong className="text-gray-800">Classes:</strong> Import character classes and their properties</li>
          <li className="py-2 text-gray-600 leading-relaxed"><strong className="text-gray-800">Spells:</strong> Import spells with mana costs and descriptions</li>
        </ul>
      </div>
    </div>
  )
}
