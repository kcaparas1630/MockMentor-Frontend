import { useState, useRef, useEffect } from "react";

export interface UseMicTestingReturn {
  isMicTesting: boolean;
  audioLevel: number;
  error: string | null;
  startMicTest: (stream: MediaStream) => Promise<void>;
  stopMicTest: () => void;
}

/**
 * Custom hook for microphone testing with real-time audio level visualization
 * Can be reused across components that need mic testing functionality
 */
export const useMicTesting = (): UseMicTestingReturn => {
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Audio monitoring refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micTestingRef = useRef<boolean>(false);

  /**
   * Starts microphone testing with the provided stream
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
   * Stops microphone testing and cleans up resources
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
   * Real-time audio level monitoring
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
  };
}; 
