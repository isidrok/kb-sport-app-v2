import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { WorkoutCard } from './workout-card'
import { WorkoutSummary } from '@/domain/types/workout-storage.types'

describe('WorkoutCard', () => {
  let mockWorkout: WorkoutSummary
  let mockOnView: () => void
  let mockOnDownload: () => void
  let mockOnDelete: () => void
  let mockOnConfirmDelete: () => void
  let mockOnCancelDelete: () => void

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
    mockOnConfirmDelete = vi.fn()
    mockOnCancelDelete = vi.fn()
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
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
        />
      )

      // Assert
      expect(screen.getByText('45')).toBeInTheDocument()
      expect(screen.getByText('Reps')).toBeInTheDocument()
      expect(screen.getByText('2.9')).toBeInTheDocument()
      expect(screen.getByText('RPM')).toBeInTheDocument()
      expect(screen.getByText('15:30')).toBeInTheDocument()
      expect(screen.getByText('Duration')).toBeInTheDocument()
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
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
        />
      )

      // Assert
      expect(screen.getByText('July 1, 2024 at 12:30 PM')).toBeInTheDocument()
    })

    it('formats duration as mm:ss', () => {
      // Arrange - workout with different duration
      const workoutWith90Seconds = {
        ...mockWorkout,
        startTime: new Date('2024-07-01T10:30:00.000Z'),
        endTime: new Date('2024-07-01T10:31:30.000Z'), // 1 minute 30 seconds
      }

      // Act
      render(
        <WorkoutCard 
          workout={workoutWith90Seconds}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
        />
      )

      // Assert
      expect(screen.getByText('01:30')).toBeInTheDocument()
      expect(screen.getByText('Duration')).toBeInTheDocument()
    })

    it('pads single digit minutes and seconds', () => {
      // Arrange - workout with 5 minutes 7 seconds (307 seconds)
      const shortWorkout = {
        ...mockWorkout,
        startTime: new Date('2024-07-01T10:30:00.000Z'),
        endTime: new Date('2024-07-01T10:35:07.000Z'), // 5 minutes 7 seconds
      }

      // Act
      render(
        <WorkoutCard 
          workout={shortWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
        />
      )

      // Assert
      expect(screen.getByText('05:07')).toBeInTheDocument()
    })

    it('shows three action buttons', () => {
      // Arrange & Act
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
        />
      )

      // Assert
      expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument()
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
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'View' }))

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
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
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
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      // Assert
      expect(mockOnDelete).toHaveBeenCalledWith('workout_2024-07-01T10:30:00.000Z')
    })
  })

  describe('delete confirmation', () => {
    it('shows confirmation dialog when deleting', () => {
      // Arrange & Act
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
          isDeleting={true}
        />
      )

      // Assert
      expect(screen.getByText('Delete Workout?')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete this workout?')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('triggers confirm delete callback on confirm click', () => {
      // Arrange
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
          isDeleting={true}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      // Assert
      expect(mockOnConfirmDelete).toHaveBeenCalledWith('workout_2024-07-01T10:30:00.000Z')
    })

    it('triggers cancel delete callback on cancel click', () => {
      // Arrange
      render(
        <WorkoutCard 
          workout={mockWorkout}
          onView={mockOnView}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onConfirmDelete={mockOnConfirmDelete}
          onCancelDelete={mockOnCancelDelete}
          isDeleting={true}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      // Assert
      expect(mockOnCancelDelete).toHaveBeenCalledOnce()
    })
  })
})