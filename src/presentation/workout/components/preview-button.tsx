import styles from './workout-controls.module.css'
import { Icon } from '@/presentation/components/icon'

export interface PreviewButtonProps {
  isPreviewActive: boolean
  isDisabled: boolean
  onStartPreview: () => void
  onStopPreview: () => void
}

export function PreviewButton(props: PreviewButtonProps) {
  const buttonText = props.isPreviewActive ? 'Stop Preview' : 'Start Preview'
  const iconName = props.isPreviewActive ? 'visibility_off' : 'visibility'
  const buttonClass = props.isPreviewActive ? styles.activeButton : ''
  
  const handleClick = () => {
    if (props.isPreviewActive) {
      props.onStopPreview()
    } else {
      props.onStartPreview()
    }
  }
  
  return (
    <button className={buttonClass} onClick={handleClick} disabled={props.isDisabled} aria-label={buttonText}>
      <Icon name={iconName} className={styles.buttonIcon} />
    </button>
  )
}