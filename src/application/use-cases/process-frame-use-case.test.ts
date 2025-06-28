import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProcessFrameUseCase } from './process-frame-use-case'
import { predictionAdapter } from '@/infrastructure/adapters/prediction.adapter'
import { predictionRendererAdapter } from '@/infrastructure/adapters/prediction-renderer.adapter'

vi.mock('@/infrastructure/adapters/prediction.adapter')
vi.mock('@/infrastructure/adapters/prediction-renderer.adapter')

describe('ProcessFrameUseCase', () => {
  let useCase: ProcessFrameUseCase
  const mockPredictionAdapter = vi.mocked(predictionAdapter)
  const mockRendererAdapter = vi.mocked(predictionRendererAdapter)
  let mockVideoElement: HTMLVideoElement
  let mockCanvasElement: HTMLCanvasElement

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new ProcessFrameUseCase(predictionAdapter, predictionRendererAdapter)
    
    mockVideoElement = {} as HTMLVideoElement
    mockCanvasElement = {} as HTMLCanvasElement
  })

  it('processes frame when model ready', () => {
    const mockPrediction = { box: [0, 0, 100, 100], score: 0.8, keypoints: [] }
    const mockResult = { bestPrediction: mockPrediction }
    mockPredictionAdapter.isInitialized = vi.fn().mockReturnValue(true)
    mockPredictionAdapter.process = vi.fn().mockReturnValue(mockResult)
    mockRendererAdapter.render = vi.fn()

    useCase.execute(mockVideoElement, mockCanvasElement)

    expect(mockPredictionAdapter.process).toHaveBeenCalledWith(mockVideoElement)
    expect(mockRendererAdapter.render).toHaveBeenCalledWith({
      source: mockVideoElement,
      target: mockCanvasElement,
      prediction: mockPrediction,
      confidenceThreshold: 0.5
    })
  })

  it('renders poses to canvas', () => {
    const mockPrediction = { box: [0, 0, 100, 100], score: 0.8, keypoints: [] }
    const mockResult = { bestPrediction: mockPrediction }
    mockPredictionAdapter.isInitialized = vi.fn().mockReturnValue(true)
    mockPredictionAdapter.process = vi.fn().mockReturnValue(mockResult)
    mockRendererAdapter.render = vi.fn()

    useCase.execute(mockVideoElement, mockCanvasElement)

    expect(mockRendererAdapter.render).toHaveBeenCalledWith({
      source: mockVideoElement,
      target: mockCanvasElement,
      prediction: mockPrediction,
      confidenceThreshold: 0.5
    })
  })

  it('skips processing when model not ready', () => {
    mockPredictionAdapter.isInitialized = vi.fn().mockReturnValue(false)
    mockPredictionAdapter.process = vi.fn()
    mockRendererAdapter.render = vi.fn()

    useCase.execute(mockVideoElement, mockCanvasElement)

    expect(mockPredictionAdapter.process).not.toHaveBeenCalled()
    expect(mockRendererAdapter.render).not.toHaveBeenCalled()
  })
})