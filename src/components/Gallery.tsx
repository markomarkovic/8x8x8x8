import type { GalleryItem } from '../types'

type AnimatedItemProps = {
  animationData: string
}

function AnimatedItem({ animationData }: AnimatedItemProps) {
  const gifUrl = `/gifs/${animationData}.gif`

  return (
    <div className="gallery-item">
      <a href={`#${animationData}`}>
        <img src={gifUrl} alt="Animation" />
      </a>
    </div>
  )
}

type GalleryProps = {
  title?: string
  items: GalleryItem[]
  highlight?: boolean
}

export function Gallery({ items, highlight }: GalleryProps) {
  return (
    <div className={`gallery ${highlight ? 'gallery-highlight' : ''}`}>
      <div className="gallery-grid">
        {items.map((item) => (
          <AnimatedItem key={item.id} animationData={item.animationData} />
        ))}
      </div>
    </div>
  )
}
