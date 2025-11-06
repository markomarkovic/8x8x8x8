import type { GalleryItem } from '../types'

type AnimatedItemProps = {
  animationData: string
  onClick?: () => void
}

function AnimatedItem({ animationData, onClick }: AnimatedItemProps) {
  const gifUrl = `/gifs/${animationData}.gif`

  if (onClick) {
    return (
      <div
        className="gallery-item"
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        <img src={gifUrl} alt="Animation" />
      </div>
    )
  }

  return (
    <div className="gallery-item">
      <a href={`#${animationData}`}>
        <img src={gifUrl} alt="Animation" />
      </a>
    </div>
  )
}

type GalleryProps = {
  items: GalleryItem[]
  highlight?: boolean
  onItemClick?: (item: GalleryItem) => void
}

export function Gallery({ items, highlight, onItemClick }: GalleryProps) {
  return (
    <div className={`gallery ${highlight ? 'gallery-highlight' : ''}`}>
      <div className="gallery-grid">
        {items.map((item) => (
          <AnimatedItem
            key={item.id}
            animationData={item.animationData}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
