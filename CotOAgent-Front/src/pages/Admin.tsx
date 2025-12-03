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
  const [embeddingLoading, setEmbeddingLoading] = useState<'races' | 'classes' | 'spells' | null>(null)
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
    setEmbeddingLoading(type)
    
    const response = await fetch(`/api/embeddings/${type}/generate`, {
      method: 'POST'
    })

    if (response.status === 409) {
      const data = await response.json()
      addToast(data.error || 'Embeddings already exist', 'warning')
      setEmbeddingLoading(null)
      return
    }

    if (!response.ok || !response.body) {
      const data = await response.json()
      addToast(data.error || 'Failed to start embedding generation', 'error')
      setEmbeddingLoading(null)
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
      setEmbeddingLoading(null)
      setEmbeddingProgress(prev => ({
        ...prev,
        [type]: undefined
      }))
      addToast(`Embedding generation completed for ${type}!`, 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during streaming'
      addToast(`Error generating embeddings: ${errorMessage}`, 'error')
      setEmbeddingLoading(null)
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
            className="w-full px-8 py-4 bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-bold rounded-lg cursor-pointer transition-all shadow-md hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => handleImport('races')}
            disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
          >
            {importRacesMutation.isPending ? '⏳ Importing...' : '🐉 Import Races'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
          <button
            className="w-full px-8 py-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold rounded-lg cursor-pointer transition-all shadow-md hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => handleImport('classes')}
            disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
          >
            {importClassesMutation.isPending ? '⏳ Importing...' : '⚔️ Import Classes'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
          <button
            className="w-full px-8 py-4 bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold rounded-lg cursor-pointer transition-all shadow-md hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="w-full px-8 py-4 bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-bold rounded-lg cursor-pointer transition-all shadow-md hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleEmbed('races')}
              disabled={embeddingLoading !== null}
            >
              {embeddingLoading === 'races' ? '🧠 Generating...' : '🧠 Embed Races'}
            </button>
            {embeddingProgress.races && (
              <div className="flex flex-col gap-2 w-full">
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-700 transition-all rounded-full" style={{ width: `${embeddingProgress.races.percentageComplete}%` }}></div>
                </div>
                <div className="text-sm text-gray-600 text-center font-medium">{embeddingProgress.races.message}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
            <button
              className="w-full px-8 py-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold rounded-lg cursor-pointer transition-all shadow-md hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleEmbed('classes')}
              disabled={embeddingLoading !== null}
            >
              {embeddingLoading === 'classes' ? '🧠 Generating...' : '🧠 Embed Classes'}
            </button>
            {embeddingProgress.classes && (
              <div className="flex flex-col gap-2 w-full">
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all rounded-full" style={{ width: `${embeddingProgress.classes.percentageComplete}%` }}></div>
                </div>
                <div className="text-sm text-gray-600 text-center font-medium">{embeddingProgress.classes.message}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 flex-1 min-w-64 max-w-xs">
            <button
              className="w-full px-8 py-4 bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold rounded-lg cursor-pointer transition-all shadow-md hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleEmbed('spells')}
              disabled={embeddingLoading !== null}
            >
              {embeddingLoading === 'spells' ? '🧠 Generating...' : '🧠 Embed Spells'}
            </button>
            {embeddingProgress.spells && (
              <div className="flex flex-col gap-2 w-full">
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all rounded-full" style={{ width: `${embeddingProgress.spells.percentageComplete}%` }}></div>
                </div>
                <div className="text-sm text-gray-600 text-center font-medium">{embeddingProgress.spells.message}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="my-12 p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg">
        <h2 className="m-0 mb-2 text-gray-800 text-3xl text-center">🧪 Error Handling Tests</h2>
        <p className="text-center text-gray-600 text-sm mb-6 mt-0">Test the error handling and toast notification system</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <button className="px-5 py-3 text-sm font-bold rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 bg-emerald-500 text-white border-2 border-emerald-600" onClick={testSuccessToast}>
            ✅ Test Success Toast
          </button>
          <button className="px-5 py-3 text-sm font-bold rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 bg-red-500 text-white border-2 border-red-600" onClick={testErrorToast}>
            ❌ Test Error Toast
          </button>
          <button className="px-5 py-3 text-sm font-bold rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 bg-amber-500 text-white border-2 border-amber-600" onClick={testWarningToast}>
            ⚠️ Test Warning Toast
          </button>
          <button className="px-5 py-3 text-sm font-bold rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 bg-blue-500 text-white border-2 border-blue-600" onClick={testInfoToast}>
            ℹ️ Test Info Toast
          </button>
          <button className="px-5 py-3 text-sm font-bold rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 bg-violet-500 text-white border-2 border-violet-600" onClick={testPersistentToast}>
            📌 Test Persistent Toast
          </button>
          <button className="px-5 py-3 text-sm font-bold rounded-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 bg-pink-500 text-white border-2 border-pink-600" onClick={testThrowError}>
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
