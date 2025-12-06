import { ContentCard } from '../ContentCard'

interface ErrorTestingSectionProps {
  onTestSuccessToast: () => void
  onTestErrorToast: () => void
  onTestWarningToast: () => void
  onTestInfoToast: () => void
  onTestPersistentToast: () => void
  onTestThrowError: () => void
}

export function ErrorTestingSection({
  onTestSuccessToast,
  onTestErrorToast,
  onTestWarningToast,
  onTestInfoToast,
  onTestPersistentToast,
  onTestThrowError,
}: ErrorTestingSectionProps) {
  return (
    <ContentCard className="mb-8">
      <h2 className="section-header">🧪 Error Handling Tests</h2>
      <p className="text-section-description">Test the error handling and toast notification system</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button className="btn-small-light-green" onClick={onTestSuccessToast}>
          ✅ Test Success Toast
        </button>
        <button className="btn-small-light-red" onClick={onTestErrorToast}>
          ❌ Test Error Toast
        </button>
        <button className="btn-small-light-amber" onClick={onTestWarningToast}>
          ⚠️ Test Warning Toast
        </button>
        <button className="btn-small-light-blue" onClick={onTestInfoToast}>
          ℹ️ Test Info Toast
        </button>
        <button className="btn-small-light-indigo" onClick={onTestPersistentToast}>
          📌 Test Persistent Toast
        </button>
        <button className="btn-small-light-pink" onClick={onTestThrowError}>
          💥 Test Error Boundary
        </button>
      </div>
    </ContentCard>
  )
}
