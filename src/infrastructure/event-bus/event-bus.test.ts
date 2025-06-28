import { describe, it, expect, vi } from 'vitest'
import { EventBus, Event } from './event-bus'

describe('EventBus', () => {
  it('publish calls registered listeners', () => {
    const eventBus = new EventBus()
    const listener = vi.fn()
    
    eventBus.subscribe('test-event', listener)
    eventBus.publish('test-event', { data: 'test' })
    
    expect(listener).toHaveBeenCalledWith({ data: 'test' })
  })

  it('multiple listeners called', () => {
    const eventBus = new EventBus()
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    
    eventBus.subscribe('test-event', listener1)
    eventBus.subscribe('test-event', listener2)
    eventBus.publish('test-event', { data: 'test' })
    
    expect(listener1).toHaveBeenCalledWith({ data: 'test' })
    expect(listener2).toHaveBeenCalledWith({ data: 'test' })
  })

  it('unsubscribe removes listener', () => {
    const eventBus = new EventBus()
    const listener = vi.fn()
    
    const unsubscribe = eventBus.subscribe('test-event', listener)
    eventBus.publish('test-event', { data: 'test' })
    expect(listener).toHaveBeenCalledOnce()
    
    unsubscribe()
    eventBus.publish('test-event', { data: 'test2' })
    expect(listener).toHaveBeenCalledOnce() // still only called once
  })

  it('base event class stores data', () => {
    class TestEvent extends Event<{ message: string }> {}
    
    const event = new TestEvent({ message: 'test data' })
    
    expect(event.data).toEqual({ message: 'test data' })
  })
})