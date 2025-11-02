import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

async function isAdmin(uid: string): Promise<boolean> {
  const db = admin.firestore()
  const adminDoc = await db.collection('admins').doc(uid).get()
  return adminDoc.exists
}

export const getUserEmails = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!(await isAdmin(request.auth.uid))) {
    throw new HttpsError(
      'permission-denied',
      'Only admins can access user emails'
    )
  }

  const { userIds } = request.data

  if (!userIds || !Array.isArray(userIds)) {
    throw new HttpsError(
      'invalid-argument',
      'userIds must be an array of user IDs'
    )
  }

  try {
    const users = await admin.auth().getUsers(userIds.map((uid) => ({ uid })))

    const emailMap: Record<string, string> = {}
    users.users.forEach((user) => {
      emailMap[user.uid] = user.email || 'unknown'
    })

    return { emailMap }
  } catch (error) {
    throw new HttpsError('internal', 'Failed to fetch user emails')
  }
})
