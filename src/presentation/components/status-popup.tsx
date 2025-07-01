import styles from './status-popup.module.css'
import { Icon } from './icon'

interface StatusPopupProps {
  message?: string
  type: 'loading' | 'error'
  visible: boolean
}

export function StatusPopup({ message, type, visible }: StatusPopupProps) {
  if (!visible) return null

  return (
    <div className={`${styles.statusPopup} ${styles[type]}`}>
      {type === 'loading' && (
        <div className={styles.iconContainer}>
          <Icon name="hourglass_empty" className={styles.loadingIcon} />
        </div>
      )}
      {type === 'error' && (
        <div className={styles.iconContainer}>
          <Icon name="error" className={styles.errorIcon} />
        </div>
      )}
      {message && <span className={styles.message}>{message}</span>}
    </div>
  )
}