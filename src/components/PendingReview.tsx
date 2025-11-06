import type { Submission } from '../types'
import { Gallery } from './Gallery'

type PendingReviewProps = {
  submissions: Submission[]
  onSubmissionClick: (submission: Submission) => void
}

export function PendingReview({
  submissions,
  onSubmissionClick,
}: PendingReviewProps) {
  const galleryItems = submissions.map((submission) => ({
    id: submission.id,
    userId: submission.userId,
    userEmail: submission.userEmail,
    animationData: submission.animationData,
    approvedAt: submission.createdAt,
    approvedBy: '',
  }))

  return (
    <Gallery
      items={galleryItems}
      onItemClick={(item) => {
        const submission = submissions.find((s) => s.id === item.id)
        if (submission) {
          onSubmissionClick(submission)
        }
      }}
      highlight
    />
  )
}
