import * as admin from 'firebase-admin'

admin.initializeApp()

export { approveSubmission } from './approveSubmission'
export { getUserEmails } from './getUserEmails'
export { rejectSubmission } from './rejectSubmission'
export { serveGif } from './serveGif'
export { submitAnimation } from './submitAnimation'
