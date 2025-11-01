export type Color = string // hex color like "FF0000"
export type Palette = [Color, Color, Color, Color, Color, Color, Color, Color]
export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type Frame = ColorIndex[] // 64 pixels (8x8)
export type Frames = [Frame, Frame, Frame, Frame, Frame, Frame, Frame, Frame]

export type AppState = {
  palette: Palette
  frames: Frames
  selectedColorIndex: ColorIndex
  currentFrameIndex: ColorIndex
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export type Submission = {
  id: string
  userId: string
  userEmail?: string
  animationData: string
  createdAt: Date
  status: SubmissionStatus
}

export type GalleryItem = {
  id: string
  userId: string
  userEmail?: string
  animationData: string
  approvedAt: Date
  approvedBy: string
}
