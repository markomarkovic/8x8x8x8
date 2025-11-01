import { signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

type AuthProps = {
  user: User | null
}

export function Auth({ user }: AuthProps) {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (user) {
    return (
      <div className="auth auth-signed-in">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="auth-photo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="auth-photo auth-photo-placeholder">
            {user.displayName?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <span className="auth-name">{user.displayName}</span>
        <button onClick={handleSignOut} className="auth-button">
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="auth auth-signed-out">
      <button onClick={handleSignIn} className="auth-button">
        Sign in with Google
      </button>
    </div>
  )
}
