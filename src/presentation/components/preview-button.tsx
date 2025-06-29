export interface PreviewButtonProps {
  isPreviewActive: boolean
  isDisabled: boolean
  onStartPreview: () => void
  onStopPreview: () => void
}

export function PreviewButton(props: PreviewButtonProps) {
  const buttonText = props.isPreviewActive ? 'Stop Preview' : 'Start Preview'
  const buttonStyle = props.isPreviewActive ? { backgroundColor: 'red' } : {}
  
  const handleClick = () => {
    if (props.isPreviewActive) {
      props.onStopPreview()
    } else {
      props.onStartPreview()
    }
  }
  
  return (
    <button style={buttonStyle} onClick={handleClick} disabled={props.isDisabled}>
      {buttonText}
    </button>
  )
}