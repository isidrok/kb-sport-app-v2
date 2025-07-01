import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { WorkoutCard } from './workout-card'
import { WorkoutSummary } from '@/domain/types/workout-storage.types'

describe('WorkoutCard', () => {
  let mockWorkout: WorkoutSummary
  let mockOnView: () => void
  let mockOnDownload: () => void
  let mockOnDelete: () => void

  beforeEach(() => {
    mockWorkout = {
      workoutId: 'workout_2024-07-01T10:30:00.000Z',
      startTime: new Date('2024-07-01T10:30:00.000Z'),
      endTime: new Date('2024-07-01T10:45:30.000Z'),
      duration: 930000, // 15.5 minutes in milliseconds
      totalReps: 45,
      rpm: 2.9,
      videoSizeInMB: 15.7
    }

    mockOnView = vi.fn()
    mockOnDownload = vi.fn()
    mockOnDelete = vi.fn()
  })

  describe('display', () => {
    it('displays workout stats', () => {
      // Arrange & Act
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      )

      // Assert
      expect(screen.getByText('45 reps')).toBeInTheDocument()
      expect(screen.getByText('2.9 RPM')).toBeInTheDocument()
      expect(screen.getByText('15.7 MB')).toBeInTheDocument()
    })

    it('formats date as readable string', () => {
      // Arrange & Act
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      )

      // Assert
      expect(screen.getByText('July 1, 2024 at 12:30 PM')).toBeInTheDocument()
    })

    it('shows three action buttons', () => {
      // Arrange & Act
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      )

      // Assert
      expect(screen.getByRole('button', { name: 'View Video' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('triggers view callback on click', () => {
      // Arrange
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'View Video' }))

      // Assert
      expect(mockOnView).toHaveBeenCalledWith('workout_2024-07-01T10:30:00.000Z')
    })

    it('triggers download callback on click', () => {
      // Arrange
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Download' }))

      // Assert
      expect(mockOnDownload).toHaveBeenCalledWith('workout_2024-07-01T10:30:00.000Z')
    })

    it('triggers delete callback on click', () => {
      // Arrange
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      // Assert
      expect(mockOnDelete).toHaveBeenCalledWith('workout_2024-07-01T10:30:00.000Z')
    })
  })
})