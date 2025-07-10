/**
 * @fileoverview Custom hook for voice activity detection with noise suppression and real-time audio analysis.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a sophisticated voice activity detection hook that uses Web Audio API,
 * noise suppression algorithms, and amplitude analysis to detect when a user is speaking.
 * It provides real-time speech detection with configurable thresholds and silence intervals.
 * It plays a crucial role in interview recording automation and audio processing.
 *
 * @see {@link src/Components/Interview/InterviewRoom/InterviewRoom.tsx}
 * @see {@link src/Components/Interview/Helper/createRecorder.ts}
 *
 * Dependencies:
 * - React
 * - Web Audio API
 * - @sapphi-red/web-noise-suppressor
 */

/**
 * Custom hook for voice activity detection on audio streams.
 * Uses noise suppression and amplitude analysis to detect speech.
 * @returns {UseDetectAudioReturn} Object with startDetectingAudio and stopDetectingAudio methods
 */

import { useCallback, useRef } from "react";
import {
  loadRnnoise,
  RnnoiseWorkletNode,
  NoiseGateWorkletNode,
} from "@sapphi-red/web-noise-suppressor";
import noiseGateWorkletPath from "@sapphi-red/web-noise-suppressor/noiseGateWorklet.js?url";
import rnnoiseWorkletPath from "@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url";
import rnnoiseWasmPath from "@sapphi-red/web-noise-suppressor/rnnoise.wasm?url";
import rnnoiseWasmSimdPath from "@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url";

/**
 * Interface for voice activity detection hook return value.
 * @interface UseDetectAudioReturn
 * @property {Function} startDetectingAudio - Function to start audio detection.
 * @property {Function} stopDetectingAudio - Function to stop audio detection.
 */
interface UseDetectAudioReturn {
  startDetectingAudio: (
    stream: MediaStream,
    onSpeakingChange?: (isSpeaking: boolean) => void,
    onAudioChunk?: (chunk: string) => void
  ) => Promise<void>;
  stopDetectingAudio: () => void;
}

/**
 * Custom hook for voice activity detection with noise suppression and real-time analysis.
 *
 * @function
 * @returns {UseDetectAudioReturn} Object containing audio detection methods.
 * @example
 * // Usage in components:
 * const { startDetectingAudio, stopDetectingAudio } = useDetectAudio();
 *
 * // Start detection with callback
 * await startDetectingAudio(stream, (isSpeaking) => {
 *   console.log('User is speaking:', isSpeaking);
 * });
 *
 * // Stop detection
 * stopDetectingAudio();
 *
 * @throws {Error} Logs errors to console but doesn't throw.
 * @remarks
 * Side Effects:
 * - Creates Web Audio API context
 * - Loads WASM binaries and worklets
 * - Processes audio stream in real-time
 * - Manages audio node connections
 *
 * Known Issues/Limitations:
 * - Requires browser support for Web Audio API
 * - WASM loading may fail in some environments
 * - Performance intensive on low-end devices
 * - No fallback for unsupported browsers
 *
 * Design Decisions/Rationale:
 * - Uses useRef for stable references across renders
 * - Implements noise suppression for better accuracy
 * - Uses requestAnimationFrame for performance
 * - Pre-allocates arrays to reduce GC pressure
 */
export const useDetectAudio = (): UseDetectAudioReturn => {
  // REFERENCES TO AUDIO
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Audio Streaming Refs
  const streamingRecorderRef = useRef<MediaRecorder | null>(null);
  const isStreamingRef = useRef<boolean>(false);

  // State management Refs
  const stateRef = useRef<{
    isSpeaking: boolean;
    silenceStartTime: number;
  }>({
    isSpeaking: false,
    silenceStartTime: 0,
  });
  const speakingChangeCallbackRef = useRef<
    ((isSpeaking: boolean) => void) | null
  >(null);
  const audioChunkCallbackRef = useRef<((chunk: string) => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio processing nodes
  const rrnoiseRef = useRef<RnnoiseWorkletNode | null>(null);
  const noiseGateRef = useRef<NoiseGateWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Pre-allocate arrays to avoid GC pressure
  const timeDataArrayRef = useRef<Uint8Array | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);

  // CONSTANTS
  const VAD_THRESHOLD: number = 15; // Threshold for minimum amplitude before it's considered voice
  const ANALYSIS_INTERVAL_MS: number = 50;
  const SILENCE_INTERVAL_MS: number = 800; // 800 ms of silence before considering user stopped speaking
  const CHUNK_DURATION_MS: number = 1000; // 1 second of audio chunk

  /**
   * Creates a streaming recorder for the audio stream.
   * @param {MediaStream} stream - The audio stream to record.
   * @returns {MediaRecorder} The media recorder instance.
   */
  const createStreamingRecorder = useCallback(
    (stream: MediaStream): MediaRecorder => {
      // Only use audio tracks for the recorder
      const audioOnlyStream = new MediaStream(stream.getAudioTracks());
      const options: MediaRecorderOptions = {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 16000,
      };
      const recorder = new MediaRecorder(audioOnlyStream, options);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && audioChunkCallbackRef.current) {
          // convert to base64 and send immediately
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = reader.result as string;
            const base64Audio = base64Data.split(",")[1];
            audioChunkCallbackRef.current?.(base64Audio);
          };
          reader.readAsDataURL(event.data);
        }
      };
      return recorder;
    },
    []
  );
  /**
   * Analyzes audio data in real-time to detect voice activity.
   *
   * @function
   * @returns {void} Updates speaking state and calls callback.
   * @example
   * // Called automatically by requestAnimationFrame:
   * analyzeAudio();
   *
   * @remarks
   * Side Effects:
   * - Updates speaking state
   * - Calls speaking change callback
   * - Schedules next analysis frame
   */
  const analyzeAudio = useCallback(() => {
    // check if not null
    if (!analyserRef.current || !audioContextRef.current) {
      return;
    }
    // Get current time.
    const currentTime = performance.now();
    // Throttle analysis to reduce CPU usage
    if (currentTime - lastAnalysisTimeRef.current < ANALYSIS_INTERVAL_MS) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }
    lastAnalysisTimeRef.current = currentTime;

    // Reuse pre-allocated array
    const timeDataArray = timeDataArrayRef.current;
    if (!timeDataArray) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }

    analyserRef.current.getByteTimeDomainData(timeDataArray);

    // Optimized amplitude calculation with early exit
    let sum = 0;
    const length = timeDataArray.length;
    const sampleStep = 4; // Sample every 4th value for efficiency

    for (let i = 0; i < length; i += sampleStep) {
      sum += Math.abs((timeDataArray[i] - 128) / 128);
    }

    const averageAmplitude = (sum / (length / sampleStep)) * 100;

    if (averageAmplitude > VAD_THRESHOLD) {
      // Voice detected
      if (!stateRef.current.isSpeaking) {
        stateRef.current.isSpeaking = true;
        speakingChangeCallbackRef.current?.(true);
        // stateRef.current.silenceStartTime = 0; // Reset silence timer

        if (streamingRecorderRef.current && !isStreamingRef.current) {
          streamingRecorderRef.current.start(CHUNK_DURATION_MS);
          isStreamingRef.current = true;
        }
      }
      stateRef.current.silenceStartTime = currentTime; // Update silence timer
    } else {
      // No voice detected
      if (stateRef.current.isSpeaking) {
        if (stateRef.current.silenceStartTime === 0) {
          // First silence detection
          stateRef.current.silenceStartTime = currentTime; // Start silence timer
        } else if (
          currentTime - stateRef.current.silenceStartTime >
          SILENCE_INTERVAL_MS
        ) {
          // Silence detected for longer than threshold
          stateRef.current.isSpeaking = false;
          speakingChangeCallbackRef.current?.(false); // Notify that user stopped speaking and need to stop recording

          // Stop streaming recorder
          if (streamingRecorderRef.current && isStreamingRef.current) {
            streamingRecorderRef.current.stop();
            isStreamingRef.current = false;
          }
          stateRef.current.silenceStartTime = 0; // Reset silence timer
        }
      }
    }
    // Continue analyzing audio if not closed
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, []);

  /**
   * Starts voice activity detection on the provided audio stream.
   *
   * @function
   * @param {MediaStream} stream - Audio stream to analyze.
   * @param {Function} [onSpeakingChange] - Optional callback for speaking state changes.
   * @returns {Promise<void>} Resolves when detection is started.
   * @example
   * // Start detection:
   * await startDetectingAudio(stream, (isSpeaking) => {
   *   console.log('Speaking:', isSpeaking);
   * });
   *
   * @throws {Error} Logs errors to console but doesn't throw.
   * @remarks
   * Side Effects:
   * - Creates AudioContext
   * - Loads WASM binaries
   * - Sets up audio processing pipeline
   * - Starts real-time analysis
   */
  const startDetectingAudio = async (
    stream: MediaStream,
    onSpeakingChange?: (isSpeaking: boolean) => void,
    onAudioChunk?: (chunk: string) => void
  ) => {
    speakingChangeCallbackRef.current = onSpeakingChange || null;
    audioChunkCallbackRef.current = onAudioChunk || null;
    
    const audioTracks = stream.getAudioTracks();

    if (!audioTracks || audioTracks.length === 0) {
      return; // No audio tracks found
    }
    try {
      // create audiocontext
      audioContextRef.current = new AudioContext({
        latencyHint: "interactive",
      });
      // Resume if suspended
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      // load wasm binaries and worklets
      const [rrnoiseWasmBinary] = await Promise.all([
        loadRnnoise({ url: rnnoiseWasmPath, simdUrl: rnnoiseWasmSimdPath }),
        audioContextRef.current.audioWorklet.addModule(noiseGateWorkletPath),
        audioContextRef.current.audioWorklet.addModule(rnnoiseWorkletPath),
      ]);
      // create nodes
      const ctx = audioContextRef.current;
      sourceRef.current = ctx.createMediaStreamSource(stream);

      // Suppresion types
      const rrnoise = new RnnoiseWorkletNode(ctx, {
        wasmBinary: rrnoiseWasmBinary,
        maxChannels: 1,
      });
      rrnoiseRef.current = rrnoise;
      const noiseGate = new NoiseGateWorkletNode(ctx, {
        openThreshold: -40,
        closeThreshold: -50,
        holdMs: 100,
        maxChannels: 1,
      });
      noiseGateRef.current = noiseGate;
      // create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.6;
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;

      sourceRef.current.connect(rrnoise);
      rrnoise.connect(noiseGate);
      noiseGate.connect(analyserRef.current);

      // Pre-allocate the data array once
      timeDataArrayRef.current = new Uint8Array(
        analyserRef.current.frequencyBinCount
      );

      // create streaming recorder
      streamingRecorderRef.current = createStreamingRecorder(stream);

      await new Promise((resolve) => setTimeout(resolve, 100));
      analyzeAudio();
    } catch (error) {
      console.error("Error starting audio detection:", error);
    }
  };

  /**
   * Stops voice activity detection and cleans up resources.
   *
   * @function
   * @returns {void} Cleans up audio context and nodes.
   * @example
   * // Stop detection:
   * stopDetectingAudio();
   *
   * @remarks
   * Side Effects:
   * - Cancels animation frame
   * - Closes audio context
   * - Disconnects audio nodes
   * - Resets state
   */
  const stopDetectingAudio = () => {
    // Stop streaming recorder
    if (streamingRecorderRef.current && isStreamingRef.current) {
      streamingRecorderRef.current.stop();
      isStreamingRef.current = false;
    }
    streamingRecorderRef.current = null;
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Disconnect nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (rrnoiseRef.current) {
      rrnoiseRef.current.disconnect();
      rrnoiseRef.current = null;
    }
    if (noiseGateRef.current) {
      noiseGateRef.current.disconnect();
      noiseGateRef.current = null;
    }
    
    // Reset refs
    analyserRef.current = null;
    timeDataArrayRef.current = null;
    stateRef.current = {
      isSpeaking: false,
      silenceStartTime: 0,
    };
    speakingChangeCallbackRef.current = null;
    audioChunkCallbackRef.current = null;
  };
  return {
    startDetectingAudio,
    stopDetectingAudio,
  };
};
