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
  const [calibrationThresholds, setCalibrationThresholds] = useState<CalibrationThresholds | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  // Audio monitoring refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micTestingRef = useRef<boolean>(false);
  


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
  const startMicTest = async (stream: MediaStream) => {
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

    setIsMicTesting(true);
    micTestingRef.current = true;
    setAudioLevel(0);
    setError(null);

    try {
      // Create AudioContext
      audioContextRef.current = new AudioContext();
      
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
      setError(`Unable to start microphone test: ${errorMessage}`);
      setIsMicTesting(false);
      micTestingRef.current = false;
    }
  };

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
   * Calculates spectral centroid from frequency data.
   * @param frequencyData - Frequency domain data
   * @param sampleRate - Audio sample rate
   * @returns Spectral centroid value
   */
  const calculateSpectralCentroid = useCallback((frequencyData: Uint8Array, sampleRate: number): number => {
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
  }, []);

  /**
   * Calculates zero-crossing rate from time domain data.
   * @param timeData - Time domain data
   * @returns Zero-crossing rate value
   */
  const calculateZeroCrossingRate = useCallback((timeData: Uint8Array): number => {
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
  }, []);

  /**
   * Calculates amplitude from time domain data.
   * @param timeData - Time domain data
   * @returns Amplitude value
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
   * Performs calibration by collecting audio samples and calculating optimal thresholds.
   * @param stream - Audio stream to calibrate
   * @returns Promise resolving to calibration thresholds
   */
  const calibrate = useCallback(async (stream: MediaStream): Promise<CalibrationThresholds> => {
    return new Promise((resolve) => {
      setIsCalibrating(true);
      setError(null);
      
      // Start mic test if not already running
      if (!isMicTesting) {
        startMicTest(stream);
      }
      
      const samples: Array<{amplitude: number, spectralCentroid: number, zcr: number}> = [];
      let sampleCount = 0;
      const maxSamples = 100; // 5 seconds at 20fps
      
      const collectSample = () => {
        if (!analyserRef.current || sampleCount >= maxSamples) {
          // Calculate optimal thresholds
          const thresholds = calculateOptimalThresholds(samples);
          setCalibrationThresholds(thresholds);
          setIsCalibrating(false);
          resolve(thresholds);
          return;
        }
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        const timeData = new Uint8Array(analyserRef.current.fftSize);
        
        analyserRef.current.getByteFrequencyData(frequencyData);
        analyserRef.current.getByteTimeDomainData(timeData);
        
        const amplitude = calculateAmplitude(timeData);
        const spectralCentroid = calculateSpectralCentroid(frequencyData, audioContextRef.current?.sampleRate || 44100);
        const zcr = calculateZeroCrossingRate(timeData);
        
        samples.push({ amplitude, spectralCentroid, zcr });
        sampleCount++;
        
        setTimeout(collectSample, 50); // 20fps
      };
      
      // Start collecting samples after a short delay
      setTimeout(collectSample, 100);
    });
  }, [isMicTesting, calculateAmplitude, calculateSpectralCentroid, calculateZeroCrossingRate]);

  /**
   * Calculates optimal thresholds from collected samples.
   * @param samples - Array of audio samples
   * @returns Calibration thresholds
   */
  const calculateOptimalThresholds = useCallback((samples: Array<{amplitude: number, spectralCentroid: number, zcr: number}>): CalibrationThresholds => {
    const amplitudes = samples.map(s => s.amplitude).sort((a, b) => a - b);
    const spectralCentroids = samples.map(s => s.spectralCentroid).sort((a, b) => a - b);
    const zcrs = samples.map(s => s.zcr).sort((a, b) => a - b);
    
    return {
      amplitudeThreshold: amplitudes[Math.floor(amplitudes.length * 0.7)], // 70th percentile
      spectralCentroidMin: spectralCentroids[Math.floor(spectralCentroids.length * 0.1)],
      spectralCentroidMax: spectralCentroids[Math.floor(spectralCentroids.length * 0.9)],
      zcrMin: zcrs[Math.floor(zcrs.length * 0.1)],
      zcrMax: zcrs[Math.floor(zcrs.length * 0.9)]
    };
  }, []);

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
      if (!analyserRef.current || !micTestingRef.current) return;
      
      // Frequency domain analysis
      analyserRef.current.getByteFrequencyData(dataArray);
      const frequencyAverage = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
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
      const peak = Math.max(...timeDataArray.map((v) => Math.abs(v - 128))) / 128;

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
