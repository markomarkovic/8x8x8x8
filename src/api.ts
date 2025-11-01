import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

const submitAnimationFn = httpsCallable(functions, 'submitAnimation')
const approveSubmissionFn = httpsCallable(functions, 'approveSubmission')
const rejectSubmissionFn = httpsCallable(functions, 'rejectSubmission')
const getUserEmailsFn = httpsCallable(functions, 'getUserEmails')

export async function submitAnimation(animationData: string): Promise<string> {
  const result = await submitAnimationFn({ animationData })
  const data = result.data as { submissionId: string }
  return data.submissionId
}

export async function approveSubmission(submissionId: string): Promise<void> {
  await approveSubmissionFn({ submissionId })
}

export async function rejectSubmission(submissionId: string): Promise<void> {
  await rejectSubmissionFn({ submissionId })
}

export async function getUserEmails(
  userIds: string[]
): Promise<Record<string, string>> {
  const result = await getUserEmailsFn({ userIds })
  const data = result.data as { emailMap: Record<string, string> }
  return data.emailMap
}
