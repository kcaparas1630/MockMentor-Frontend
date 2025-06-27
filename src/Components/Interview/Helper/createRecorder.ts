/**
 * @fileoverview Media recorder factory function for creating audio recording capabilities with speech optimization.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a factory function that creates MediaRecorder instances optimized for speech
 * recording and transcription. It handles audio track extraction, MIME type selection, and provides
 * a clean interface for recording operations. It plays a crucial role in interview recording and
 * audio processing for speech-to-text functionality.
 *
 * @see {@link src/Components/Interview/InterviewRoom/InterviewRoom.tsx}
 * @see {@link src/Hooks/useDetectAudio.ts}
 *
 * Dependencies:
 * - MediaRecorder API
 * - MediaStream API
 */

/**
 * Creates a MediaRecorder instance optimized for speech recording and transcription.
 *
 * @function
 * @param {MediaStream} stream - Media stream containing audio tracks to record.
 * @param {Function} onStop - Callback function called when recording stops with the recorded blob.
 * @param {Function} [onError] - Optional callback function for handling recording errors.
 * @returns {object} Recorder interface with start, stop, and state properties.
 * Example Return Value: `{ start: () => {}, stop: () => {}, state: "inactive" }`
 * @example
 * // Create recorder:
 * const recorder = createRecorder(stream, (blob) => {
 *   console.log('Recording completed:', blob);
 * }, (error) => {
 *   console.error('Recording error:', error);
 * });
 * 
 * // Start recording
 * recorder.start();
 * 
 * // Stop recording
 * recorder.stop();
 * 
 * // Check state
 * console.log('Recorder state:', recorder.state);
 *
 * @throws {Error} Calls onError callback if no audio tracks found or recording fails.
 * @remarks
 * Side Effects: 
 * - Creates MediaRecorder instance
 * - Extracts audio tracks from stream
 * - Manages recording chunks
 * - Handles blob creation
 *
 * Known Issues/Limitations:
 * - Requires browser support for MediaRecorder API
 * - Only records audio tracks (video ignored)
 * - Limited MIME type fallback options
 * - No recording quality configuration
 *
 * Design Decisions/Rationale:
 * - Extracts only audio tracks for speech optimization
 * - Uses Opus codec for better speech quality
 * - Provides fallback MIME types for compatibility
 * - Returns clean interface with state management
 */
export const createRecorder = (stream: MediaStream, onStop: (blob: Blob) => void, onError?: (err: Error) => void) => {
  let recorder: MediaRecorder | null = null;
  let chunks: BlobPart[] = [];
  let mimeType = "";

  // Extract only audio tracks from the stream for speech transcription
  const audioTracks = stream.getAudioTracks();

  if (audioTracks.length === 0) {
    onError?.(new Error("No audio tracks found in stream"));
    return {
      start: () => {},
      stop: () => {},
      get state() { return "stopped"; }
    };
  }

  // Create a new stream with only audio tracks
  const audioOnlyStream = new MediaStream(audioTracks);

  // Determine the best audio MIME type for speech recording
  if (MediaRecorder.isTypeSupported("audio/ogg; codecs=opus")) {
    mimeType = "audio/ogg; codecs=opus";
  } else if (MediaRecorder.isTypeSupported("audio/webm; codecs=opus")) {
    mimeType = "audio/webm; codecs=opus";
  } else {
    mimeType = "audio/wav";
  }

  recorder = new MediaRecorder(audioOnlyStream, { mimeType });

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    chunks = [];
    onStop(blob);
  };

  recorder.onerror = (event) => {
    if (onError) onError(new Error(`MediaRecorder error: ${event.error}`));
  };

  return {
    start: () => recorder.start(),
    stop: () => recorder && recorder.state === "recording" && recorder.stop(),
    get state() { return recorder?.state ?? "inactive" as RecordingState; }
  };
};
