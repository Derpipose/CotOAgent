import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useMutationApi } from '../hooks/useQueryApi'
import '../css/admin.css'

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
    showSuccess: true,
    successMessage: 'Successfully imported races',
    showError: true,
    errorMessage: 'Failed to import races',
  })

  const importClassesMutation = useMutationApi<{ savedToDatabase: number }>({
    showSuccess: true,
    successMessage: 'Successfully imported classes',
    showError: true,
    errorMessage: 'Failed to import classes',
  })

  const importSpellsMutation = useMutationApi<{ savedToDatabase: number }>({
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
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <p className="admin-subtitle">Import game data to the database</p>
      
      <div className="import-buttons-container">
        <div className="import-button-wrapper">
          <button
            className="import-button import-races"
            onClick={() => handleImport('races')}
            disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
          >
            {importRacesMutation.isPending ? '⏳ Importing...' : '🐉 Import Races'}
          </button>
        </div>

        <div className="import-button-wrapper">
          <button
            className="import-button import-classes"
            onClick={() => handleImport('classes')}
            disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
          >
            {importClassesMutation.isPending ? '⏳ Importing...' : '⚔️ Import Classes'}
          </button>
        </div>

        <div className="import-button-wrapper">
          <button
            className="import-button import-spells"
            onClick={() => handleImport('spells')}
            disabled={importRacesMutation.isPending || importClassesMutation.isPending || importSpellsMutation.isPending}
          >
            {importSpellsMutation.isPending ? '⏳ Importing...' : '✨ Import Spells'}
          </button>
        </div>
      </div>

      <div className="embeddings-section">
        <h2>Generate Embeddings</h2>
        <p className="embeddings-subtitle">Generate AI embeddings for semantic search</p>
        
        <div className="embeddings-buttons-container">
          <div className="embed-button-wrapper">
            <button
              className="embed-button embed-races"
              onClick={() => handleEmbed('races')}
            >
              {embeddingLoading === 'races' ? '🧠 Generating...' : '🧠 Embed Races'}
            </button>
            {embeddingProgress.races && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${embeddingProgress.races.percentageComplete}%` }}></div>
                </div>
                <div className="progress-text">{embeddingProgress.races.message}</div>
              </div>
            )}
          </div>

          <div className="embed-button-wrapper">
            <button
              className="embed-button embed-classes"
              onClick={() => handleEmbed('classes')}
            >
              {embeddingLoading === 'classes' ? '🧠 Generating...' : '🧠 Embed Classes'}
            </button>
            {embeddingProgress.classes && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${embeddingProgress.classes.percentageComplete}%` }}></div>
                </div>
                <div className="progress-text">{embeddingProgress.classes.message}</div>
              </div>
            )}
          </div>

          <div className="embed-button-wrapper">
            <button
              className="embed-button embed-spells"
              onClick={() => handleEmbed('spells')}
            >
              {embeddingLoading === 'spells' ? '🧠 Generating...' : '🧠 Embed Spells'}
            </button>
            {embeddingProgress.spells && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${embeddingProgress.spells.percentageComplete}%` }}></div>
                </div>
                <div className="progress-text">{embeddingProgress.spells.message}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="test-section">
        <h2>🧪 Error Handling Tests</h2>
        <p className="test-subtitle">Test the error handling and toast notification system</p>
        
        <div className="test-buttons-container">
          <button className="test-button success-test" onClick={testSuccessToast}>
            ✅ Test Success Toast
          </button>
          <button className="test-button error-test" onClick={testErrorToast}>
            ❌ Test Error Toast
          </button>
          <button className="test-button warning-test" onClick={testWarningToast}>
            ⚠️ Test Warning Toast
          </button>
          <button className="test-button info-test" onClick={testInfoToast}>
            ℹ️ Test Info Toast
          </button>
          <button className="test-button persistent-test" onClick={testPersistentToast}>
            📌 Test Persistent Toast
          </button>
          <button className="test-button error-boundary-test" onClick={testThrowError}>
            💥 Test Error Boundary
          </button>
        </div>
      </div>

      <div className="info-section">
        <h3>Import Information</h3>
        <ul>
          <li><strong>Races:</strong> Import fantasy races with descriptions and stats</li>
          <li><strong>Classes:</strong> Import character classes and their properties</li>
          <li><strong>Spells:</strong> Import spells with mana costs and descriptions</li>
        </ul>
      </div>
    </div>
  )
}
