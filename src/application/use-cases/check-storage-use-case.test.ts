import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Mocked } from 'vitest'
import { CheckStorageUseCase } from './check-storage-use-case'
import { OPFSAdapter } from '@/infrastructure/storage/opfs.adapter'

// Mock dependencies
vi.mock('@/infrastructure/storage/opfs.adapter')

describe('CheckStorageUseCase', () => {
  let checkStorageUseCase: CheckStorageUseCase
  let mockOPFSAdapter: Mocked<OPFSAdapter>

  beforeEach(() => {
    mockOPFSAdapter = {
      checkStorageAvailable: vi.fn()
    } as Partial<OPFSAdapter> as Mocked<OPFSAdapter>

    checkStorageUseCase = new CheckStorageUseCase({
      opfsAdapter: mockOPFSAdapter
    })
  })

  describe('execute', () => {
    it('returns supported true when opfs available', async () => {
      // Arrange
      mockOPFSAdapter.checkStorageAvailable.mockResolvedValue({
        available: true,
        spaceInMB: 100
      })

      // Act
      const result = await checkStorageUseCase.execute()

      // Assert
      expect(result).toEqual({
        supported: true,
        availableSpaceMB: 100,
        hasMinimumSpace: true
      })
    })

    it('returns supported false when opfs unavailable', async () => {
      // Arrange
      mockOPFSAdapter.checkStorageAvailable.mockResolvedValue({
        available: false,
        spaceInMB: 0
      })

      // Act
      const result = await checkStorageUseCase.execute()

      // Assert
      expect(result).toEqual({
        supported: false,
        availableSpaceMB: 0,
        hasMinimumSpace: false
      })
    })

    it('checks minimum 50mb requirement', async () => {
      // Arrange - test with space below minimum
      mockOPFSAdapter.checkStorageAvailable.mockResolvedValue({
        available: true,
        spaceInMB: 30
      })

      // Act
      const result = await checkStorageUseCase.execute() // Uses default 50MB

      // Assert
      expect(result).toEqual({
        supported: true,
        availableSpaceMB: 30,
        hasMinimumSpace: false
      })
    })

    it('accepts custom minimum space requirement', async () => {
      // Arrange - test with custom minimum space
      mockOPFSAdapter.checkStorageAvailable.mockResolvedValue({
        available: true,
        spaceInMB: 30
      })

      // Act
      const result = await checkStorageUseCase.execute(25) // Custom 25MB minimum

      // Assert
      expect(result).toEqual({
        supported: true,
        availableSpaceMB: 30,
        hasMinimumSpace: true // 30 >= 25
      })
    })

  })
})