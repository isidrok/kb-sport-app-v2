import { OPFSAdapter, opfsAdapter } from '@/infrastructure/storage/opfs.adapter'

interface CheckStorageUseCaseDependencies {
  opfsAdapter: OPFSAdapter
}

export interface StorageStatus {
  supported: boolean
  availableSpaceMB: number
  hasMinimumSpace: boolean
}

export class CheckStorageUseCase {
  constructor(private dependencies: CheckStorageUseCaseDependencies) {}

  async execute(minimumSpaceMB: number = 50): Promise<StorageStatus> {
    const { available, spaceInMB } = await this.dependencies.opfsAdapter.checkStorageAvailable()

    return {
      supported: available,
      availableSpaceMB: spaceInMB,
      hasMinimumSpace: spaceInMB >= minimumSpaceMB
    }
  }
}

// Export singleton instance
export const checkStorageUseCase = new CheckStorageUseCase({
  opfsAdapter
})