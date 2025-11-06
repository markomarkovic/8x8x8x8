type InfoButtonProps = {
  onClick: () => void
}

export function InfoButton({ onClick }: InfoButtonProps) {
  return (
    <button className="info-button" onClick={onClick} title="Help & Info">
      i
    </button>
  )
}
