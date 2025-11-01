import { useState } from 'preact/hooks'

type SubmitButtonProps = {
  disabled: boolean
  onSubmit: () => Promise<void>
}

export function SubmitButton({ disabled, onSubmit }: SubmitButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string>('')

  const handleClick = async () => {
    if (disabled || isSubmitting) return

    setIsSubmitting(true)
    setMessage('')

    try {
      await onSubmit()
      setMessage('Submitted successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Submission failed'
      setMessage(errorMessage)
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="submit-container">
      <button
        className="submit-button"
        onClick={handleClick}
        disabled={disabled || isSubmitting}
        title={
          disabled
            ? 'You have 8 pending submissions'
            : isSubmitting
              ? 'Submitting...'
              : 'Submit to gallery'
        }
      >
        {isSubmitting ? '...' : 'Submit'}
      </button>
      {message && <div className="submit-message">{message}</div>}
    </div>
  )
}
