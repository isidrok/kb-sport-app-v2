import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoadModelUseCase } from './load-model-use-case'
import { ModelLoadingEvent } from '@/application/events/model-loading-event'
import { eventBus } from '@/infrastructure/event-bus/event-bus'
import { predictionAdapter } from '@/infrastructure/adapters/prediction.adapter'

vi.mock('@/infrastructure/event-bus/event-bus')
vi.mock('@/infrastructure/adapters/prediction.adapter')

describe('LoadModelUseCase', () => {
  let useCase: LoadModelUseCase
  const mockEventBus = vi.mocked(eventBus)
  const mockPredictionAdapter = vi.mocked(predictionAdapter)

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new LoadModelUseCase(predictionAdapter, eventBus)
  })

  it('publishes loading event on start', async () => {
    mockPredictionAdapter.initialize.mockResolvedValue(undefined)

    await useCase.execute()

    expect(mockEventBus.publish).toHaveBeenCalledTimes(2)
    
    const firstCall = mockEventBus.publish.mock.calls[0]
    const event = firstCall[0]
    
    expect(event).toBeInstanceOf(ModelLoadingEvent)
    expect(event.data.status).toBe('loading')
  })

  it('publishes ready event on success', async () => {
    mockPredictionAdapter.initialize.mockResolvedValue(undefined)

    await useCase.execute()

    expect(mockEventBus.publish).toHaveBeenCalledTimes(2)
    
    const secondCall = mockEventBus.publish.mock.calls[1]
    const event = secondCall[0]
    
    expect(event).toBeInstanceOf(ModelLoadingEvent)
    expect(event.data.status).toBe('ready')
  })

  it('publishes error event on failure', async () => {
    const error = new Error('Failed to load model')
    mockPredictionAdapter.initialize.mockRejectedValue(error)

    await expect(useCase.execute()).rejects.toThrow('Failed to load model')

    expect(mockEventBus.publish).toHaveBeenCalledTimes(2)
    
    const secondCall = mockEventBus.publish.mock.calls[1]
    const event = secondCall[0]
    
    expect(event).toBeInstanceOf(ModelLoadingEvent)
    expect(event.data.status).toBe('error')
    expect(event.data.message).toBe('Failed to load model')
  })

  it('initializes prediction adapter', async () => {
    mockPredictionAdapter.initialize.mockResolvedValue(undefined)

    await useCase.execute()

    expect(mockPredictionAdapter.initialize).toHaveBeenCalled()
  })
})