import { OPFSAdapter } from '@/infrastructure/storage/opfs.adapter'
import { VideoStreamWriter } from '@/infrastructure/storage/video-stream-writer'
import { WorkoutEntity } from '@/domain/entities/workout-entity'
import { WorkoutSummary } from '@/domain/types/workout-storage.types'

interface WorkoutStorageServiceDependencies {
  opfsAdapter: OPFSAdapter
  videoStreamWriter: VideoStreamWriter
}

export class WorkoutStorageService {
  constructor(private dependencies: WorkoutStorageServiceDependencies) {}

  async startVideoRecording(workout: WorkoutEntity, mediaStream: MediaStream): Promise<void> {
    await this.dependencies.opfsAdapter.createWorkoutDirectory(workout.id)
    const fileWriter = await this.dependencies.opfsAdapter.getVideoFileWriter(workout.id)
    
    await this.dependencies.videoStreamWriter.startRecording(
      mediaStream,
      fileWriter,
      {
        type: 'video/webm;codecs=vp8',
        bitrate: 2500000
      }
    )
  }

  async stopRecording(workout: WorkoutEntity): Promise<void> {
    const { sizeInBytes } = await this.dependencies.videoStreamWriter.stopRecording()
    const stats = workout.getStats()
    
    if (!stats.startTime || !stats.endTime) {
      throw new Error('Workout must have start and end times to save metadata')
    }
    
    const metadata = {
      workoutId: workout.id,
      startTime: stats.startTime.toISOString(),
      endTime: stats.endTime.toISOString(),
      duration: stats.elapsedTime,
      totalReps: stats.repCount,
      rpm: stats.averageRPM,
      reps: stats.reps.map((rep) => ({
        timestamp: rep.timestamp.getTime(),
        hand: rep.hand
      })),
      videoSize: sizeInBytes
    }

    await this.dependencies.opfsAdapter.writeMetadata(workout.id, metadata)
  }

  async getStoredWorkouts(): Promise<WorkoutSummary[]> {
    const workoutIds = await this.dependencies.opfsAdapter.listWorkouts()
    
    const workouts: WorkoutSummary[] = []
    for (const workoutId of workoutIds) {
      const metadata = await this.dependencies.opfsAdapter.readMetadata(workoutId)
      
      if (metadata) {
        const summary: WorkoutSummary = {
          workoutId: metadata.workoutId,
          startTime: new Date(metadata.startTime),
          endTime: new Date(metadata.endTime),
          duration: metadata.duration,
          totalReps: metadata.totalReps,
          rpm: metadata.rpm,
          videoSizeInMB: Math.round((metadata.videoSize / (1024 * 1024)) * 10) / 10
        }
        
        workouts.push(summary)
      }
    }
    
    // Sort by start time descending (newest first)
    return workouts.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  async getWorkoutVideo(workoutId: string): Promise<Blob> {
    return await this.dependencies.opfsAdapter.getVideoBlob(workoutId)
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    await this.dependencies.opfsAdapter.deleteWorkout(workoutId)
  }
}