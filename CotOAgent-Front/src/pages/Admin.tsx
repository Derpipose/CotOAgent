import { useState } from 'react'
import '../css/admin.css'

interface ImportResult {
  success: boolean
  message: string
  savedCount?: number
}

export default function Admin() {
  const [loading, setLoading] = useState<'races' | 'classes' | 'spells' | null>(null)
  const [results, setResults] = useState<{
    races?: ImportResult
    classes?: ImportResult
    spells?: ImportResult
  }>({})
  const [error, setError] = useState<string | null>(null)

  const handleImport = async (type: 'races' | 'classes' | 'spells') => {
    setLoading(type)
    setError(null)
    
    try {
      const apiUrl = `http://localhost:3000/api/import/${type}`
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
