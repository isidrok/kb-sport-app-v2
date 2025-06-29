export interface WorkoutButtonProps {
  canStart: boolean
  canStop: boolean
  isStarting: boolean
  onStartWorkout: () => void
  onStopWorkout: () => void
}

export function WorkoutButton(props: WorkoutButtonProps) {
  const buttonText = props.canStart ? 'Start' : 'Stop'
  const buttonStyle = props.canStop ? { backgroundColor: 'red' } : {}
  
  const handleClick = () => {
    if (props.canStart) {
      props.onStartWorkout()
    } else if (props.canStop) {
      props.onStopWorkout()
    }
  }
  
  return (
    <button 
      style={buttonStyle} 
      disabled={props.isStarting} 
      onClick={handleClick}
    >
      {buttonText}
    </button>
  )
}