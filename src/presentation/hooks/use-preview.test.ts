import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/preact'
import { usePreview } from './use-preview'
import { previewService } from '@/application/services/preview.service'
import { eventBus } from '@/infrastructure/event-bus/event-bus'
import { PreviewStartedEvent, PreviewStoppedEvent } from '@/application/events/preview-events'

vi.mock('@/application/services/preview.service')
vi.mock('@/infrastructure/event-bus/event-bus')

const mockUnsubscribe = vi.fn()

describe('usePreview', () => {
  const mockVideoElement = {} as HTMLVideoElement
  const mockCanvasElement = {} as HTMLCanvasElement
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(eventBus.subscribe).mockReturnValue(mockUnsubscribe)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns initial state as inactive', () => {
    const { result } = renderHook(() => usePreview(
      { current: mockVideoElement },
      { current: mockCanvasElement }
    ))
    
    expect(result.current.isPreviewActive).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('calls preview service start', async () => {
    const { result } = renderHook(() => usePreview(
      { current: mockVideoElement },
      { current: mockCanvasElement }
    ))
    
    await act(async () => {
      await result.current.startPreview()
    })
    
    expect(previewService.startPreview).toHaveBeenCalledWith(mockVideoElement, mockCanvasElement)
  })

  it('calls preview service stop', () => {
    const { result } = renderHook(() => usePreview(
      { current: mockVideoElement },
      { current: mockCanvasElement }
    ))
    
    act(() => {
      result.current.stopPreview()
    })
    
    expect(previewService.stopPreview).toHaveBeenCalledWith(mockCanvasElement)
  })

  it('updates state on events', () => {
    let previewStartedListener: any
    let previewStoppedListener: any
    
    vi.mocked(eventBus.subscribe).mockImplementation((eventClass, listener) => {
      if (eventClass === PreviewStartedEvent) {
        previewStartedListener = listener
      } else if (eventClass === PreviewStoppedEvent) {
        previewStoppedListener = listener
      }
      return vi.fn()
    })

    const { result } = renderHook(() => usePreview(
      { current: mockVideoElement },
      { current: mockCanvasElement }
    ))

    expect(result.current.isPreviewActive).toBe(false)
    
    // Simulate preview started event
    act(() => {
      previewStartedListener(new PreviewStartedEvent({ timestamp: new Date().toISOString() }))
    })
    
    expect(result.current.isPreviewActive).toBe(true)
    
    // Simulate preview stopped event
    act(() => {
      previewStoppedListener(new PreviewStoppedEvent({ timestamp: new Date().toISOString() }))
    })
    
    expect(result.current.isPreviewActive).toBe(false)
  })

  it('handles start errors', async () => {
    const error = new Error('Camera failed')
    vi.mocked(previewService.startPreview).mockRejectedValue(error)

    const { result } = renderHook(() => usePreview(
      { current: mockVideoElement },
      { current: mockCanvasElement }
    ))

    await act(async () => {
      await result.current.startPreview()
    })

    expect(result.current.error).toBe('Camera failed')
  })

  it('cleans up event subscriptions', () => {
    const { unmount } = renderHook(() => usePreview(
      { current: mockVideoElement },
      { current: mockCanvasElement }
    ))

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(2)
  })
})