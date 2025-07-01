import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest'
import { PoseService } from './pose.service'
import type { StartCameraUseCase } from '@/application/use-cases/start-camera-use-case'
import type { StopCameraUseCase } from '@/application/use-cases/stop-camera-use-case'
import type { ProcessFrameUseCase } from '@/application/use-cases/process-frame-use-case'
import type { PredictionRendererAdapter } from '@/infrastructure/adapters/prediction-renderer.adapter'

describe('PoseService', () => {
  let poseService: PoseService
  let mockStartCameraUseCase: Mocked<StartCameraUseCase>
  let mockStopCameraUseCase: Mocked<StopCameraUseCase>
  let mockProcessFrameUseCase: Mocked<ProcessFrameUseCase>
  let mockRendererAdapter: Mocked<PredictionRendererAdapter>
  let mockVideoElement: HTMLVideoElement
  let mockCanvasElement: HTMLCanvasElement

  beforeEach(() => {
    mockStartCameraUseCase = {
      execute: vi.fn().mockResolvedValue({} as MediaStream)
    } as Partial<StartCameraUseCase> as Mocked<StartCameraUseCase>

    mockStopCameraUseCase = {
      execute: vi.fn()
    } as Partial<StopCameraUseCase> as Mocked<StopCameraUseCase>

    mockProcessFrameUseCase = {
      execute: vi.fn()
    } as Partial<ProcessFrameUseCase> as Mocked<ProcessFrameUseCase>

    mockRendererAdapter = {
      clear: vi.fn()
    } as Partial<PredictionRendererAdapter> as Mocked<PredictionRendererAdapter>

    poseService = new PoseService({
      startCameraUseCase: mockStartCameraUseCase,
      stopCameraUseCase: mockStopCameraUseCase,
      processFrameUseCase: mockProcessFrameUseCase,
      rendererAdapter: mockRendererAdapter
    })

    mockVideoElement = {
      getBoundingClientRect: vi.fn().mockReturnValue({ width: 640, height: 480 }),
      width: 0,
      height: 0
    } as unknown as HTMLVideoElement

    mockCanvasElement = {
      getBoundingClientRect: vi.fn().mockReturnValue({ width: 640, height: 480 }),
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({
        clearRect: vi.fn()
      })
    } as unknown as HTMLCanvasElement
  })

  it('sets element dimensions before camera start', async () => {
    await poseService.startPoseDetection(mockVideoElement, mockCanvasElement)

    expect(mockVideoElement.width).toBe(640)
    expect(mockVideoElement.height).toBe(480)
    expect(mockCanvasElement.width).toBe(640)
    expect(mockCanvasElement.height).toBe(480)
  })

  it('starts camera with video element', async () => {
    await poseService.startPoseDetection(mockVideoElement, mockCanvasElement)

    expect(mockStartCameraUseCase.execute).toHaveBeenCalledWith(mockVideoElement)
  })

  it('stops camera and clears canvas', () => {
    poseService.stopPoseDetection(mockCanvasElement)

    expect(mockStopCameraUseCase.execute).toHaveBeenCalled()
    expect(mockRendererAdapter.clear).toHaveBeenCalledWith(mockCanvasElement)
  })

  it('delegates frame processing', () => {
    poseService.processFrame(mockVideoElement, mockCanvasElement)

    expect(mockProcessFrameUseCase.execute).toHaveBeenCalledWith(mockVideoElement, mockCanvasElement)
  })

  it('tracks active state', async () => {
    expect(poseService.isActive()).toBe(false)

    await poseService.startPoseDetection(mockVideoElement, mockCanvasElement)
    expect(poseService.isActive()).toBe(true)

    poseService.stopPoseDetection()
    expect(poseService.isActive()).toBe(false)
  })

  it('handles camera start errors', async () => {
    const error = new Error('Camera access denied')
    mockStartCameraUseCase.execute.mockRejectedValueOnce(error)

    await expect(poseService.startPoseDetection(mockVideoElement, mockCanvasElement)).rejects.toThrow('Camera access denied')
    expect(poseService.isActive()).toBe(false)
  })

  it('does not start camera again when already active for seamless transitions', async () => {
    // First call should start camera
    await poseService.startPoseDetection(mockVideoElement, mockCanvasElement)
    expect(mockStartCameraUseCase.execute).toHaveBeenCalledTimes(1)
    expect(poseService.isActive()).toBe(true)

    // Second call should not start camera again
    await poseService.startPoseDetection(mockVideoElement, mockCanvasElement)
    expect(mockStartCameraUseCase.execute).toHaveBeenCalledTimes(1) // Still only called once
    expect(poseService.isActive()).toBe(true)
  })

  it('stores and provides access to media stream', async () => {
    const mockStream = {} as MediaStream
    mockStartCameraUseCase.execute.mockResolvedValue(mockStream)

    // Initially no stream
    expect(poseService.getMediaStream()).toBeNull()

    // After starting, stream should be available
    await poseService.startPoseDetection(mockVideoElement, mockCanvasElement)
    expect(poseService.getMediaStream()).toBe(mockStream)

    // After stopping, stream should be cleared
    poseService.stopPoseDetection()
    expect(poseService.getMediaStream()).toBeNull()
  })

  it('maintains stream during seamless transitions', async () => {
    const mockStream = {} as MediaStream
    mockStartCameraUseCase.execute.mockResolvedValue(mockStream)

    // Start first session
    await poseService.startPoseDetection(mockVideoElement, mockCanvasElement)
    expect(poseService.getMediaStream()).toBe(mockStream)

    // Start again without stopping (seamless transition)
    await poseService.startPoseDetection(mockVideoElement, mockCanvasElement)
    expect(poseService.getMediaStream()).toBe(mockStream) // Stream should persist
    expect(mockStartCameraUseCase.execute).toHaveBeenCalledTimes(1) // Camera not restarted
  })
})