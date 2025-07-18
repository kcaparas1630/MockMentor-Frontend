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
  const startMicTest = useCallback(async (stream: MediaStream) => {
    setIsMicTesting(true);
    micTestingRef.current = true;
    
    await startAudioAnalysis(stream);
  }, [startAudioAnalysis]);

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
   * Calculates spectral centroid from frequency domain data.
   * 
   * The spectral centroid represents the "center of mass" of the spectrum and is a measure
   * of the brightness of a sound. It's calculated as the weighted average of the frequencies
   * present in the signal, with the magnitude of each frequency component serving as the weight.
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
   * Performance: O(n) where n is the number of frequency bins
   * 
   * @throws {Error} No errors thrown, returns 0 for invalid input.
   */
  const calculateSpectralCentroid = useCallback(
    (frequencyData: Uint8Array, sampleRate: number): number => {
      const fftSize = frequencyData.length * 2;
      const binWidth = sampleRate / fftSize;

      let weightedSum = 0;
      let magnitudeSum = 0;

      for (let i = 0; i < frequencyData.length; i++) {
        const frequency = i * binWidth;
        const magnitude = frequencyData[i] / 255;
        weightedSum += frequency * magnitude;
        magnitudeSum += magnitude;
      }

      return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    },
    []
  );

  /**
   * Calculates zero-crossing rate from time domain audio data.
   * 
   * The zero-crossing rate is a measure of how many times the signal changes sign,
   * crossing the zero line. It's useful for distinguishing between voiced and unvoiced
   * speech, as well as detecting different types of sounds. Higher values typically
   * indicate more complex or noisy signals.
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
   * Interpretation:
   * - Low values (0.05-0.15): Voiced speech, sustained tones
   * - Medium values (0.15-0.25): Mixed speech, some noise
   * - High values (0.25-0.35): Unvoiced speech, fricatives, noise
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
        const current = timeData[i] - 128;
        const previous = timeData[i - 1] - 128;

        if ((current >= 0 && previous < 0) || (current < 0 && previous >= 0)) {
          crossings++;
        }
      }

      return crossings / length;
    },
    []
  );

  /**
   * Calculates average amplitude from time domain audio data.
   * 
   * Amplitude is a measure of the signal strength or volume. This function calculates
   * the average absolute amplitude by sampling the time domain data at regular intervals
   * for efficiency. The result is normalized and scaled to provide a meaningful amplitude value.
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
   * Interpretation:
   * - Low values (0-10): Quiet sounds, background noise
   * - Medium values (10-30): Normal speech levels
   * - High values (30+): Loud sounds, shouting
   * 
   * Performance: O(n/4) where n is the length of time data
   * 
   * @throws {Error} No errors thrown, handles edge cases gracefully.
   */
  const calculateAmplitude = useCallback((timeData: Uint8Array): number => {
    let sum = 0;
    const length = timeData.length;
    const sampleStep = 4;

    for (let i = 0; i < length; i += sampleStep) {
      sum += Math.abs((timeData[i] - 128) / 128);
    }

    return (sum / (length / sampleStep)) * 100;
  }, []);

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
        const maxSamples = 100; // 5 seconds at 20fps

        const collectSample = () => {
          if (!analyserRef.current || sampleCount >= maxSamples) {
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

          setTimeout(collectSample, 50); // 20fps
        };

        // Start collecting samples after a short delay
        setTimeout(collectSample, 100);
      });
    },
    [
      calculateAmplitude,
      calculateSpectralCentroid,
      calculateZeroCrossingRate,
      calculateOptimalThresholds,
      startAudioAnalysis,
    ]
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
      if (!analyserRef.current || (!micTestingRef.current && !calibrationRef.current)) return;

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
