import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/preact'
import { WorkoutButton } from './workout-button'

describe('WorkoutButton', () => {
  it('renders play icon when can start', () => {
    const mockStartWorkout = vi.fn()
    const mockStopWorkout = vi.fn()
    
    const { container } = render(
      <WorkoutButton
        canStart={true}
        canStop={false}
        isStarting={false}
        onStartWorkout={mockStartWorkout}
        onStopWorkout={mockStopWorkout}
      />
    )
    
    expect(container.querySelector('.material-icons')).toHaveTextContent('play_arrow')
    expect(container.querySelector('button')).toHaveAttribute('aria-label', 'Start')
  })

  it('renders stop icon when can stop', () => {
    const mockStartWorkout = vi.fn()
    const mockStopWorkout = vi.fn()
    
    const { container } = render(
      <WorkoutButton
        canStart={false}
        canStop={true}
        isStarting={false}
        onStartWorkout={mockStartWorkout}
        onStopWorkout={mockStopWorkout}
      />
    )
    
    expect(container.querySelector('.material-icons')).toHaveTextContent('stop')
    expect(container.querySelector('button')).toHaveAttribute('aria-label', 'Stop')
  })

  it('sets disabled attribute when starting', () => {
    const mockStartWorkout = vi.fn()
    const mockStopWorkout = vi.fn()
    
    const { container } = render(
      <WorkoutButton
        canStart={true}
        canStop={false}
        isStarting={true}
        onStartWorkout={mockStartWorkout}
        onStopWorkout={mockStopWorkout}
      />
    )
    
    const button = container.querySelector('button')
    expect(button?.disabled).toBe(true)
  })

  it('calls correct handler based on state', () => {
    const mockStartWorkout = vi.fn()
    const mockStopWorkout = vi.fn()
    
    // Test start workout call
    const { container: startContainer } = render(
      <WorkoutButton
        canStart={true}
        canStop={false}
        isStarting={false}
        onStartWorkout={mockStartWorkout}
        onStopWorkout={mockStopWorkout}
      />
    )
    
    const startButton = startContainer.querySelector('button')!
    fireEvent.click(startButton)
    
    expect(mockStartWorkout).toHaveBeenCalledOnce()
    expect(mockStopWorkout).not.toHaveBeenCalled()
    
    vi.clearAllMocks()
    
    // Test stop workout call
    const { container: stopContainer } = render(
      <WorkoutButton
        canStart={false}
        canStop={true}
        isStarting={false}
        onStartWorkout={mockStartWorkout}
        onStopWorkout={mockStopWorkout}
      />
    )
    
    const stopButton = stopContainer.querySelector('button')!
    fireEvent.click(stopButton)
    
    expect(mockStopWorkout).toHaveBeenCalledOnce()
    expect(mockStartWorkout).not.toHaveBeenCalled()
  })
})