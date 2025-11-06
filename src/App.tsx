import { onAuthStateChanged, type User } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import { useEffect, useRef, useState } from 'preact/hooks'
import {
  approveSubmission,
  getUserEmails,
  rejectSubmission,
  submitAnimation,
} from './api'
import { ApprovalModal } from './components/ApprovalModal'
import { Auth } from './components/Auth'
import { FrameSelector } from './components/FrameSelector'
import { Gallery } from './components/Gallery'
import { Grid } from './components/Grid'
import { InfoButton } from './components/InfoButton'
import { InfoModal } from './components/InfoModal'
import { MyQueue } from './components/MyQueue'
import { Palette } from './components/Palette'
import { PendingReview } from './components/PendingReview'
import { Preview } from './components/Preview'
import { SubmitButton } from './components/SubmitButton'
import {
  decodeState,
  getInitialState,
  getPendingDecodedState,
  updateURL,
} from './encoding'
import { startFaviconAnimation } from './favicon'
import { auth, db } from './firebase'
import type {
  AppState,
  ColorIndex,
  Frame,
  GalleryItem,
  Palette as PaletteType,
  Submission,
} from './types'

export const App = () => {
  const [state, setState] = useState<AppState>(getInitialState)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([])
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [clipboard, setClipboard] = useState<Frame | null>(null)
  const isInitialLoadRef = useRef(true)

  const userIsAdmin = isAdmin
  const pendingCount = mySubmissions.filter(
    (s) => s.status === 'pending'
  ).length

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      // Check if user is admin
      if (currentUser) {
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid))
        setIsAdmin(adminDoc.exists())

        // Expose UID in console for easy access during setup
        console.log('Your Firebase UID:', currentUser.uid)
        console.log('Is Admin:', adminDoc.exists())
      } else {
        setIsAdmin(false)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) {
      setMySubmissions([])
      return
    }

    const q = query(
      collection(db, 'submissions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const submissions: Submission[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        animationData: doc.data().animationData,
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        status: doc.data().status,
      }))
      setMySubmissions(submissions)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    if (!userIsAdmin) {
      setPendingSubmissions([])
      return
    }

    const q = query(
      collection(db, 'submissions'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const submissions: Submission[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        animationData: doc.data().animationData,
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        status: doc.data().status,
      }))

      // Fetch emails for all users if admin
      if (submissions.length > 0) {
        try {
          const userIds = [...new Set(submissions.map((s) => s.userId))]
          const emailMap = await getUserEmails(userIds)

          // Attach emails to submissions
          submissions.forEach((submission) => {
            submission.userEmail = emailMap[submission.userId] || 'unknown'
          })
        } catch (error) {
          console.error('Failed to fetch user emails:', error)
        }
      }

      setPendingSubmissions(submissions)
    })

    return unsubscribe
  }, [userIsAdmin])

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('approvedAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: GalleryItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        animationData: doc.data().animationData,
        approvedAt: (doc.data().approvedAt as Timestamp).toDate(),
        approvedBy: doc.data().approvedBy,
      }))
      setGalleryItems(items)
    })

    return unsubscribe
  }, [])

  // Update URL when state changes (skip initial load to prevent overwriting compressed URLs)
  useEffect(() => {
    if (isInitialLoadRef.current) {
      return
    }
    updateURL(state)
  }, [state])

  // Update favicon animation when frames or palette change
  useEffect(() => {
    startFaviconAnimation(state.frames, state.palette)
  }, [state.frames, state.palette])

  // Listen for hash changes from external URL updates
  useEffect(() => {
    const mergeDecodedState = (newState: AppState | null) => {
      if (newState) {
        setState((prevState) => ({
          ...newState,
          selectedColorIndex: prevState.selectedColorIndex,
          currentFrameIndex: prevState.currentFrameIndex,
        }))
        // Mark initial load as complete after successfully loading state from URL
        isInitialLoadRef.current = false
      }
    }

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        const decodedState = decodeState(hash)
        mergeDecodedState(decodedState)
      }
    }

    const handleStateDecompressed = () => {
      const pendingState = getPendingDecodedState()
      mergeDecodedState(pendingState)
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('statedecompressed', handleStateDecompressed)

    // Check if there's already a pending decompressed state from initial load
    const pendingState = getPendingDecodedState()
    if (pendingState) {
      setState(pendingState)
      isInitialLoadRef.current = false
    } else if (!window.location.hash) {
      // No URL hash means we're starting fresh - mark initial load complete
      isInitialLoadRef.current = false
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('statedecompressed', handleStateDecompressed)
    }
  }, [])

  // Handle copy/paste keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+C or Cmd+C (copy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // Don't prevent default if there's actual text selected (allow normal copy)
        const selection = window.getSelection()
        const hasTextSelected =
          selection && !selection.isCollapsed && selection.toString().length > 0
        if (hasTextSelected) {
          return
        }

        // Copy current frame to clipboard
        e.preventDefault()
        const currentFrame = state.frames[state.currentFrameIndex]
        setClipboard([...currentFrame] as Frame)
      }

      // Check for Ctrl+V or Cmd+V (paste)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Don't prevent default if we're focused on an input element
        const target = e.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }

        if (clipboard) {
          e.preventDefault()
          setState((prevState) => {
            const newFrames = [...prevState.frames]
            newFrames[prevState.currentFrameIndex] = [...clipboard] as Frame
            return {
              ...prevState,
              frames: newFrames as typeof prevState.frames,
            }
          })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.frames, state.currentFrameIndex, clipboard])

  const handlePixelClick = (pixelIndex: number) => {
    setState((prevState) => {
      const newFrames = [...prevState.frames]
      const newFrame = [...newFrames[prevState.currentFrameIndex]]
      newFrame[pixelIndex] = prevState.selectedColorIndex
      newFrames[prevState.currentFrameIndex] = newFrame
      return { ...prevState, frames: newFrames as typeof prevState.frames }
    })
  }

  const handleColorSelect = (index: ColorIndex) => {
    setState((prevState) => ({ ...prevState, selectedColorIndex: index }))
  }

  const handleColorChange = (index: ColorIndex, newColor: string) => {
    setState((prevState) => {
      const newPalette = [...prevState.palette] as PaletteType
      newPalette[index] = newColor
      return { ...prevState, palette: newPalette }
    })
  }

  const handleFrameSelect = (index: ColorIndex) => {
    setState((prevState) => ({ ...prevState, currentFrameIndex: index }))
  }

  const handleSubmit = async () => {
    const currentHash = window.location.hash.slice(1)
    if (!currentHash) {
      throw new Error('No animation data to submit')
    }
    await submitAnimation(currentHash)
  }

  const handleApprove = async () => {
    if (!selectedSubmission) return
    await approveSubmission(selectedSubmission.id)
    setSelectedSubmission(null)
  }

  const handleReject = async () => {
    if (!selectedSubmission) return
    await rejectSubmission(selectedSubmission.id)
    setSelectedSubmission(null)
  }

  return (
    <>
      <Auth user={user} />
      <div className="main-grid">
        <div className="left-column">
          <Grid
            frame={state.frames[state.currentFrameIndex]}
            palette={state.palette}
            selectedColorIndex={state.selectedColorIndex}
            onPixelClick={handlePixelClick}
          />
          <FrameSelector
            frames={state.frames}
            palette={state.palette}
            currentFrameIndex={state.currentFrameIndex}
            onFrameSelect={handleFrameSelect}
          />
          {user && <MyQueue submissions={mySubmissions} />}
        </div>
        <div className="right-column">
          <Palette
            palette={state.palette}
            selectedColorIndex={state.selectedColorIndex}
            onColorSelect={handleColorSelect}
            onColorChange={handleColorChange}
          />
          <Preview frames={state.frames} palette={state.palette} />
          {user && (
            <SubmitButton
              disabled={pendingCount >= 8}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
      {userIsAdmin && pendingSubmissions.length > 0 && (
        <PendingReview
          submissions={pendingSubmissions}
          onSubmissionClick={setSelectedSubmission}
        />
      )}
      <Gallery items={galleryItems} />
      {selectedSubmission && (
        <ApprovalModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
      <InfoButton onClick={() => setShowInfoModal(true)} />
      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
    </>
  )
}
