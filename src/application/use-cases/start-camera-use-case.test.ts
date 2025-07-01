import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StartCameraUseCase } from './start-camera-use-case'
import { CameraAccessEvent } from '@/application/events/camera-access-event'
import { eventBus } from '@/infrastructure/event-bus/event-bus'
import { cameraAdapter } from '@/infrastructure/adapters/camera.adapter'

vi.mock('@/infrastructure/event-bus/event-bus')
vi.mock('@/infrastructure/adapters/camera.adapter')

describe('StartCameraUseCase', () => {
  let useCase: StartCameraUseCase
  const mockEventBus = vi.mocked(eventBus)
  const mockCameraAdapter = vi.mocked(cameraAdapter)
  let mockVideoElement: HTMLVideoElement

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new StartCameraUseCase(cameraAdapter, eventBus)
    
    mockVideoElement = {} as HTMLVideoElement
  })

  it('publishes requesting camera event on start', async () => {
    mockCameraAdapter.start.mockResolvedValue(undefined)
    mockCameraAdapter.getStream.mockReturnValue({} as MediaStream)

    await useCase.execute(mockVideoElement)

    expect(mockEventBus.publish).toHaveBeenCalledTimes(2)
    
    const firstCall = mockEventBus.publish.mock.calls[0]
    const event = firstCall[0]
    
    expect(event).toBeInstanceOf(CameraAccessEvent)
    expect(event.data.status).toBe('requesting')
  })

  it('starts camera and publishes ready event', async () => {
    mockCameraAdapter.start.mockResolvedValue(undefined)
    mockCameraAdapter.getStream.mockReturnValue({} as MediaStream)

    await useCase.execute(mockVideoElement)

    expect(mockCameraAdapter.start).toHaveBeenCalledWith(mockVideoElement)
    expect(mockEventBus.publish).toHaveBeenCalledTimes(2)
    
    const secondCall = mockEventBus.publish.mock.calls[1]
    const event = secondCall[0]
    
    expect(event).toBeInstanceOf(CameraAccessEvent)
    expect(event.data.status).toBe('ready')
  })

  it('publishes error event on camera access denied', async () => {
    const error = new Error('Camera access denied')
    mockCameraAdapter.start.mockRejectedValue(error)

    await expect(useCase.execute(mockVideoElement)).rejects.toThrow('Camera access denied')

    expect(mockEventBus.publish).toHaveBeenCalledTimes(2)
    
    const secondCall = mockEventBus.publish.mock.calls[1]
    const event = secondCall[0]
    
    expect(event).toBeInstanceOf(CameraAccessEvent)
    expect(event.data.status).toBe('error')
    expect(event.data.message).toBe('Camera access denied')
  })
})