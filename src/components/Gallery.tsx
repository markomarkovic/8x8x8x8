import type { GalleryItem } from '../types'

type AnimatedItemProps = {
  animationData: string
  onClick?: () => void
}

function AnimatedItem({ animationData, onClick }: AnimatedItemProps) {
  const gifUrl = `/gifs/${animationData}.gif`

  return (
    <div className="gallery-item" onClick={onClick}>
      <a href={`#${animationData}`}>
        <img src={gifUrl} alt="Animation" />
      </a>
    </div>
  )
}

type GalleryProps = {
  title?: string
  items: GalleryItem[]
  onItemClick?: (item: GalleryItem) => void
  highlight?: boolean
}

export function Gallery({ items, onItemClick, highlight }: GalleryProps) {
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
