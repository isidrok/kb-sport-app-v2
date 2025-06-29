import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/preact'
import { WorkoutControls } from './workout-controls'
import { useWorkoutState } from '../hooks/use-workout-state'
import { useWorkoutActions } from '../hooks/use-workout-actions'
import { usePreview } from '../../hooks/use-preview'
import { WorkoutStatus } from '@/domain/entities/workout-entity'
import { createRef } from 'preact'

vi.mock('../hooks/use-workout-state')
vi.mock('../hooks/use-workout-actions')
vi.mock('../../hooks/use-preview')

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
  })

  it('renders both buttons', () => {
    vi.mocked(useWorkoutState).mockReturnValue({
      status: WorkoutStatus.IDLE,
      canStart: true,
      canStop: false,
      startTime: null,
      endTime: null,
      repCount: 0
    })

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    expect(screen.getByRole('button', { name: /start$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start preview/i })).toBeInTheDocument()
  })

  it('shows stop when active', () => {
    vi.mocked(useWorkoutState).mockReturnValue({
      status: WorkoutStatus.ACTIVE,
      canStart: false,
      canStop: true,
      startTime: new Date(),
      endTime: null,
      repCount: 0
    })

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })

  it('disabled when starting', () => {
    vi.mocked(useWorkoutState).mockReturnValue({
      status: WorkoutStatus.IDLE,
      canStart: true,
      canStop: false,
      startTime: null,
      endTime: null,
      repCount: 0
    })

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

    vi.mocked(useWorkoutState).mockReturnValue({
      status: WorkoutStatus.IDLE,
      canStart: true,
      canStop: false,
      startTime: null,
      endTime: null,
      repCount: 0
    })

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

    vi.mocked(useWorkoutState).mockReturnValue({
      status: WorkoutStatus.ACTIVE,
      canStart: false,
      canStop: true,
      startTime: new Date(),
      endTime: null,
      repCount: 0
    })

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
    vi.mocked(useWorkoutState).mockReturnValue({
      status: WorkoutStatus.ACTIVE,
      canStart: false,
      canStop: true,
      startTime: new Date(),
      endTime: null,
      repCount: 0
    })

    render(<WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />)

    const previewButton = screen.getByRole('button', { name: /preview/i })
    expect(previewButton).toBeDisabled()
  })
})