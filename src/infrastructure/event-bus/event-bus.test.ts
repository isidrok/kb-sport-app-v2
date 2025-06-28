import { describe, it, expect, vi } from 'vitest'
import { EventBus, Event } from './event-bus'

class TestEvent extends Event<{ data: string }> {}

describe('EventBus', () => {
  it('publish calls registered listeners', () => {
    const eventBus = new EventBus()
    const listener = vi.fn()
    const testEvent = new TestEvent({ data: 'test' })
    
    eventBus.subscribe(TestEvent, listener)
    eventBus.publish(testEvent)
    
    expect(listener).toHaveBeenCalledWith(testEvent)
  })

  it('multiple listeners called', () => {
    const eventBus = new EventBus()
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const testEvent = new TestEvent({ data: 'test' })
    
    eventBus.subscribe(TestEvent, listener1)
    eventBus.subscribe(TestEvent, listener2)
    eventBus.publish(testEvent)
    
    expect(listener1).toHaveBeenCalledWith(testEvent)
    expect(listener2).toHaveBeenCalledWith(testEvent)
  })

  it('unsubscribe removes listener', () => {
    const eventBus = new EventBus()
    const listener = vi.fn()
    const testEvent1 = new TestEvent({ data: 'test' })
    const testEvent2 = new TestEvent({ data: 'test2' })
    
    const unsubscribe = eventBus.subscribe(TestEvent, listener)
    eventBus.publish(testEvent1)
    expect(listener).toHaveBeenCalledOnce()
    
    unsubscribe()
    eventBus.publish(testEvent2)
    expect(listener).toHaveBeenCalledOnce() // still only called once
  })

  it('base event class stores data', () => {
    class TestEvent extends Event<{ message: string }> {}
    
    const event = new TestEvent({ message: 'test data' })
    
    expect(event.data).toEqual({ message: 'test data' })
  })
})