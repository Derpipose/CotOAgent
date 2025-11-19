import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import '../css/admin.css'

interface ImportResult {
  success: boolean
  message: string
  savedCount?: number
}

interface EmbeddingResult {
  success: boolean
  message: string
  status?: string
}

interface EmbeddingProgress {
  completed: number
  total: number
  failed: number
  percentageComplete: number
}

// Utility: Extract error message
const getErrorMessage = (err: unknown): string => {
  return err instanceof Error ? err.message : 'Unknown error'
}

export default function Admin() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState<'races' | 'classes' | 'spells' | null>(null)
  const [embeddingLoading, setEmbeddingLoading] = useState<'races' | 'classes' | 'spells' | null>(null)
  const [embeddingProgress, setEmbeddingProgress] = useState<{
    races?: EmbeddingProgress & { message: string }
    classes?: EmbeddingProgress & { message: string }
    spells?: EmbeddingProgress & { message: string }
  }>({})
  const [results, setResults] = useState<{
    races?: ImportResult
    classes?: ImportResult
    spells?: ImportResult
  }>({})
  const [embeddingResults, setEmbeddingResults] = useState<{
    races?: EmbeddingResult
    classes?: EmbeddingResult
    spells?: EmbeddingResult
  }>({})
  const [error, setError] = useState<string | null>(null)
  const [shouldThrowError, setShouldThrowError] = useState(false)

  const handleImport = async (type: 'races' | 'classes' | 'spells') => {
    setLoading(type)
    setError(null)
    
    try {
      const response = await fetch(`/api/import/${type}`)
      const data = await response.json()
      
      const success = response.ok
      setResults(prev => ({
        ...prev,
        [type]: {
          success,
          message: success 
            ? `Successfully imported ${data.savedToDatabase} ${type}`
            : `Failed to import ${type}`,
          savedCount: data.savedToDatabase
        }
      }))
      if (!success) setError(`Failed to import ${type}: ${data.error}`)
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(`Error importing ${type}: ${errorMessage}`)
      setResults(prev => ({
        ...prev,
        [type]: {
          success: false,
          message: `Error: ${errorMessage}`
        }
      }))
    } finally {
      setLoading(null)
    }
  }

  const handleEmbed = async (type: 'races' | 'classes' | 'spells') => {
    setEmbeddingLoading(type)
    setError(null)
    setEmbeddingResults(prev => ({
      ...prev,
      [type]: {
        success: true,
        message: 'Connecting to embedding stream...'
      }
    }))
    
    try {
      const response = await fetch(`/api/embeddings/${type}/generate`, {
        method: 'POST'
      })

      if (response.status === 409) {
        const data = await response.json()
        setError(data.error)
        setEmbeddingResults(prev => ({
          ...prev,
          [type]: {
            success: false,
            message: data.error
          }
        }))
        setEmbeddingLoading(null)
        return
      }

      if (!response.ok || !response.body) {
        const data = await response.json()
        setError(data.error || 'Failed to start embedding generation')
        setEmbeddingResults(prev => ({
          ...prev,
          [type]: {
            success: false,
            message: data.error || 'Failed to start embedding generation'
          }
        }))
        setEmbeddingLoading(null)
        return
      }

      // Handle SSE stream
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
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'started') {
                setEmbeddingResults(prev => ({
                  ...prev,
                  [type]: {
                    success: true,
                    message: data.message,
                    status: 'processing'
                  }
                }))
              } else if (data.type === 'progress') {
                const progress = data.progress as EmbeddingProgress
                setEmbeddingProgress(prev => ({
                  ...prev,
                  [type]: {
                    ...progress,
                    message: `Processing: ${progress.completed}/${progress.total} (${progress.percentageComplete}%)`
                  }
                }))
                setEmbeddingResults(prev => ({
                  ...prev,
                  [type]: {
                    success: true,
                    message: `Processing: ${progress.completed}/${progress.total} (${progress.percentageComplete}%)`,
                    status: 'processing'
                  }
                }))
              }
            } catch (parseErr) {
              console.error('Failed to parse SSE data:', parseErr)
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
      setEmbeddingResults(prev => ({
        ...prev,
        [type]: {
          success: true,
          message: 'Embedding generation completed!',
          status: 'completed'
        }
      }))
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(`Error generating embeddings: ${errorMessage}`)
      setEmbeddingResults(prev => ({
        ...prev,
        [type]: {
          success: false,
          message: `Error: ${errorMessage}`
        }
      }))
    } finally {
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
    setShouldThrowError(true)
  }

  // This will cause a render error caught by Error Boundary
  if (shouldThrowError) {
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
            disabled={loading !== null}
          >
            {loading === 'races' ? '⏳ Importing...' : '🐉 Import Races'}
          </button>
          {results.races && (
            <div className={`result-message ${results.races.success ? 'success' : 'error'}`}>
              {results.races.message}
            </div>
          )}
        </div>

        <div className="import-button-wrapper">
          <button
            className="import-button import-classes"
            onClick={() => handleImport('classes')}
            disabled={loading !== null}
          >
            {loading === 'classes' ? '⏳ Importing...' : '⚔️ Import Classes'}
          </button>
          {results.classes && (
            <div className={`result-message ${results.classes.success ? 'success' : 'error'}`}>
              {results.classes.message}
            </div>
          )}
        </div>

        <div className="import-button-wrapper">
          <button
            className="import-button import-spells"
            onClick={() => handleImport('spells')}
            disabled={loading !== null}
          >
            {loading === 'spells' ? '⏳ Importing...' : '✨ Import Spells'}
          </button>
          {results.spells && (
            <div className={`result-message ${results.spells.success ? 'success' : 'error'}`}>
              {results.spells.message}
            </div>
          )}
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
            {embeddingResults.races && (
              <div className={`result-message ${embeddingResults.races.success ? 'success' : 'error'}`}>
                {embeddingResults.races.message}
              </div>
            )}
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
            {embeddingResults.classes && (
              <div className={`result-message ${embeddingResults.classes.success ? 'success' : 'error'}`}>
                {embeddingResults.classes.message}
              </div>
            )}
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
            {embeddingResults.spells && (
              <div className={`result-message ${embeddingResults.spells.success ? 'success' : 'error'}`}>
                {embeddingResults.spells.message}
              </div>
            )}
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

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

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
