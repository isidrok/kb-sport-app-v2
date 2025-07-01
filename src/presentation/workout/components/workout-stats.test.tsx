import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/preact'
import { WorkoutStats } from './workout-stats'
import { useWorkoutState } from '../hooks/use-workout-state'
import { WorkoutStatus } from '@/domain/entities/workout-entity'
import type { Mocked } from 'vitest'
import { createMockWorkoutStats } from '@/test-helpers/workout-stats-factory'

vi.mock('../hooks/use-workout-state')

const mockUseWorkoutState = useWorkoutState as Mocked<typeof useWorkoutState>

describe('WorkoutStats', () => {
  beforeEach(() => {
    vi.mocked(mockUseWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        startTime: new Date(),
        endTime: null,
        isActive: true,
        repCount: 5
      })
    )
  })

  it('renders rep count card', () => {
    render(<WorkoutStats />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Reps')).toBeInTheDocument()
  })

  it('uses existing workout state hook', () => {
    render(<WorkoutStats />)
    
    expect(mockUseWorkoutState).toHaveBeenCalled()
  })

  it('updates on workout status event', () => {
    // First render with 5 reps
    const { rerender } = render(<WorkoutStats />)
    expect(screen.getByText('5')).toBeInTheDocument()

    // Simulate event-triggered state update with new rep count
    vi.mocked(mockUseWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        startTime: new Date(),
        endTime: null,
        isActive: true,
        repCount: 8
      })
    )

    // Re-render to simulate hook state update
    rerender(<WorkoutStats />)
    expect(screen.getByText('8')).toBeInTheDocument()
  })
})