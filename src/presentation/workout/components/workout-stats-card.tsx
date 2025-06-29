import styles from './workout-stats-card.module.css'

interface WorkoutStatsCardProps {
  value: string | number
  label: string
  className?: string
}

export function WorkoutStatsCard({ value, label, className }: WorkoutStatsCardProps) {
  const cardClass = className ? `${styles.card} ${className}` : styles.card

  return (
    <div className={cardClass}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  )
}