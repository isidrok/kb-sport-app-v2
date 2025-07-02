import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PredictionAdapter } from './prediction.adapter'
import * as tf from '@tensorflow/tfjs'
import type { GraphModel, Tensor3D } from '@tensorflow/tfjs'

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  loadGraphModel: vi.fn(),
  browser: {
    fromPixels: vi.fn()
  },
  slice: vi.fn(),
  sub: vi.fn(),
  div: vi.fn(),
  add: vi.fn(),
  squeeze: vi.fn(),
  concat: vi.fn(),
  tidy: vi.fn((fn) => fn()),
  zeros: vi.fn()
}))

describe('PredictionAdapter', () => {
  let adapter: PredictionAdapter
  let mockModel: Partial<GraphModel>
  let mockTensor: Partial<Tensor3D>

  beforeEach(() => {
    adapter = new PredictionAdapter()
    
    // Setup mock tensor
    mockTensor = {
      shape: [1, 640, 640, 3],
      transpose: vi.fn().mockReturnThis(),
      dataSync: vi.fn().mockReturnValue(new Float32Array([0.5])),
      expandDims: vi.fn().mockReturnThis(),
      toFloat: vi.fn().mockReturnThis(),
      div: vi.fn().mockReturnThis(),
      pad: vi.fn().mockReturnThis(),
      resizeBilinear: vi.fn().mockReturnThis(),
      dispose: vi.fn()
    } as any

    // Setup mock model
    mockModel = {
      predict: vi.fn().mockReturnValue(mockTensor),
      dispose: vi.fn(),
      inputs: [{
        shape: [1, 640, 640, 3] as (number | null)[]
      }]
    } as any

    // Configure mocks
    vi.mocked(tf.loadGraphModel).mockResolvedValue(mockModel as GraphModel)
    vi.mocked(tf.browser.fromPixels).mockReturnValue(mockTensor as any)
    vi.mocked(tf.slice).mockReturnValue(mockTensor as any)
    vi.mocked(tf.squeeze).mockReturnValue(mockTensor as any)
    vi.mocked(tf.concat).mockReturnValue(mockTensor as any)
    vi.mocked(tf.zeros).mockReturnValue(mockTensor as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialize', () => {
    it('loads the model from the correct URL', async () => {
      await adapter.initialize()

      expect(tf.loadGraphModel).toHaveBeenCalledWith(
        expect.stringContaining('models/yolov8n-pose_web_model/model.json')
      )
    })

    it('warms up the model after loading', async () => {
      await adapter.initialize()

      // Verify warm-up inference was performed
      expect(mockModel.predict).toHaveBeenCalled()
      expect(tf.zeros).toHaveBeenCalledWith([640, 640, 3])
    })

    it('disposes warm-up tensors to prevent memory leaks', async () => {
      await adapter.initialize()

      // Verify tensors were disposed
      expect(mockTensor.dispose).toHaveBeenCalled()
    })
  })

  describe('process', () => {
    it('throws error if model not initialized', () => {
      const mockVideo = {
        srcObject: {}
      } as HTMLVideoElement

      expect(() => adapter.process(mockVideo)).toThrow(
        'Model not initialized. Call initialize() first.'
      )
    })

    it('returns null if video has no source', async () => {
      await adapter.initialize()
      
      const mockVideo = {
        srcObject: null
      } as HTMLVideoElement

      const result = adapter.process(mockVideo)
      
      expect(result).toBeNull()
    })

    it('processes video and returns prediction result', async () => {
      await adapter.initialize()
      
      const mockVideo = {
        srcObject: {},
        videoWidth: 1920,
        videoHeight: 1080
      } as HTMLVideoElement

      const result = adapter.process(mockVideo)
      
      expect(result).toBeDefined()
      expect(result?.bestPrediction).toHaveProperty('box')
      expect(result?.bestPrediction).toHaveProperty('score')
      expect(result?.bestPrediction).toHaveProperty('keypoints')
      expect(result?.transformParams).toHaveProperty('scale')
      expect(result?.transformParams).toHaveProperty('xOffset')
      expect(result?.transformParams).toHaveProperty('yOffset')
    })
  })

  describe('isInitialized', () => {
    it('returns false when model is not loaded', () => {
      expect(adapter.isInitialized()).toBe(false)
    })

    it('returns true after initialization', async () => {
      await adapter.initialize()
      
      expect(adapter.isInitialized()).toBe(true)
    })
  })

  describe('dispose', () => {
    it('disposes the model and resets state', async () => {
      await adapter.initialize()
      
      adapter.dispose()
      
      expect(mockModel.dispose).toHaveBeenCalled()
      expect(adapter.isInitialized()).toBe(false)
    })

    it('handles dispose when not initialized', () => {
      expect(() => adapter.dispose()).not.toThrow()
    })
  })
})