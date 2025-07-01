import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { DeleteConfirmationModal } from './delete-confirmation-modal'
import { WorkoutSummary } from '@/domain/types/workout-storage.types'

describe('DeleteConfirmationModal', () => {
  let mockWorkout: WorkoutSummary
  let mockOnConfirm: () => void
  let mockOnCancel: () => void

  beforeEach(() => {
    mockWorkout = {
      workoutId: 'workout_2024-07-01T10:30:00.000Z',
      startTime: new Date('2024-07-01T10:30:00.000Z'),
      endTime: new Date('2024-07-01T10:45:30.000Z'),
      duration: 930000,
      totalReps: 45,
      rpm: 2.9,
      videoSizeInMB: 15.7
    }

    mockOnConfirm = vi.fn()
    mockOnCancel = vi.fn()
  })

  describe('rendering', () => {
    it('renders hidden when workout null', () => {
      // Arrange & Act
      render(
        <DeleteConfirmationModal 
          workout={null}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      // Assert
      const modal = screen.queryByRole('dialog')
      expect(modal).not.toBeInTheDocument()
    })

    it('displays workout details', () => {
      // Arrange & Act
      render(
        <DeleteConfirmationModal 
          workout={mockWorkout}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      // Assert
      expect(screen.getByText('July 1, 2024 at 12:30 PM')).toBeInTheDocument()
      expect(screen.getByText('15.7 MB')).toBeInTheDocument()
    })

    it('shows confirm and cancel buttons', () => {
      // Arrange & Act
      render(
        <DeleteConfirmationModal 
          workout={mockWorkout}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      // Assert
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls confirm on delete click', () => {
      // Arrange
      render(
        <DeleteConfirmationModal 
          workout={mockWorkout}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      // Assert
      expect(mockOnConfirm).toHaveBeenCalled()
    })

    it('calls cancel on cancel click', () => {
      // Arrange
      render(
        <DeleteConfirmationModal 
          workout={mockWorkout}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      // Assert
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })
})