import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Mocked } from 'vitest'
import { WorkoutStorageService } from './workout-storage.service'
import { OPFSAdapter } from '@/infrastructure/storage/opfs.adapter'
import { VideoStreamWriter } from '@/infrastructure/storage/video-stream-writer'
import { WorkoutEntity } from '@/domain/entities/workout-entity'

// Mock dependencies
vi.mock('@/infrastructure/storage/opfs.adapter')
vi.mock('@/infrastructure/storage/video-stream-writer')

describe('WorkoutStorageService', () => {
  let workoutStorageService: WorkoutStorageService
  let mockOPFSAdapter: Mocked<OPFSAdapter>
  let mockVideoStreamWriter: Mocked<VideoStreamWriter>

  beforeEach(() => {
    mockOPFSAdapter = {
      checkStorageAvailable: vi.fn(),
      createWorkoutDirectory: vi.fn(),
      writeMetadata: vi.fn(),
      readMetadata: vi.fn(),
      listWorkouts: vi.fn(),
      getVideoBlob: vi.fn(),
      deleteWorkout: vi.fn(),
      getVideoFileWriter: vi.fn()
    } as Partial<OPFSAdapter> as Mocked<OPFSAdapter>

    mockVideoStreamWriter = {
      startRecording: vi.fn(),
      stopRecording: vi.fn()
    } as Partial<VideoStreamWriter> as Mocked<VideoStreamWriter>

    workoutStorageService = new WorkoutStorageService({
      opfsAdapter: mockOPFSAdapter,
      videoStreamWriter: mockVideoStreamWriter
    })
  })

  describe('startVideoRecording', () => {
    it('starts video recording with configured quality', async () => {
      // Arrange
      const mockWorkout = {
        id: 'workout_2024-07-01T10:30:00.000Z'
      } as Partial<WorkoutEntity> as WorkoutEntity
      const mockMediaStream = {} as MediaStream
      const mockFileWriter = {} as FileSystemWritableFileStream
      
      mockOPFSAdapter.createWorkoutDirectory.mockResolvedValue()
      mockOPFSAdapter.getVideoFileWriter.mockResolvedValue(mockFileWriter)

      // Act
      await workoutStorageService.startVideoRecording(mockWorkout, mockMediaStream)

      // Assert
      expect(mockOPFSAdapter.createWorkoutDirectory).toHaveBeenCalledWith('workout_2024-07-01T10:30:00.000Z')
      expect(mockOPFSAdapter.getVideoFileWriter).toHaveBeenCalledWith('workout_2024-07-01T10:30:00.000Z')
      expect(mockVideoStreamWriter.startRecording).toHaveBeenCalledWith(
        mockMediaStream,
        mockFileWriter,
        {
          type: 'video/webm;codecs=vp8',
          bitrate: 2500000
        }
      )
    })
  })

  describe('stopRecording', () => {
    it('stops recording and saves metadata', async () => {
      // Arrange
      const mockWorkout = {
        id: 'workout_2024-07-01T10:30:00.000Z',
        getStats: vi.fn().mockReturnValue({
          startTime: new Date('2024-07-01T10:30:00.000Z'),
          endTime: new Date('2024-07-01T10:45:30.000Z'),
          elapsedTime: 930000,
          repCount: 45,
          averageRPM: 2.9,
          reps: [
            { timestamp: new Date(1234567890), hand: 'left' },
            { timestamp: new Date(1234567892), hand: 'right' }
          ]
        })
      } as Partial<WorkoutEntity> as WorkoutEntity

      mockVideoStreamWriter.stopRecording.mockResolvedValue({ sizeInBytes: 15728640 })

      // Act
      await workoutStorageService.stopRecording(mockWorkout)

      // Assert
      expect(mockVideoStreamWriter.stopRecording).toHaveBeenCalled()
      expect(mockOPFSAdapter.writeMetadata).toHaveBeenCalledWith('workout_2024-07-01T10:30:00.000Z', {
        workoutId: 'workout_2024-07-01T10:30:00.000Z',
        startTime: '2024-07-01T10:30:00.000Z',
        endTime: '2024-07-01T10:45:30.000Z',
        duration: 930000,
        totalReps: 45,
        rpm: 2.9,
        reps: [
          { timestamp: 1234567890, hand: 'left' },
          { timestamp: 1234567892, hand: 'right' }
        ],
        videoSize: 15728640
      })
    })

    it('transforms workout stats to metadata', async () => {
      // Arrange
      const mockWorkout = {
        id: 'workout_2024-07-01T10:30:00.000Z',
        getStats: vi.fn().mockReturnValue({
          startTime: new Date('2024-07-01T10:30:00.000Z'),
          endTime: new Date('2024-07-01T10:45:30.000Z'),
          elapsedTime: 930000,
          repCount: 45,
          averageRPM: 2.9,
          reps: [
            { timestamp: new Date(1234567890), hand: 'left' },
            { timestamp: new Date(1234567892), hand: 'right' }
          ]
        })
      } as Partial<WorkoutEntity> as WorkoutEntity

      mockVideoStreamWriter.stopRecording.mockResolvedValue({ sizeInBytes: 15728640 })

      // Act
      await workoutStorageService.stopRecording(mockWorkout)

      // Assert - verify transformation of Date objects to ISO strings
      expect(mockOPFSAdapter.writeMetadata).toHaveBeenCalledWith('workout_2024-07-01T10:30:00.000Z', {
        workoutId: 'workout_2024-07-01T10:30:00.000Z',
        startTime: '2024-07-01T10:30:00.000Z',
        endTime: '2024-07-01T10:45:30.000Z',
        duration: 930000,
        totalReps: 45,
        rpm: 2.9,
        reps: [
          { timestamp: 1234567890, hand: 'left' },
          { timestamp: 1234567892, hand: 'right' }
        ],
        videoSize: 15728640
      })
    })
  })

  describe('getStoredWorkouts', () => {
    it('retrieves workout summaries', async () => {
      // Arrange
      const workoutIds = ['workout_2024-07-01T10:30:00.000Z', 'workout_2024-07-01T14:00:00.000Z']
      const metadata1 = {
        workoutId: 'workout_2024-07-01T10:30:00.000Z',
        startTime: '2024-07-01T10:30:00.000Z',
        endTime: '2024-07-01T10:45:30.000Z',
        duration: 930,
        totalReps: 45,
        rpm: 2.9,
        reps: [],
        videoSize: 15728640
      }
      const metadata2 = {
        workoutId: 'workout_2024-07-01T14:00:00.000Z',
        startTime: '2024-07-01T14:00:00.000Z',
        endTime: '2024-07-01T14:20:00.000Z',
        duration: 1200,
        totalReps: 60,
        rpm: 3.0,
        reps: [],
        videoSize: 20971520
      }

      mockOPFSAdapter.listWorkouts.mockResolvedValue(workoutIds)
      mockOPFSAdapter.readMetadata.mockResolvedValueOnce(metadata1)
      mockOPFSAdapter.readMetadata.mockResolvedValueOnce(metadata2)

      // Act
      const workouts = await workoutStorageService.getStoredWorkouts()

      // Assert - newest workout should come first
      expect(workouts).toEqual([
        {
          workoutId: 'workout_2024-07-01T14:00:00.000Z',
          startTime: new Date('2024-07-01T14:00:00.000Z'),
          endTime: new Date('2024-07-01T14:20:00.000Z'),
          duration: 1200,
          totalReps: 60,
          rpm: 3.0,
          videoSizeInMB: 20.0
        },
        {
          workoutId: 'workout_2024-07-01T10:30:00.000Z',
          startTime: new Date('2024-07-01T10:30:00.000Z'),
          endTime: new Date('2024-07-01T10:45:30.000Z'),
          duration: 930,
          totalReps: 45,
          rpm: 2.9,
          videoSizeInMB: 15.0
        }
      ])
    })

    it('sorts workouts by date descending', async () => {
      // Arrange
      const workoutIds = ['workout_2024-07-01T10:30:00.000Z', 'workout_2024-07-01T14:00:00.000Z']
      const metadata1 = {
        workoutId: 'workout_2024-07-01T10:30:00.000Z',
        startTime: '2024-07-01T10:30:00.000Z',
        endTime: '2024-07-01T10:45:30.000Z',
        duration: 930,
        totalReps: 45,
        rpm: 2.9,
        reps: [],
        videoSize: 15728640
      }
      const metadata2 = {
        workoutId: 'workout_2024-07-01T14:00:00.000Z',
        startTime: '2024-07-01T14:00:00.000Z',
        endTime: '2024-07-01T14:20:00.000Z',
        duration: 1200,
        totalReps: 60,
        rpm: 3.0,
        reps: [],
        videoSize: 20971520
      }

      mockOPFSAdapter.listWorkouts.mockResolvedValue(workoutIds)
      mockOPFSAdapter.readMetadata.mockResolvedValueOnce(metadata1)
      mockOPFSAdapter.readMetadata.mockResolvedValueOnce(metadata2)

      // Act
      const workouts = await workoutStorageService.getStoredWorkouts()

      // Assert - verify newer workout comes first
      expect(workouts[0].startTime.getTime()).toBeGreaterThan(workouts[1].startTime.getTime())
      expect(workouts[0].workoutId).toBe('workout_2024-07-01T14:00:00.000Z')
      expect(workouts[1].workoutId).toBe('workout_2024-07-01T10:30:00.000Z')
    })

    it('calculates video size in mb', async () => {
      // Arrange
      const workoutIds = ['workout_2024-07-01T10:30:00.000Z']
      const metadata = {
        workoutId: 'workout_2024-07-01T10:30:00.000Z',
        startTime: '2024-07-01T10:30:00.000Z',
        endTime: '2024-07-01T10:45:30.000Z',
        duration: 930,
        totalReps: 45,
        rpm: 2.9,
        reps: [],
        videoSize: 15728640 // 15MB in bytes
      }

      mockOPFSAdapter.listWorkouts.mockResolvedValue(workoutIds)
      mockOPFSAdapter.readMetadata.mockResolvedValue(metadata)

      // Act
      const workouts = await workoutStorageService.getStoredWorkouts()

      // Assert
      expect(workouts[0].videoSizeInMB).toBe(15.0)
    })
  })

  describe('getWorkoutVideo', () => {
    it('retrieves video blob from storage', async () => {
      // Arrange
      const workoutId = 'workout_2024-07-01T10:30:00.000Z'
      const mockBlob = new Blob(['video data'], { type: 'video/webm' })
      
      mockOPFSAdapter.getVideoBlob.mockResolvedValue(mockBlob)

      // Act
      const result = await workoutStorageService.getWorkoutVideo(workoutId)

      // Assert
      expect(mockOPFSAdapter.getVideoBlob).toHaveBeenCalledWith(workoutId)
      expect(result).toBe(mockBlob)
    })
  })

  describe('deleteWorkout', () => {
    it('deletes workout from storage', async () => {
      // Arrange
      const workoutId = 'workout_2024-07-01T10:30:00.000Z'
      
      mockOPFSAdapter.deleteWorkout.mockResolvedValue()

      // Act
      await workoutStorageService.deleteWorkout(workoutId)

      // Assert
      expect(mockOPFSAdapter.deleteWorkout).toHaveBeenCalledWith(workoutId)
    })
  })
})