interface StatusPopupProps {
  message?: string
  type: 'loading' | 'error'
  visible: boolean
}

export function StatusPopup({ message, type, visible }: StatusPopupProps) {
  if (!visible) return null

  return (
    <div className={`status-popup ${type}`}>
      {message}
    </div>
  )
}