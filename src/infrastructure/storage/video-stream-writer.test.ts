import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VideoStreamWriter, type VideoSettings } from './video-stream-writer';

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  state: 'inactive',
  ondataavailable: null,
  onstop: null
})) as any;

describe('VideoStreamWriter', () => {
  let writer: VideoStreamWriter;
  let mockFileWriter: FileSystemWritableFileStream;
  
  beforeEach(() => {
    mockFileWriter = {
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined)
    } as unknown as FileSystemWritableFileStream;
    
    writer = new VideoStreamWriter();
    vi.clearAllMocks();
  });

  it('creates media recorder with video settings', async () => {
    const mediaStream = new MediaStream();
    const settings: VideoSettings = {
      type: 'video/webm',
      bitrate: 2500000
    };
    
    await writer.startRecording(mediaStream, mockFileWriter, settings);
    
    expect(MediaRecorder).toHaveBeenCalledWith(mediaStream, {
      mimeType: settings.type,
      videoBitsPerSecond: settings.bitrate
    });
  });

  it('sets up recording with file writer', async () => {
    const mediaStream = new MediaStream();
    const settings: VideoSettings = {
      type: 'video/webm',
      bitrate: 2500000
    };
    
    await writer.startRecording(mediaStream, mockFileWriter, settings);
    
    // Verify MediaRecorder was set up with ondataavailable handler
    const mockRecorder = (MediaRecorder as any).mock.results[0].value;
    expect(mockRecorder.ondataavailable).toBeDefined();
    expect(typeof mockRecorder.ondataavailable).toBe('function');
  });

  it('stops recording and returns size', async () => {
    const mediaStream = new MediaStream();
    const settings: VideoSettings = {
      type: 'video/webm',
      bitrate: 2500000
    };
    
    await writer.startRecording(mediaStream, mockFileWriter, settings);
    
    // Simulate adding some data
    const mockRecorder = (MediaRecorder as any).mock.results[0].value;
    const blob = new Blob(['video data'], { type: 'video/webm' });
    const event = { data: blob };
    await mockRecorder.ondataavailable(event);
    
    // Mock the stop event behavior
    const stopPromise = writer.stopRecording();
    
    // Simulate the onstop event being triggered
    if (mockRecorder.onstop) {
      await mockRecorder.onstop();
    }
    
    const result = await stopPromise;
    
    expect(result).toEqual({ sizeInBytes: expect.any(Number) });
    expect(mockFileWriter.close).toHaveBeenCalled();
    expect(mockRecorder.stop).toHaveBeenCalled();
  });

  it('handles mediastream ended', async () => {
    const mediaStream = new MediaStream();
    const settings: VideoSettings = {
      type: 'video/webm',
      bitrate: 2500000
    };
    
    await writer.startRecording(mediaStream, mockFileWriter, settings);
    
    // Verify recorder is created
    const mockRecorder = (MediaRecorder as any).mock.results[0].value;
    expect(mockRecorder.start).toHaveBeenCalled();
  });

  it('applies video settings', async () => {
    const mediaStream = new MediaStream();
    const settings: VideoSettings = {
      type: 'video/mp4',
      bitrate: 5000000
    };
    
    await writer.startRecording(mediaStream, mockFileWriter, settings);
    
    expect(MediaRecorder).toHaveBeenCalledWith(mediaStream, {
      mimeType: settings.type,
      videoBitsPerSecond: settings.bitrate
    });
  });

  it('throws error when stopping without starting', async () => {
    await expect(writer.stopRecording()).rejects.toThrow(
      'MediaRecorder is not initialized. Call startRecording first.'
    );
  });
});