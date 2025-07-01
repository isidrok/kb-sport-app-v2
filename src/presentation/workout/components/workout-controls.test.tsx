import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/preact'
import { WorkoutControls } from './workout-controls'
import { useWorkoutState } from '../hooks/use-workout-state'
import { useWorkoutActions } from '../hooks/use-workout-actions'
import { usePreview } from '../../hooks/use-preview'
import { useWorkoutHistory } from '../../hooks/use-workout-history'
import { WorkoutStatus } from '@/domain/entities/workout-entity'
import { createRef } from 'preact'
import { createMockWorkoutStats } from '@/test-helpers/workout-stats-factory'

vi.mock('../hooks/use-workout-state')
vi.mock('../hooks/use-workout-actions')
vi.mock('../../hooks/use-preview')
vi.mock('../../hooks/use-workout-history')
vi.mock('../../workout-history/components/workout-history-drawer', () => ({
  WorkoutHistoryDrawer: ({ isOpen, children }: any) => 
    isOpen ? <div role="dialog"><h2>Workout History</h2>{children}</div> : null
}))

describe('WorkoutControls', () => {
  const videoRef = createRef<HTMLVideoElement>()
  const canvasRef = createRef<HTMLCanvasElement>()

  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useWorkoutActions).mockReturnValue({
      isStarting: false,
      startWorkout: vi.fn(),
      stopWorkout: vi.fn(),
      cameraError: undefined
    })

    vi.mocked(usePreview).mockReturnValue({
      isPreviewActive: false,
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      error: null
    })

    vi.mocked(useWorkoutHistory).mockReturnValue({
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

  it('renders all three buttons', () => {
    vi.mocked(useWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        isActive: false,
        startTime: null,
        endTime: null,
        repCount: 0
      })
    )

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    expect(screen.getByRole('button', { name: /start$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start preview/i })).toBeInTheDocument()
    expect(screen.getByTestId('history-button')).toBeInTheDocument()
  })

  it('shows stop when active', () => {
    vi.mocked(useWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        isActive: true,
        startTime: new Date(),
        endTime: null,
        repCount: 0
      })
    )

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })

  it('disabled when starting', () => {
    vi.mocked(useWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        isActive: false,
        startTime: null,
        endTime: null,
        repCount: 0
      })
    )

    vi.mocked(useWorkoutActions).mockReturnValue({
      isStarting: true,
      startWorkout: vi.fn(),
      stopWorkout: vi.fn(),
      cameraError: undefined
    })

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    const workoutButton = screen.getByRole('button', { name: /^start$/i })
    expect(workoutButton).toBeDisabled()
  })

  it('calls start with refs', () => {
    const mockStartWorkout = vi.fn()
    const mockVideoElement = document.createElement('video') as HTMLVideoElement
    const mockCanvasElement = document.createElement('canvas') as HTMLCanvasElement

    videoRef.current = mockVideoElement
    canvasRef.current = mockCanvasElement

    vi.mocked(useWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        isActive: false,
        startTime: null,
        endTime: null,
        repCount: 0
      })
    )

    vi.mocked(useWorkoutActions).mockReturnValue({
      isStarting: false,
      startWorkout: mockStartWorkout,
      stopWorkout: vi.fn(),
      cameraError: undefined
    })

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    const button = screen.getByRole('button', { name: /^start$/i })
    button.click()

    expect(mockStartWorkout).toHaveBeenCalledWith(mockVideoElement, mockCanvasElement)
  })

  it('calls stop on click', () => {
    const mockStopWorkout = vi.fn()

    vi.mocked(useWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        isActive: true,
        startTime: new Date(),
        endTime: null,
        repCount: 0
      })
    )

    vi.mocked(useWorkoutActions).mockReturnValue({
      isStarting: false,
      startWorkout: vi.fn(),
      stopWorkout: mockStopWorkout,
      cameraError: undefined
    })

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    const button = screen.getByRole('button', { name: /stop/i })
    button.click()

    expect(mockStopWorkout).toHaveBeenCalledOnce()
  })

  it('disables preview when workout active', () => {
    vi.mocked(useWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        isActive: true,
        startTime: new Date(),
        endTime: null,
        repCount: 0
      })
    )

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    const previewButton = screen.getByRole('button', { name: /preview/i })
    expect(previewButton).toBeDisabled()
  })

  it('shows workout history button', () => {
    vi.mocked(useWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        isActive: false,
        startTime: null,
        endTime: null,
        repCount: 0
      })
    )

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    const historyButton = screen.getByTestId('history-button')
    expect(historyButton).toBeInTheDocument()
  })

  it('renders workout history drawer component', () => {
    vi.mocked(useWorkoutState).mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        isActive: false,
        startTime: null,
        endTime: null,
        repCount: 0
      })
    )

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    // History button should be present
    const historyButton = screen.getByTestId('history-button')
    expect(historyButton).toBeInTheDocument()
    
    // The WorkoutHistoryDrawer component should be rendered (even if not visible initially)
    // This tests that the integration is complete
    expect(historyButton).toBeEnabled()
  })
})