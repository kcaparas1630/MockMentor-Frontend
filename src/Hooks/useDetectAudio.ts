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
import VoiceDetectionMetrics from "../Types/VoiceDetectionMetrics";
import { useCalibration } from "./useCalibration";

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
    onAudioChunk?: (chunk: string, isSpeaking: boolean) => void
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
  // Get calibration thresholds from context
  const { thresholds } = useCalibration();
  
  // REFERENCES TO AUDIO
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frequencyDataArrayRef = useRef<Uint8Array | null>(null);
  const frequencyFloatArrayRef = useRef<Float32Array | null>(null);

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
  const audioChunkCallbackRef = useRef<
    ((chunk: string, isSpeaking: boolean) => void) | null
  >(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio processing nodes
  const rrnoiseRef = useRef<RnnoiseWorkletNode | null>(null);
  const noiseGateRef = useRef<NoiseGateWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Pre-allocate arrays to avoid GC pressure
  const timeDataArrayRef = useRef<Uint8Array | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);

  // CONSTANTS
  const ANALYSIS_INTERVAL_MS: number = 50;
  const SILENCE_INTERVAL_MS: number = 1500; // 150 ms of silence before considering user stopped speaking
  const CHUNK_DURATION_MS: number = 1000; // 1 second of audio chunk

  /**
   * Calculates spectral centroid from frequency domain data.
   * 
   * The spectral centroid represents the "center of mass" of the spectrum and is a measure
   * of the brightness of a sound. It's calculated as the weighted average of the frequencies
   * present in the signal, with the magnitude of each frequency component serving as the weight.
   * This metric is particularly useful for distinguishing between different types of speech sounds.
   * 
   * @function
   * @param {Uint8Array} frequencyData - Frequency domain data from FFT analysis (0-255 range).
   * @param {number} sampleRate - Audio sample rate in Hz (typically 44100 or 48000).
   * @returns {number} Spectral centroid value in Hz, or 0 if no magnitude data.
   * @example
   * // Calculate spectral centroid from frequency data:
   * const centroid = calculateSpectralCentroid(frequencyArray, 44100);
   * console.log('Spectral centroid:', centroid, 'Hz');
   * 
   * @remarks
   * Algorithm:
   * - Converts frequency data to magnitude values (0-1 range)
   * - Calculates frequency for each bin based on sample rate and FFT size
   * - Computes weighted sum: Σ(frequency * magnitude)
   * - Computes magnitude sum: Σ(magnitude)
   * - Returns weighted sum / magnitude sum
   * 
   * Interpretation for speech:
   * - Low values (200-800 Hz): Vowels, low-frequency sounds
   * - Medium values (800-3000 Hz): Normal speech, consonants
   * - High values (3000-8000 Hz): Sibilants, high-frequency sounds
   * 
   * Performance: O(n) where n is the number of frequency bins
   * 
   * @throws {Error} No errors thrown, returns 0 for invalid input.
   */
  const calculateSpectralCentroid = useCallback(
    (frequencyData: Uint8Array, sampleRate: number): number => {
      const fftSize = frequencyData.length * 2; // fftSize is twice the frequency bin count.
      const binWidth = sampleRate / fftSize;

      let weightedSum = 0;
      let magnitudeSum = 0;

      for (let i = 0; i < frequencyData.length; i++) {
        const frequency = i * binWidth;
        const magnitude = frequencyData[i] / 255; // Normalize to 0-1 range
        // Calculate weighted sum and magnitude sum
        weightedSum += frequency * magnitude;
        magnitudeSum += magnitude;
      }
      return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    },
    []
  );

  /**
   * Calculates average amplitude from time domain audio data.
   * 
   * Amplitude is a measure of the signal strength or volume. This function calculates
   * the average absolute amplitude by sampling the time domain data at regular intervals
   * for efficiency. The result is normalized and scaled to provide a meaningful amplitude value
   * that can be used for voice activity detection.
   * 
   * @function
   * @param {Uint8Array} timeData - Time domain audio data (0-255 range, centered around 128).
   * @returns {number} Average amplitude value, typically between 0-100.
   * @example
   * // Calculate amplitude from time domain data:
   * const amplitude = calculateAmplitude(timeDataArray);
   * console.log('Average amplitude:', amplitude);
   * 
   * @remarks
   * Algorithm:
   * - Centers data around zero by subtracting 128 from each sample
   * - Samples every 4th value for performance optimization
   * - Calculates absolute value of each sample
   * - Normalizes to 0-1 range by dividing by 128
   * - Computes average and scales to 0-100 range
   * 
   * Performance optimization:
   * - Uses sampleStep = 4 to reduce computation by 75%
   * - Maintains accuracy while improving performance
   * 
   * Interpretation for voice detection:
   * - Low values (0-10): Quiet sounds, background noise, silence
   * - Medium values (10-30): Normal speech levels, conversation
   * - High values (30+): Loud sounds, shouting, close microphone
   * 
   * Performance: O(n/4) where n is the length of time data
   * 
   * @throws {Error} No errors thrown, handles edge cases gracefully.
   */
  const calculateAmplitude = useCallback((timeData: Uint8Array): number => {
    let sum = 0;
    const length = timeData.length;
    const sampleStep = 4; // Sample every 4th value for efficiency

    for (let i = 0; i < length; i += sampleStep) {
      sum += Math.abs((timeData[i] - 128) / 128);
    }

    return (sum / (length / sampleStep)) * 100;
  }, []);

  /**
   * Calculates zero-crossing rate from time domain audio data.
   * 
   * The zero-crossing rate is a measure of how many times the signal changes sign,
   * crossing the zero line. It's useful for distinguishing between voiced and unvoiced
   * speech, as well as detecting different types of sounds. Higher values typically
   * indicate more complex or noisy signals, while lower values indicate more tonal sounds.
   * 
   * @function
   * @param {Uint8Array} timeData - Time domain audio data (0-255 range, centered around 128).
   * @returns {number} Zero-crossing rate as a normalized value between 0 and 1.
   * @example
   * // Calculate zero-crossing rate from time domain data:
   * const zcr = calculateZeroCrossingRate(timeDataArray);
   * console.log('Zero-crossing rate:', zcr);
   * 
   * @remarks
   * Algorithm:
   * - Centers data around zero by subtracting 128 from each sample
   * - Counts sign changes between consecutive samples
   * - Normalizes by dividing by total number of samples
   * 
   * Interpretation for speech detection:
   * - Low values (0.05-0.15): Voiced speech, vowels, sustained tones
   * - Medium values (0.15-0.25): Mixed speech, some noise, consonants
   * - High values (0.25-0.35): Unvoiced speech, fricatives, noise
   * - Very high values (0.35+): Pure noise, clicks, artifacts
   * 
   * Performance: O(n) where n is the length of time data
   * 
   * @throws {Error} No errors thrown, handles edge cases gracefully.
   */
  const calculateZeroCrossingRate = useCallback(
    (timeData: Uint8Array): number => {
      let crossings = 0;
      const length = timeData.length;

      for (let i = 1; i < length; i++) {
        const current = timeData[i] - 128; // Center around 0
        const previous = timeData[i - 1] - 128;

        if ((current >= 0 && previous < 0) || (current < 0 && previous >= 0)) {
          crossings++;
        }
      }

      return crossings / length; // Normalize by length
    },
    []
  );

  /**
   * Detects voice activity based on multiple audio metrics and calibration thresholds.
   * 
   * This function implements a sophisticated voice activity detection algorithm that
   * combines amplitude, spectral centroid, and zero-crossing rate analysis. It uses
   * calibration thresholds to determine whether the current audio input represents
   * human speech or background noise. The algorithm is designed to be robust across
   * different environments and microphone types.
   * 
   * @function
   * @param {VoiceDetectionMetrics} metrics - Object containing audio analysis metrics.
   * @param {number} metrics.amplitude - Average amplitude value (0-100).
   * @param {number} metrics.spectralCentroid - Spectral centroid value in Hz.
   * @param {number} metrics.zeroCrossingRate - Zero-crossing rate value (0-1).
   * @returns {boolean} True if voice activity is detected, false otherwise.
   * @example
   * // Detect voice activity using audio metrics:
   * const isSpeaking = detectVoiceActivity({
   *   amplitude: 25,
   *   spectralCentroid: 1500,
   *   zeroCrossingRate: 0.18
   * });
   * console.log('Voice detected:', isSpeaking);
   * 
   * @remarks
   * Detection logic:
   * - Requires amplitude above threshold (primary condition)
   * - AND either spectral centroid OR zero-crossing rate within range
   * - This allows for different types of speech while filtering noise
   * 
   * Threshold sources:
   * - Uses calibration thresholds from context if available
   * - Falls back to default thresholds if no calibration exists
   * - Defaults are optimized for typical speech patterns
   * 
   * Decision criteria:
   * 1. Amplitude check: amplitude > amplitudeThreshold
   * 2. Spectral check: spectralCentroid within [min, max] range
   * 3. ZCR check: zeroCrossingRate within [min, max] range
   * 4. Final decision: amplitudeCheck AND (spectralCheck OR zcrCheck)
   * 
   * Performance: O(1) - simple threshold comparisons
   * 
   * @throws {Error} No errors thrown, uses fallback thresholds on error.
   */
  const detectVoiceActivity = useCallback(
    (metrics: VoiceDetectionMetrics): boolean => {
      const { amplitude, spectralCentroid, zeroCrossingRate } = metrics;
      
      // Get calibration thresholds from context, otherwise use defaults
      const currentThresholds = thresholds || {
        amplitudeThreshold: 15,
        spectralCentroidMin: 800,
        spectralCentroidMax: 5000,
        zcrMin: 0.05,
        zcrMax: 0.35
      };

      // Check each condition
      const amplitudeCheck = amplitude > currentThresholds.amplitudeThreshold;
      const spectralCheck =
        spectralCentroid >= currentThresholds.spectralCentroidMin &&
        spectralCentroid <= currentThresholds.spectralCentroidMax;
      const zcrCheck =
        zeroCrossingRate >= currentThresholds.zcrMin &&
        zeroCrossingRate <= currentThresholds.zcrMax;

      // Combined decision logic
      // Require amplitude AND (spectral centroid OR zero-crossing rate)
      // This allows for different types of speech while filtering out noise
      return amplitudeCheck && (spectralCheck || zcrCheck);
    },
    [thresholds]
  );


  /**
   * Creates a streaming recorder for real-time audio chunk processing.
   * 
   * This function creates a MediaRecorder instance configured for streaming audio
   * in small chunks. The recorder automatically converts audio data to base64 format
   * and provides it through a callback mechanism. This is designed for real-time
   * audio processing applications where immediate access to audio data is required.
   * 
   * @function
   * @param {MediaStream} stream - The audio stream to record.
   * @returns {MediaRecorder} The configured media recorder instance.
   * @example
   * // Create a streaming recorder:
   * const recorder = createStreamingRecorder(audioStream);
   * recorder.start(1000); // Start recording 1-second chunks
   * 
   * @remarks
   * Configuration:
   * - Format: WebM with Opus codec for optimal compression
   * - Bit rate: 16 kbps for efficient streaming
   * - Audio only: Filters out video tracks automatically
   * 
   * Data processing:
   * - Converts audio chunks to base64 format
   * - Provides data through ondataavailable callback
   * - Includes speaking state with each chunk
   * - Handles errors gracefully with console logging
   * 
   * Usage pattern:
   * 1. Create recorder with audio stream
   * 2. Set up ondataavailable callback
   * 3. Start recording with chunk duration
   * 4. Process base64 audio data as needed
   * 5. Stop recording when finished
   * 
   * Error handling:
   * - Logs MediaRecorder errors to console
   * - Continues operation despite individual chunk failures
   * - Graceful degradation for unsupported formats
   * 
   * Performance considerations:
   * - Efficient base64 conversion using FileReader
   * - Minimal memory footprint with streaming approach
   * - Automatic cleanup of temporary resources
   * 
   * @throws {Error} No errors thrown, returns null recorder on failure.
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
            audioChunkCallbackRef.current?.(
              base64Audio,
              stateRef.current.isSpeaking
            );
          };
          reader.readAsDataURL(event.data);
        }
      };
      recorder.onerror = (event) => {
        console.error("Error in MediaRecorder:", event);
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

    // Get frequency domain data (new FFT analysis)
    const frequencyDataArray = frequencyDataArrayRef.current;
    const frequencyFloatArray = frequencyFloatArrayRef.current;

    if (!frequencyDataArray || !frequencyFloatArray) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }

    analyserRef.current.getByteTimeDomainData(timeDataArray);
    analyserRef.current.getByteFrequencyData(frequencyDataArray);
    analyserRef.current.getFloatFrequencyData(frequencyFloatArray);

    // Calculate amplitude using the extracted function
    const averageAmplitude = calculateAmplitude(timeDataArray);

    const spectralCentroid = calculateSpectralCentroid(
      frequencyDataArray,
      audioContextRef.current.sampleRate
    );
    const zeroCrossingRate = calculateZeroCrossingRate(timeDataArray);

    const isVoiceDetected = detectVoiceActivity({
      amplitude: averageAmplitude,
      spectralCentroid,
      zeroCrossingRate,
      currentTime,
    });

    // Update speaking state based on combined analysis
    if (isVoiceDetected) {
      if (!stateRef.current.isSpeaking) {
        stateRef.current.isSpeaking = true;
        speakingChangeCallbackRef.current?.(true);

        if (streamingRecorderRef.current && !isStreamingRef.current) {
          streamingRecorderRef.current.start(CHUNK_DURATION_MS);
          isStreamingRef.current = true;
        }
      }
      stateRef.current.silenceStartTime = currentTime;
    } else {
      if (stateRef.current.isSpeaking) {
        if (stateRef.current.silenceStartTime === 0) {
          stateRef.current.silenceStartTime = currentTime;
        } else if (
          currentTime - stateRef.current.silenceStartTime >
          SILENCE_INTERVAL_MS
        ) {
          stateRef.current.isSpeaking = false;
          speakingChangeCallbackRef.current?.(false);

          if (streamingRecorderRef.current && isStreamingRef.current) {
            streamingRecorderRef.current.stop();
            isStreamingRef.current = false;
          }
          stateRef.current.silenceStartTime = 0;
        }
      }
    }
    // Continue analyzing audio if not closed
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [
    calculateAmplitude,
    calculateSpectralCentroid,
    calculateZeroCrossingRate,
    detectVoiceActivity,
  ]);

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
    onAudioChunk?: (chunk: string, isSpeaking: boolean) => void
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
      frequencyDataArrayRef.current = new Uint8Array(
        analyserRef.current.frequencyBinCount
      );
      frequencyFloatArrayRef.current = new Float32Array(
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
    frequencyDataArrayRef.current = null;
    frequencyFloatArrayRef.current = null;
  };
  return {
    startDetectingAudio,
    stopDetectingAudio,
  };
};
