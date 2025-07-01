import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/preact'
import { useModelLoading } from './use-model-loading'
import { ModelLoadingEvent } from '@/application/events/model-loading-event'

const mockSubscribe = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock('./use-event-bus', () => ({
  useEventBus: () => ({
    subscribe: mockSubscribe,
    publish: vi.fn()
  })
}))

describe('useModelLoading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading initially', () => {
    const { result } = renderHook(() => useModelLoading())

    expect(result.current.status).toBe('loading')
    expect(result.current.message).toBe('Loading AI model...')
  })

  it('updates on model events', async () => {
    vi.useFakeTimers()
    let mockListener: (event: ModelLoadingEvent) => void = vi.fn()
    
    mockSubscribe.mockImplementation((listener) => {
      mockListener = listener
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useModelLoading())

    // Simulate ready event after minimum loading time has passed
    vi.advanceTimersByTime(900) // Advance past MINIMUM_LOADING_TIME (800ms)
    
    const readyEvent = new ModelLoadingEvent({ status: 'ready' })
    act(() => {
      mockListener(readyEvent)
    })

    expect(result.current.status).toBe('ready')
    expect(result.current.message).toBeUndefined()
    
    vi.useRealTimers()
  })

  it('cleans up listeners', () => {
    mockSubscribe.mockReturnValue(mockUnsubscribe)
    
    const { unmount } = renderHook(() => useModelLoading())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledOnce()
  })
})