import type { Submission } from '../types'

type QueueItemProps = {
  submission: Submission | null
}

function QueueItem({ submission }: QueueItemProps) {
  if (!submission) {
    return <div className="queue-item queue-item-empty" />
  }

  const gifUrl = `/gifs/${submission.animationData}.gif`
  const statusClass = `queue-item-${submission.status}`

  return (
    <div className={`queue-item ${statusClass}`} title={submission.status}>
      <a href={`#${submission.animationData}`}>
        <img src={gifUrl} alt={`Submission ${submission.status}`} />
      </a>
    </div>
  )
}

type MyQueueProps = {
  submissions: Submission[]
}

export function MyQueue({ submissions }: MyQueueProps) {
  // Separate pending from approved/rejected
  const pending = submissions.filter(s => s.status === 'pending')
  const completed = submissions.filter(
    s => s.status === 'approved' || s.status === 'rejected'
  )

  // Create 8 slots for pending (fill remaining with null for empty slots)
  const pendingSlots: (Submission | null)[] = Array(8)
    .fill(null)
    .map((_, i) => pending[i] || null)

  // Combine pending slots with all completed submissions
  const allSlots = [...pendingSlots, ...completed]

  return (
    <div className="my-queue">
      {allSlots.map((submission, index) => (
        <QueueItem
          key={submission?.id || `empty-${index}`}
          submission={submission}
        />
      ))}
    </div>
  )
}
