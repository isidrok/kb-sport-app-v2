import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest'
import { PreviewService } from './preview.service'
import type { PoseService } from './pose.service'
import type { EventBus } from '@/infrastructure/event-bus/event-bus'

describe('PreviewService', () => {
  let previewService: PreviewService
  let mockPoseService: Mocked<PoseService>
  let mockEventBus: Mocked<EventBus>
  let mockVideoElement: HTMLVideoElement
  let mockCanvasElement: HTMLCanvasElement

  beforeEach(() => {
    mockPoseService = {
      startPoseDetection: vi.fn(),
      stopPoseDetection: vi.fn(),
      processFrame: vi.fn(),
      isActive: vi.fn().mockReturnValue(false)
    } as Partial<PoseService> as Mocked<PoseService>

    mockEventBus = {
      publish: vi.fn()
    } as Partial<EventBus> as Mocked<EventBus>

    previewService = new PreviewService({
      poseService: mockPoseService,
      eventBus: mockEventBus
    })

    mockVideoElement = {} as HTMLVideoElement
    mockCanvasElement = {} as HTMLCanvasElement
  })

  it('starts pose detection without workout', async () => {
    await previewService.startPreview(mockVideoElement, mockCanvasElement)

    expect(mockPoseService.startPoseDetection).toHaveBeenCalledWith(mockVideoElement, mockCanvasElement)
  })

  it('publishes preview started event', async () => {
    await previewService.startPreview(mockVideoElement, mockCanvasElement)

    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          timestamp: expect.any(String)
        })
      })
    )
  })

  it('stops pose detection', () => {
    previewService.stopPreview(mockCanvasElement)

    expect(mockPoseService.stopPoseDetection).toHaveBeenCalledWith(mockCanvasElement)
  })

  it('publishes preview stopped event', () => {
    previewService.stopPreview(mockCanvasElement)

    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          timestamp: expect.any(String)
        })
      })
    )
  })

  it('tracks preview state', async () => {
    expect(previewService.isPreviewActive()).toBe(false)

    await previewService.startPreview(mockVideoElement, mockCanvasElement)
    expect(previewService.isPreviewActive()).toBe(true)

    previewService.stopPreview()
    expect(previewService.isPreviewActive()).toBe(false)
  })

  it('handles pose service errors', async () => {
    const error = new Error('Camera access denied')
    mockPoseService.startPoseDetection.mockRejectedValueOnce(error)

    await expect(previewService.startPreview(mockVideoElement, mockCanvasElement)).rejects.toThrow('Camera access denied')
    expect(previewService.isPreviewActive()).toBe(false)
  })

  it('stops preview only without stopping pose detection', async () => {
    // Start preview first
    await previewService.startPreview(mockVideoElement, mockCanvasElement)
    expect(previewService.isPreviewActive()).toBe(true)

    // Stop preview only (for seamless transition)
    previewService.stopPreviewOnly()

    expect(previewService.isPreviewActive()).toBe(false)
    expect(mockPoseService.stopPoseDetection).not.toHaveBeenCalled()
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ timestamp: expect.any(String) })
      })
    )
  })

  it('processes frame through pose service', () => {
    previewService.processFrame(mockVideoElement, mockCanvasElement)

    expect(mockPoseService.processFrame).toHaveBeenCalledWith(mockVideoElement, mockCanvasElement)
  })
})