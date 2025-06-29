import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/preact'
import { WorkoutStatsCard } from './workout-stats-card'

describe('WorkoutStatsCard', () => {
  it('renders value and label', () => {
    render(<WorkoutStatsCard value={42} label="Reps" />)
    
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Reps')).toBeInTheDocument()
  })

  it('handles numeric values', () => {
    render(<WorkoutStatsCard value={123} label="Count" />)
    
    expect(screen.getByText('123')).toBeInTheDocument()
  })

  it('handles string values', () => {
    render(<WorkoutStatsCard value="Active" label="Status" />)
    
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<WorkoutStatsCard value={42} label="Reps" className="custom-class" />)
    
    const container = screen.getByText('42').parentElement
    expect(container).toHaveClass('custom-class')
  })
})