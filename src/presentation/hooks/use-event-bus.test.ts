import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/preact'
import { useEventBus } from './use-event-bus'
import { eventBus } from '@/infrastructure/event-bus/event-bus'
import { Event } from '@/infrastructure/event-bus/event'

vi.mock('@/infrastructure/event-bus/event-bus')

class TestEvent extends Event<{ data: string }> {}

const mockEventBus = vi.mocked(eventBus)
const mockUnsubscribe = vi.fn()

describe('useEventBus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEventBus.subscribe.mockReturnValue(mockUnsubscribe)
  })

  it('publish calls eventbus', () => {
    const { result } = renderHook(() => useEventBus(TestEvent))
    const testEvent = new TestEvent({ data: 'test' })
    
    result.current.publish(testEvent)
    
    expect(mockEventBus.publish).toHaveBeenCalledWith(testEvent)
  })

  it('subscribe adds listener and cleans up', () => {
    const { result, unmount } = renderHook(() => useEventBus(TestEvent))
    const listener = vi.fn()
    
    result.current.subscribe(listener)
    
    expect(mockEventBus.subscribe).toHaveBeenCalledWith(TestEvent, listener)
    
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})