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

  it('renders all kpi cards', () => {
    render(<WorkoutStats />)
    
    // Existing reps card
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Reps')).toBeInTheDocument()
    
    // New KPI cards - check by labels and values
    expect(screen.getByText('00:00')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Avg Speed')).toBeInTheDocument()
    expect(screen.getByText('Current Speed')).toBeInTheDocument()
    
    // Verify both RPM values exist (should be 2 instances of "0 RPM")
    expect(screen.getAllByText('0 RPM')).toHaveLength(2)
  })

  it('uses existing workout state hook', () => {
    render(<WorkoutStats />)
    
    expect(mockUseWorkoutState).toHaveBeenCalled()
  })

  it('displays initial values for idle workout', () => {
    vi.mocked(mockUseWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        startTime: null,
        endTime: null,
        isActive: false,
        repCount: 0,
        elapsedTime: 0,
        formattedTime: '00:00',
        averageRPM: 0,
        currentRPM: 0
      })
    )
    
    render(<WorkoutStats />)
    
    // Check each KPI card by finding the label and checking its associated value in the parent card
    const repsCard = screen.getByText('Reps').parentElement
    expect(repsCard).toHaveTextContent('0')
    expect(repsCard).toHaveTextContent('Reps')
    
    const timeCard = screen.getByText('Time').parentElement
    expect(timeCard).toHaveTextContent('00:00')
    expect(timeCard).toHaveTextContent('Time')
    
    const avgSpeedCard = screen.getByText('Avg Speed').parentElement
    expect(avgSpeedCard).toHaveTextContent('0 RPM')
    expect(avgSpeedCard).toHaveTextContent('Avg Speed')
    
    const currentSpeedCard = screen.getByText('Current Speed').parentElement
    expect(currentSpeedCard).toHaveTextContent('0 RPM')
    expect(currentSpeedCard).toHaveTextContent('Current Speed')
  })

  it('updates values during workout', () => {
    const { rerender } = render(<WorkoutStats />)
    
    // Initial state - verify starting values
    let repsCard = screen.getByText('Reps').parentElement
    expect(repsCard).toHaveTextContent('5')
    
    // Simulate workout progress with updated metrics
    vi.mocked(mockUseWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        startTime: new Date(),
        endTime: null,
        isActive: true,
        repCount: 12,
        elapsedTime: 125000, // 2 minutes 5 seconds
        formattedTime: '02:05',
        averageRPM: 15,
        currentRPM: 18
      })
    )

    rerender(<WorkoutStats />)
    
    // Verify all KPI cards show updated values
    repsCard = screen.getByText('Reps').parentElement
    expect(repsCard).toHaveTextContent('12')
    
    const timeCard = screen.getByText('Time').parentElement
    expect(timeCard).toHaveTextContent('02:05')
    
    const avgSpeedCard = screen.getByText('Avg Speed').parentElement
    expect(avgSpeedCard).toHaveTextContent('15 RPM')
    
    const currentSpeedCard = screen.getByText('Current Speed').parentElement
    expect(currentSpeedCard).toHaveTextContent('18 RPM')
  })

  it('preserves values after stop', () => {
    // Start with active workout
    vi.mocked(mockUseWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        startTime: new Date(),
        endTime: null,
        isActive: true,
        repCount: 25,
        elapsedTime: 300000, // 5 minutes
        formattedTime: '05:00',
        averageRPM: 20,
        currentRPM: 22
      })
    )
    
    const { rerender } = render(<WorkoutStats />)
    
    // Verify active workout values
    let repsCard = screen.getByText('Reps').parentElement
    expect(repsCard).toHaveTextContent('25')
    
    // Simulate workout stop - values should remain
    vi.mocked(mockUseWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.STOPPED,
        startTime: new Date(),
        endTime: new Date(),
        isActive: false,
        repCount: 25, // Same final values
        elapsedTime: 300000,
        formattedTime: '05:00',
        averageRPM: 20,
        currentRPM: 22
      })
    )
    
    rerender(<WorkoutStats />)
    
    // Verify final values are preserved
    repsCard = screen.getByText('Reps').parentElement
    expect(repsCard).toHaveTextContent('25')
    
    const timeCard = screen.getByText('Time').parentElement
    expect(timeCard).toHaveTextContent('05:00')
    
    const avgSpeedCard = screen.getByText('Avg Speed').parentElement
    expect(avgSpeedCard).toHaveTextContent('20 RPM')
    
    const currentSpeedCard = screen.getByText('Current Speed').parentElement
    expect(currentSpeedCard).toHaveTextContent('22 RPM')
  })
})