import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StopCameraUseCase } from './stop-camera-use-case'
import { cameraAdapter } from '@/infrastructure/adapters/camera.adapter'

vi.mock('@/infrastructure/adapters/camera.adapter')

describe('StopCameraUseCase', () => {
  let useCase: StopCameraUseCase
  const mockCameraAdapter = vi.mocked(cameraAdapter)

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new StopCameraUseCase(cameraAdapter)
  })

  it('stops camera adapter', () => {
    useCase.execute()

    expect(mockCameraAdapter.stop).toHaveBeenCalled()
  })
})