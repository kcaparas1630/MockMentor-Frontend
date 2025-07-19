/**
 * @fileoverview Custom hook for microphone testing with real-time audio level visualization and monitoring.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a microphone testing hook that provides real-time audio level monitoring,
 * visual feedback, and error handling for microphone functionality. It uses Web Audio API to
 * analyze audio streams and provides audio level data for UI visualization. It plays a crucial
 * role in device testing and user experience validation.
 *
 * @see {@link src/Components/Interview/VideoTestCard.tsx}
 * @see {@link src/Components/Interview/InterviewRoom/InterviewRoom.tsx}
 *
 * Dependencies:
 * - React
 * - Web Audio API
 */

import { useState, useRef, useEffect, useCallback } from "react";
import CalibrationThresholds from "../Types/CalibrationThresholds";
import {
  calculateSpectralCentroid,
  calculateAmplitude,
  calculateZeroCrossingRate,
} from "../Utils/audioAnalysis";

/**
 * Interface for microphone testing hook return value.
 * @interface UseMicTestingReturn
 * @property {boolean} isMicTesting - Whether microphone testing is currently active.
 * @property {number} audioLevel - Current audio level (0-1).
 * @property {string|null} error - Error message if testing fails.
 * @property {Function} startMicTest - Function to start microphone testing.
 * @property {Function} stopMicTest - Function to stop microphone testing.
 * @property {Function} calibrate - Function to perform calibration and return thresholds.
 * @property {CalibrationThresholds|null} calibrationThresholds - Current calibration thresholds.
 * @property {boolean} isCalibrating - Whether calibration is currently in progress.
 */
export interface UseMicTestingReturn {
  isMicTesting: boolean;
  audioLevel: number;
  error: string | null;
  startMicTest: (stream: MediaStream) => Promise<void>;
  stopMicTest: () => void;
  calibrate: (stream: MediaStream) => Promise<CalibrationThresholds>;
  calibrationThresholds: CalibrationThresholds | null;
  isCalibrating: boolean;
}

const CALIBRATION_MAX_SAMPLES = 100;
const CALIBRATION_SAMPLE_INTERVAL = 50;
const MIN_CALIBRATION_SAMPLES = 20;
/**
 * Custom hook for microphone testing with real-time audio level visualization.
 * Can be reused across components that need mic testing functionality.
 *
 * @function
 * @returns {UseMicTestingReturn} Object containing mic testing state and methods.
 * @example
 * // Usage in components:
 * const { isMicTesting, audioLevel, error, startMicTest, stopMicTest } = useMicTesting();
 *
 * // Start testing
 * await startMicTest(stream);
 *
 * // Display audio level
 * console.log('Audio level:', audioLevel);
 *
 * // Stop testing
 * stopMicTest();
 *
 * @throws {Error} Logs errors to console but doesn't throw.
 * @remarks
 * Side Effects:
 * - Creates Web Audio API context
 * - Processes audio stream in real-time
 * - Updates audio level state
 * - Manages audio node connections
 *
 * Known Issues/Limitations:
 * - Requires browser support for Web Audio API
 * - Performance intensive on low-end devices
 * - No fallback for unsupported browsers
 * - Limited error recovery
 *
 * Design Decisions/Rationale:
 * - Uses useRef for stable references across renders
 * - Combines frequency and time domain analysis
 * - Implements peak detection for better accuracy
 * - Provides comprehensive error handling
 */

export const useMicTesting = (): UseMicTestingReturn => {
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [calibrationThresholds, setCalibrationThresholds] =
    useState<CalibrationThresholds | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Audio monitoring refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micTestingRef = useRef<boolean>(false);
  const calibrationRef = useRef<boolean>(false);

  /**
   * Starts audio analysis without setting mic testing state.
   * Used internally by calibration and other processes that need audio analysis.
   *
   * @function
   * @param {MediaStream} stream - Audio stream to analyze.
   * @returns {Promise<void>} Resolves when analysis is started.
   * @private
   */
  const startAudioAnalysis = useCallback(async (stream: MediaStream) => {
    const audioTracks = stream.getAudioTracks();

    if (audioTracks.length === 0) {
      setError("No audio tracks found. Please refresh and try again.");
      return;
    }

    // Check if audio track is active
    const activeAudioTrack = audioTracks.find(
      (track) => track.enabled && track.readyState === "live"
    );
    if (!activeAudioTrack) {
      setError("Audio track is not active. Please check your microphone.");
      return;
    }

    setAudioLevel(0);
    setError(null);

    try {
      // Create AudioContext if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Resume if suspended
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      // Set up audio analysis
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();

      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.8;
      analyserRef.current.minDecibels = -100;
      analyserRef.current.maxDecibels = -10;

      source.connect(analyserRef.current);

      // Start monitoring
      startAudioLevelMonitoring();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Unable to start audio analysis: ${errorMessage}`);
    }
  }, []);

  /**
   * Starts microphone testing with the provided stream.
   *
   * @function
   * @param {MediaStream} stream - Audio stream to test.
   * @returns {Promise<void>} Resolves when testing is started.
   * @example
   * // Start testing:
   * await startMicTest(stream);
   *
   * @throws {Error} Logs errors to console but doesn't throw.
   * @remarks
   * Side Effects:
   * - Creates AudioContext
   * - Sets up audio analysis pipeline
   * - Starts real-time monitoring
   * - Updates testing state
   */
  const startMicTest = useCallback(
    async (stream: MediaStream) => {
      setIsMicTesting(true);
      micTestingRef.current = true;

      await startAudioAnalysis(stream);
    },
    [startAudioAnalysis]
  );

  /**
   * Stops microphone testing and cleans up resources.
   *
   * @function
   * @returns {void} Cleans up audio context and resets state.
   * @example
   * // Stop testing:
   * stopMicTest();
   *
   * @remarks
   * Side Effects:
   * - Cancels animation frame
   * - Closes audio context
   * - Resets testing state
   * - Clears audio level
   */
  const stopMicTest = () => {
    micTestingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsMicTesting(false);
    setAudioLevel(0);
  };







  /**
   * Calculates optimal calibration thresholds from collected audio samples.
   *
   * This function analyzes a collection of audio samples to determine optimal
   * thresholds for voice activity detection. It uses percentile-based analysis
   * to establish robust thresholds that work well across different audio conditions
   * and user environments.
   *
   * @function
   * @param {Array<Object>} samples - Array of audio analysis samples.
   * @param {number} samples[].amplitude - Amplitude value from time domain analysis.
   * @param {number} samples[].spectralCentroid - Spectral centroid value in Hz.
   * @param {number} samples[].zcr - Zero-crossing rate value (0-1).
   * @returns {CalibrationThresholds} Object containing optimal threshold values.
   * @example
   * // Calculate optimal thresholds from collected samples:
   * const thresholds = calculateOptimalThresholds(audioSamples);
   * console.log('Amplitude threshold:', thresholds.amplitudeThreshold);
   * console.log('Spectral centroid range:', thresholds.spectralCentroidMin, '-', thresholds.spectralCentroidMax);
   *
   * @remarks
   * Threshold calculation strategy:
   * - Amplitude: 70th percentile (allows 30% of samples to be above threshold)
   * - Spectral centroid: 10th-90th percentile range (filters out extremes)
   * - Zero-crossing rate: 10th-90th percentile range (filters out extremes)
   *
   * Rationale:
   * - 70th percentile for amplitude provides good sensitivity while filtering noise
   * - 10th-90th percentile ranges exclude outliers that could skew detection
   * - Percentile-based approach adapts to different audio environments
   *
   * Performance: O(n log n) due to sorting operations
   *
   * @throws {Error} No errors thrown, handles empty arrays gracefully.
   */
  const calculateOptimalThresholds = useCallback(
    (
      samples: Array<{
        amplitude: number;
        spectralCentroid: number;
        zcr: number;
      }>
    ): CalibrationThresholds => {
      if (samples.length === 0) {
        return {
          amplitudeThreshold: 15,
          spectralCentroidMin: 800,
          spectralCentroidMax: 5000,
          zcrMin: 0.05,
          zcrMax: 0.35,
        };
      }
      const amplitudes = samples.map((s) => s.amplitude).sort((a, b) => a - b);
      const spectralCentroids = samples
        .map((s) => s.spectralCentroid)
        .sort((a, b) => a - b);
      const zcrs = samples.map((s) => s.zcr).sort((a, b) => a - b);

      return {
        amplitudeThreshold: amplitudes[Math.floor(amplitudes.length * 0.7)], // 70th percentile
        spectralCentroidMin:
          spectralCentroids[Math.floor(spectralCentroids.length * 0.1)],
        spectralCentroidMax:
          spectralCentroids[Math.floor(spectralCentroids.length * 0.9)],
        zcrMin: zcrs[Math.floor(zcrs.length * 0.1)],
        zcrMax: zcrs[Math.floor(zcrs.length * 0.9)],
      };
    },
    []
  );

  /**
   * Performs microphone calibration by collecting audio samples and calculating optimal thresholds.
   *
   * This function conducts a comprehensive calibration process to determine the optimal
   * voice activity detection thresholds for the current user and environment. It collects
   * audio samples over a period of time, analyzes them using multiple metrics, and returns
   * calibrated thresholds that provide accurate speech detection.
   *
   * @function
   * @param {MediaStream} stream - Audio stream to calibrate against.
   * @returns {Promise<CalibrationThresholds>} Promise resolving to calibrated threshold values.
   * @example
   * // Perform microphone calibration:
   * try {
   *   const thresholds = await calibrate(audioStream);
   *   console.log('Calibration complete:', thresholds);
   * } catch (error) {
   *   console.error('Calibration failed:', error);
   * }
   *
   * @remarks
   * Calibration process:
   * 1. Starts microphone testing if not already active
   * 2. Collects 100 audio samples over 5 seconds (20fps)
   * 3. Analyzes each sample for amplitude, spectral centroid, and zero-crossing rate
   * 4. Calculates optimal thresholds using percentile-based analysis
   * 5. Updates calibration state and returns thresholds
   *
   * Sample collection:
   * - Duration: 5 seconds (100 samples at 50ms intervals)
   * - Metrics: Amplitude, spectral centroid, zero-crossing rate
   * - Analysis: Real-time FFT and time domain processing
   *
   * Error handling:
   * - Gracefully handles audio context issues
   * - Continues with available samples if collection is interrupted
   * - Returns meaningful thresholds even with limited data
   *
   * Performance considerations:
   * - Non-blocking operation using setTimeout
   * - Efficient sample collection with minimal CPU impact
   * - Automatic cleanup of temporary resources
   *
   * @throws {Error} No errors thrown, returns default thresholds on failure.
   */
  const calibrate = useCallback(
    async (stream: MediaStream): Promise<CalibrationThresholds> => {
      return new Promise((resolve) => {
        setIsCalibrating(true);
        calibrationRef.current = true;
        setError(null);

        // Start audio analysis if not already running
        const initializeAnalysis = async () => {
          if (!analyserRef.current) {
            await startAudioAnalysis(stream);
          }
        };

        initializeAnalysis();

        const samples: Array<{
          amplitude: number;
          spectralCentroid: number;
          zcr: number;
        }> = [];
        let sampleCount = 0;
        const maxSamples = CALIBRATION_MAX_SAMPLES; // 5 seconds at 20fps

        const collectSample = () => {
          if (!analyserRef.current || sampleCount >= maxSamples) {
            if (samples.length < MIN_CALIBRATION_SAMPLES) {
              console.warn(`Calibration completed with only ${samples.length} samples.`);
            }
            // Calculate optimal thresholds
            const thresholds = calculateOptimalThresholds(samples);
            setCalibrationThresholds(thresholds);
            setIsCalibrating(false);
            calibrationRef.current = false;
            resolve(thresholds);
            return;
          }

          const bufferLength = analyserRef.current.frequencyBinCount;
          const frequencyData = new Uint8Array(bufferLength);
          const timeData = new Uint8Array(analyserRef.current.fftSize);

          analyserRef.current.getByteFrequencyData(frequencyData);
          analyserRef.current.getByteTimeDomainData(timeData);

          const amplitude = calculateAmplitude(timeData);
          const spectralCentroid = calculateSpectralCentroid(
            frequencyData,
            audioContextRef.current?.sampleRate || 44100
          );
          const zcr = calculateZeroCrossingRate(timeData);

          samples.push({ amplitude, spectralCentroid, zcr });
          sampleCount++;

          setTimeout(collectSample, CALIBRATION_SAMPLE_INTERVAL); // 20fps
        };

        // Start collecting samples after a short delay
        setTimeout(collectSample, 100);
      });
    },
    [calculateOptimalThresholds, startAudioAnalysis]
  );

  /**
   * Real-time audio level monitoring using frequency and time domain analysis.
   *
   * @function
   * @returns {void} Updates audio level state continuously.
   * @example
   * // Called automatically by startMicTest:
   * startAudioLevelMonitoring();
   *
   * @remarks
   * Side Effects:
   * - Updates audio level state
   * - Schedules next monitoring frame
   * - Processes audio data in real-time
   */
  const startAudioLevelMonitoring = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(analyserRef.current.fftSize);

    const monitorAudioLevel = () => {
      if (
        !analyserRef.current ||
        (!micTestingRef.current && !calibrationRef.current)
      )
        return;

      // Frequency domain analysis
      analyserRef.current.getByteFrequencyData(dataArray);
      const frequencyAverage =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const frequencyLevel = frequencyAverage / 255;

      // Time domain analysis
      analyserRef.current.getByteTimeDomainData(timeDataArray);
      let sum = 0;
      for (let i = 0; i < timeDataArray.length; i++) {
        const sample = (timeDataArray[i] - 128) / 128;
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / timeDataArray.length);
      const timeLevel = rms;

      // Peak detection
      const peak =
        Math.max(...timeDataArray.map((v) => Math.abs(v - 128))) / 128;

      // Combine methods
      const finalLevel = Math.max(frequencyLevel, timeLevel, peak * 0.5);

      setAudioLevel(finalLevel);
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    };

    monitorAudioLevel();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, []);

  return {
    isMicTesting,
    audioLevel,
    error,
    startMicTest,
    stopMicTest,
    calibrate,
    calibrationThresholds,
    isCalibrating,
  };
};
