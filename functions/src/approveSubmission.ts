import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

async function isAdmin(uid: string): Promise<boolean> {
  const db = admin.firestore()
  const adminDoc = await db.collection('admins').doc(uid).get()
  return adminDoc.exists
}

export const approveSubmission = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!(await isAdmin(request.auth.uid))) {
    throw new HttpsError(
      'permission-denied',
      'Only admin can approve submissions'
    )
  }

  const { submissionId } = request.data

  if (!submissionId || typeof submissionId !== 'string') {
    throw new HttpsError(
      'invalid-argument',
      'submissionId must be a non-empty string'
    )
  }

  const db = admin.firestore()
  const submissionRef = db.collection('submissions').doc(submissionId)

  const submissionDoc = await submissionRef.get()

  if (!submissionDoc.exists) {
    throw new HttpsError('not-found', 'Submission not found')
  }

  const submission = submissionDoc.data()

  if (!submission) {
    throw new HttpsError('internal', 'Failed to read submission data')
  }

  if (submission.status !== 'pending') {
    throw new HttpsError(
      'failed-precondition',
      `Submission is already ${submission.status}`
    )
  }

  await db.collection('gallery').add({
    userId: submission.userId,
    animationData: submission.animationData,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    approvedBy: request.auth.uid,
  })

  await submissionRef.update({
    status: 'approved',
  })

  return { success: true }
})
