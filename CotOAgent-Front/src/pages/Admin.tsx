import { useState } from 'react'
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

export default function Admin() {
  const [loading, setLoading] = useState<'races' | 'classes' | 'spells' | null>(null)
  const [embeddingLoading, setEmbeddingLoading] = useState<'races' | null>(null)
  const [results, setResults] = useState<{
    races?: ImportResult
    classes?: ImportResult
    spells?: ImportResult
  }>({})
  const [embeddingResults, setEmbeddingResults] = useState<{
    races?: EmbeddingResult
  }>({})
  const [error, setError] = useState<string | null>(null)

  // Determine the backend API URL based on the current environment
  const getBackendUrl = () => {
    // In production, use the same domain with /api path (routed through ingress)
    if (window.location.protocol === 'https:') {
      return `https://${window.location.hostname}/api`
    }
    // In development, use localhost:3000/api
    return 'http://localhost:3000/api'
  }

  const handleImport = async (type: 'races' | 'classes' | 'spells') => {
    setLoading(type)
    setError(null)
    
    try {
      const baseUrl = getBackendUrl()
      const apiUrl = `${baseUrl}/import/${type}`
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      if (response.ok) {
        setResults(prev => ({
          ...prev,
          [type]: {
            success: true,
            message: `Successfully imported ${data.savedToDatabase} ${type}`,
            savedCount: data.savedToDatabase
          }
        }))
      } else {
        setError(`Failed to import ${type}: ${data.error}`)
        setResults(prev => ({
          ...prev,
          [type]: {
            success: false,
            message: `Failed to import ${type}`
          }
        }))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
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

  const handleEmbedRaces = async () => {
    setEmbeddingLoading('races')
    setError(null)
    
    try {
      const baseUrl = getBackendUrl()
      const apiUrl = `${baseUrl}/embeddings/races/generate`
      const response = await fetch(apiUrl, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok || response.status === 202) {
        setEmbeddingResults(prev => ({
          ...prev,
          races: {
            success: true,
            message: data.message || 'Embedding generation started in the background',
            status: data.status
          }
        }))
      } else {
        setError(`Failed to generate embeddings: ${data.error}`)
        setEmbeddingResults(prev => ({
          ...prev,
          races: {
            success: false,
            message: `Failed to generate embeddings`
          }
        }))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Error generating embeddings: ${errorMessage}`)
      setEmbeddingResults(prev => ({
        ...prev,
        races: {
          success: false,
          message: `Error: ${errorMessage}`
        }
      }))
    } finally {
      setEmbeddingLoading(null)
    }
  }

  const handleCheckEmbeddingStatus = async () => {
    try {
      const baseUrl = getBackendUrl()
      const apiUrl = `${baseUrl}/embeddings/races/status`
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      setEmbeddingResults(prev => ({
        ...prev,
        races: {
          success: true,
          message: `Status: ${data.withEmbeddings}/${data.total} races embedded (${data.percentageComplete}%)`,
          status: 'status'
        }
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Error checking status: ${errorMessage}`)
    }
  }

  const handleListRaces = async () => {
    try {
      const baseUrl = getBackendUrl()
      const apiUrl = `${baseUrl}/embeddings/races/list`
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      console.log('Races list:', data)
      alert(`Found ${data.total} races. Check console for details.`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Error listing races: ${errorMessage}`)
    }
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
            disabled={loading !== null || embeddingLoading !== null}
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
            disabled={loading !== null || embeddingLoading !== null}
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
            disabled={loading !== null || embeddingLoading !== null}
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
              onClick={handleEmbedRaces}
              disabled={embeddingLoading !== null || loading !== null}
            >
              {embeddingLoading === 'races' ? '🧠 Generating...' : '🧠 Embed Races'}
            </button>
            {embeddingResults.races && (
              <div className={`result-message ${embeddingResults.races.success ? 'success' : 'error'}`}>
                {embeddingResults.races.message}
              </div>
            )}
          </div>
        </div>

        <div className="debug-section">
          <h3>Debug Tools</h3>
          <div className="debug-buttons-container">
            <button
              className="debug-button"
              onClick={handleCheckEmbeddingStatus}
              disabled={loading !== null || embeddingLoading !== null}
            >
              📊 Check Status
            </button>
            <button
              className="debug-button"
              onClick={handleListRaces}
              disabled={loading !== null || embeddingLoading !== null}
            >
              📋 List Races
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

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
