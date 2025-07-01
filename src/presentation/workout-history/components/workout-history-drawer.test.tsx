import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { WorkoutHistoryDrawer } from './workout-history-drawer'

// Mock the useWorkoutHistory hook
vi.mock('../../hooks/use-workout-history')

import { useWorkoutHistory } from '../../hooks/use-workout-history'

describe('WorkoutHistoryDrawer', () => {
  let mockOnClose: () => void
  const mockUseWorkoutHistory = vi.mocked(useWorkoutHistory)

  beforeEach(() => {
    mockOnClose = vi.fn()
    
    // Default mock return value
    mockUseWorkoutHistory.mockReturnValue({
      workouts: [],
      isLoading: false,
      deletingWorkoutId: null,
      viewWorkout: vi.fn(),
      downloadWorkout: vi.fn(),
      deleteWorkout: vi.fn(),
      confirmDelete: vi.fn(),
      cancelDelete: vi.fn()
    })
  })

  describe('rendering', () => {
    it('renders drawer closed initially', () => {
      // Arrange & Act
      render(
        <WorkoutHistoryDrawer 
          isOpen={false} 
          onClose={mockOnClose} 
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
        />
      )

      // Assert
      const drawer = screen.getByRole('dialog')
      expect(drawer).toBeInTheDocument()
      // Check that drawer has the correct CSS module class
      expect(drawer.className).toMatch(/drawer/)
    })

    it('displays loading while fetching workouts', () => {
      // Arrange
      mockUseWorkoutHistory.mockReturnValue({
        workouts: [],
        isLoading: true,
        deletingWorkoutId: null,
        viewWorkout: vi.fn(),
        downloadWorkout: vi.fn(),
        deleteWorkout: vi.fn(),
        confirmDelete: vi.fn(),
        cancelDelete: vi.fn()
      })

      // Act
      render(
        <WorkoutHistoryDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
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
        />
      )

      // Act
      fireEvent.keyDown(document, { key: 'Escape' })

      // Assert
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})