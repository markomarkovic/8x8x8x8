import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

export const submitAnimation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated to submit animations'
    )
  }

  const { animationData } = request.data

  if (!animationData || typeof animationData !== 'string') {
    throw new HttpsError(
      'invalid-argument',
      'animationData must be a non-empty string'
    )
  }

  const userId = request.auth.uid

  const db = admin.firestore()

  // Check if animation already exists in gallery
  const galleryDuplicate = await db
    .collection('gallery')
    .where('animationData', '==', animationData)
    .limit(1)
    .get()

  if (!galleryDuplicate.empty) {
    throw new HttpsError(
      'already-exists',
      'This animation already exists in the gallery'
    )
  }

  // Check if user already submitted this animation
  const userDuplicate = await db
    .collection('submissions')
    .where('userId', '==', userId)
    .where('animationData', '==', animationData)
    .limit(1)
    .get()

  if (!userDuplicate.empty) {
    throw new HttpsError(
      'already-exists',
      'You have already submitted this animation'
    )
  }

  const pendingSubmissions = await db
    .collection('submissions')
    .where('userId', '==', userId)
    .where('status', '==', 'pending')
    .get()

  if (pendingSubmissions.size >= 8) {
    throw new HttpsError(
      'failed-precondition',
      'You already have 8 pending submissions. Please wait for approval.'
    )
  }

  const submissionRef = await db.collection('submissions').add({
    userId,
    animationData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending',
  })

  return { submissionId: submissionRef.id }
})
