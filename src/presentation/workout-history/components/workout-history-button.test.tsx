import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { WorkoutHistoryButton } from './workout-history-button'

describe('WorkoutHistoryButton', () => {
  let mockOnClick: () => void

  beforeEach(() => {
    mockOnClick = vi.fn()
  })

  describe('rendering', () => {
    it('renders history icon', () => {
      // Arrange & Act
      render(<WorkoutHistoryButton onClick={mockOnClick} />)

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('history')).toBeInTheDocument() // Material icon text
    })

    it('triggers click handler', () => {
      // Arrange
      render(<WorkoutHistoryButton onClick={mockOnClick} />)

      // Act
      fireEvent.click(screen.getByRole('button'))

      // Assert
      expect(mockOnClick).toHaveBeenCalled()
    })

    it('shows workout count badge', () => {
      // Arrange & Act
      render(<WorkoutHistoryButton onClick={mockOnClick} workoutCount={5} />)

      // Assert
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })
})