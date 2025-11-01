import type { Submission } from '../types'

type ApprovalModalProps = {
  submission: Submission
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}

export function ApprovalModal({
  submission,
  onClose,
  onApprove,
  onReject,
}: ApprovalModalProps) {
  const gifUrl = `/gifs/${submission.animationData}.gif`

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h3>Review Submission</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-preview">
            <img src={gifUrl} alt="Submission preview" />
          </div>
          <div className="modal-info">
            <p>
              <strong>Author:</strong> {submission.userEmail || 'Loading...'}
            </p>
            <p>
              <strong>Submitted:</strong> {submission.createdAt.toISOString()}
            </p>
          </div>
        </div>
        <div className="modal-actions">
          <button className="button button-reject" onClick={onReject}>
            Reject
          </button>
          <button className="button button-approve" onClick={onApprove}>
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}
