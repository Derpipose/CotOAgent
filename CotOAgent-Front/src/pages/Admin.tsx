import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useMutationApi } from '../hooks/useQueryApi'
import { PageHeader } from '../components/PageHeader'
import {
  ImportDataSection,
  EmbeddingsSection,
  ErrorTestingSection,
  ImportInformationSection,
} from '../components/Admin'

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
      
      <ImportDataSection
        onImport={handleImport}
        importRacesMutation={importRacesMutation}
        importClassesMutation={importClassesMutation}
        importSpellsMutation={importSpellsMutation}
      />

      <EmbeddingsSection
        onEmbed={handleEmbed}
        embeddingLoading={embeddingLoading}
        embeddingProgress={embeddingProgress}
      />

      <ErrorTestingSection
        onTestSuccessToast={testSuccessToast}
        onTestErrorToast={testErrorToast}
        onTestWarningToast={testWarningToast}
        onTestInfoToast={testInfoToast}
        onTestPersistentToast={testPersistentToast}
        onTestThrowError={testThrowError}
      />

      <ImportInformationSection />
    </div>
  )
}
