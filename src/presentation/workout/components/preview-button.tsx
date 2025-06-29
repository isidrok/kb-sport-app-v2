import styles from './workout-controls.module.css'

export interface PreviewButtonProps {
  isPreviewActive: boolean
  isDisabled: boolean
  onStartPreview: () => void
  onStopPreview: () => void
}

export function PreviewButton(props: PreviewButtonProps) {
  const buttonText = props.isPreviewActive ? 'Stop Preview' : 'Start Preview'
  const buttonClass = props.isPreviewActive ? styles.activeButton : ''
  
  const handleClick = () => {
    if (props.isPreviewActive) {
      props.onStopPreview()
    } else {
      props.onStartPreview()
    }
  }
  
  return (
    <button className={buttonClass} onClick={handleClick} disabled={props.isDisabled}>
      {buttonText}
    </button>
  )
}