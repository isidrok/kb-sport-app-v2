import styles from './workout-controls.module.css'

export interface WorkoutButtonProps {
  canStart: boolean
  canStop: boolean
  isStarting: boolean
  onStartWorkout: () => void
  onStopWorkout: () => void
}

export function WorkoutButton(props: WorkoutButtonProps) {
  const buttonText = props.canStart ? 'Start' : 'Stop'
  const buttonClass = props.canStop ? styles.activeButton : ''
  
  const handleClick = () => {
    if (props.canStart) {
      props.onStartWorkout()
    } else if (props.canStop) {
      props.onStopWorkout()
    }
  }
  
  return (
    <button 
      className={buttonClass}
      disabled={props.isStarting} 
      onClick={handleClick}
    >
      {buttonText}
    </button>
  )
}