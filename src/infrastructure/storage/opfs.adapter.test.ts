import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OPFSAdapter } from './opfs.adapter';
import { type WorkoutMetadata } from '@/domain/types/workout-storage.types';

// Mock OPFS APIs
const mockWritableStream = {
  write: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined)
} as unknown as WritableStream;

const mockFileHandle = {
  createWritable: vi.fn().mockResolvedValue(mockWritableStream),
  getFile: vi.fn().mockResolvedValue(new Blob(['dummy video content'], { type: 'video/webm' }))
};

const mockVideoFileHandle = {
  createWritable: vi.fn().mockResolvedValue(mockWritableStream),
  getFile: vi.fn().mockResolvedValue(new Blob(['dummy video content'], { type: 'video/webm' }))
};

const mockMetadataFileHandle = {
  createWritable: vi.fn().mockResolvedValue({
    write: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined)
  }),
  getFile: vi.fn().mockResolvedValue({
    text: vi.fn().mockResolvedValue(JSON.stringify({
      workoutId: 'workout_2024-07-01T10:30:00.000Z',
      startTime: '2024-07-01T10:30:00.000Z',
      endTime: '2024-07-01T10:45:30.000Z',
      duration: 930,
      totalReps: 45,
      rpm: 2.9,
      reps: [],
      videoSize: 15728640
    }))
  })
};

let shouldReturnEmptyList = false;

const mockDirectoryHandle = {
  getDirectoryHandle: vi.fn().mockImplementation((name) => {
    if (name === 'workout_with_bad_metadata') {
      return Promise.reject(new Error('Not found'));
    }
    return Promise.resolve(mockDirectoryHandle);
  }),
  getFileHandle: vi.fn().mockImplementation((name) => {
    if (name === 'metadata.json') {
      return Promise.resolve(mockMetadataFileHandle);
    }
    if (name === 'video.webm') {
      return Promise.resolve(mockVideoFileHandle);
    }
    return Promise.resolve(mockFileHandle);
  }),
  removeEntry: vi.fn().mockResolvedValue(undefined),
  entries: vi.fn().mockImplementation(async function* () {
    if (shouldReturnEmptyList) return;
    yield ['workout_2024-01-01', { kind: 'directory' }];
    yield ['workout_2024-01-02', { kind: 'directory' }];
  })
};

global.navigator = {
  ...global.navigator,
  storage: {
    getDirectory: vi.fn().mockResolvedValue(mockDirectoryHandle),
    estimate: vi.fn().mockResolvedValue({
      quota: 1024 * 1024 * 1024, // 1GB
      usage: 524 * 1024 * 1024   // 524MB
    })
  }
} as any;

describe('OPFSAdapter', () => {
  let adapter: OPFSAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new OPFSAdapter();
  });

  it('checks storage availability', async () => {
    const result = await adapter.checkStorageAvailable();
    
    expect(result).toEqual({
      available: expect.any(Boolean),
      spaceInMB: expect.any(Number)
    });
  });

  it('creates workout directory', async () => {
    const workoutId = 'workout_2024-07-01T10:30:00.000Z';
    
    await expect(adapter.createWorkoutDirectory(workoutId)).resolves.not.toThrow();
  });

  it('writes metadata json', async () => {
    const workoutId = 'workout_2024-07-01T10:30:00.000Z';
    const metadata: WorkoutMetadata = {
      workoutId,
      startTime: '2024-07-01T10:30:00.000Z',
      endTime: '2024-07-01T10:45:30.000Z',
      duration: 930,
      totalReps: 45,
      rpm: 2.9,
      reps: [
        { timestamp: 1234567890, hand: 'left' },
        { timestamp: 1234567892, hand: 'right' }
      ],
      videoSize: 15728640
    };
    
    await expect(adapter.writeMetadata(workoutId, metadata)).resolves.not.toThrow();
  });

  it('reads metadata json', async () => {
    const workoutId = 'workout_2024-07-01T10:30:00.000Z';
    
    const result = await adapter.readMetadata(workoutId);
    
    expect(result).toEqual(expect.objectContaining({
      workoutId: expect.any(String),
      startTime: expect.any(String),
      endTime: expect.any(String),
      duration: expect.any(Number),
      totalReps: expect.any(Number),
      rpm: expect.any(Number),
      reps: expect.any(Array),
      videoSize: expect.any(Number)
    }));
  });

  it('lists workout directories', async () => {
    const workouts = await adapter.listWorkouts();
    
    expect(workouts).toEqual(expect.any(Array));
    expect(workouts.every(id => typeof id === 'string')).toBe(true);
  });

  it('deletes workout and contents', async () => {
    const workoutId = 'workout_2024-07-01T10:30:00.000Z';
    
    await expect(adapter.deleteWorkout(workoutId)).resolves.not.toThrow();
  });

  it('handles missing directory', async () => {
    shouldReturnEmptyList = true;
    const workouts = await adapter.listWorkouts();
    
    expect(workouts).toEqual([]);
    shouldReturnEmptyList = false;
  });

  it('handles corrupted metadata', async () => {
    const workoutId = 'workout_with_bad_metadata';
    
    const result = await adapter.readMetadata(workoutId);
    
    expect(result).toBeNull();
  });

  it('gets video blob', async () => {
    const workoutId = 'workout_2024-07-01T10:30:00.000Z';
    
    const blob = await adapter.getVideoBlob(workoutId);
    
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('gets video file writer', async () => {
    const workoutId = 'workout_2024-07-01T10:30:00.000Z';
    
    const writer = await adapter.getVideoFileWriter(workoutId);
    
    expect(writer).toBeDefined();
    expect(typeof writer.write).toBe('function');
    expect(typeof writer.close).toBe('function');
  });
});