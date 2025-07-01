import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { WorkoutHistoryDrawer } from './workout-history-drawer'

describe('WorkoutHistoryDrawer', () => {
  let mockOnClose: () => void

  beforeEach(() => {
    mockOnClose = vi.fn()
  })

  describe('rendering', () => {
    it('renders drawer closed initially', () => {
      // Arrange & Act
      render(
        <WorkoutHistoryDrawer 
          isOpen={false} 
          onClose={mockOnClose} 
          workouts={[]} 
          isLoading={false} 
        />
      )

      // Assert
      const drawer = screen.queryByRole('dialog')
      expect(drawer).not.toBeInTheDocument()
    })

    it('slides in from right when opened', () => {
      // Arrange & Act
      render(
        <WorkoutHistoryDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          workouts={[]} 
          isLoading={false} 
        />
      )

      // Assert
      const drawer = screen.getByRole('dialog')
      expect(drawer).toBeInTheDocument()
      // Check that drawer has the correct CSS module class
      expect(drawer.className).toMatch(/drawer/)
    })

    it('displays loading while fetching workouts', () => {
      // Arrange & Act
      render(
        <WorkoutHistoryDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          workouts={[]} 
          isLoading={true} 
        />
      )

      // Assert
      expect(screen.getByText('Loading workouts...')).toBeInTheDocument()
    })

    it('renders empty state message', () => {
      // Arrange & Act
      render(
        <WorkoutHistoryDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          workouts={[]} 
          isLoading={false} 
        />
      )

      // Assert
      expect(screen.getByText('No workouts found')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('closes on backdrop click', () => {
      // Arrange
      render(
        <WorkoutHistoryDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          workouts={[]} 
          isLoading={false} 
        />
      )

      // Act
      const backdrop = screen.getByTestId('drawer-backdrop')
      fireEvent.click(backdrop)

      // Assert
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes on escape key', () => {
      // Arrange
      render(
        <WorkoutHistoryDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          workouts={[]} 
          isLoading={false} 
        />
      )

      // Act
      fireEvent.keyDown(document, { key: 'Escape' })

      // Assert
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})