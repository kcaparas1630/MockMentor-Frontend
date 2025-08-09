import { useState, useEffect, useRef, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";


export interface NormalizedLandmark {
  x: number; // Normalized x coordinate (0 to 1)
  y: number; // Normalized y coordinate (0 to 1)
  z?: number; // Optional z coordinate for 3D landmarks
}

export interface FaceLandmarkData {
  landmarks: NormalizedLandmark[][]; // Array of face landmark arrays (468 points per face)
  confidence: number;
  timestamp: number;
}

export interface UseFaceLandmarkerReturn {
  // State
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  landmarks: FaceLandmarkData | null;
  
  // Actions
  initialize: () => Promise<void>;
  processFrame: (videoElement: HTMLVideoElement) => void;
  cleanup: () => void;
}

export const useFaceLandmarker = (
  stream: MediaStream | null | undefined,
  enabled: boolean = true
): UseFaceLandmarkerReturn => {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<FaceLandmarkData | null>(null);

  /**
   * Initialize MediaPipe FaceLandmarker
   */
  const initialize = useCallback(async () => {
    if (faceLandmarkerRef.current) return;

    try {
      setError(null);
      
      // Use CDN for wasm files (more reliable)
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // TODO: Create FaceLandmarker instance with your model
      const faceLandmarker = await FaceLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: "/models/face_landmarker.task", 
          },
          runningMode: "VIDEO",
          numFaces: 1
        }
      );

      faceLandmarkerRef.current = faceLandmarker;
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize FaceLandmarker:", err);
      setError(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Refs for high-frequency updates to avoid excessive re-renders
  const isProcessingRef = useRef(false);
  const lastStateUpdateRef = useRef(0);
  const STATE_UPDATE_THROTTLE = 100; // Update state every 100ms (10Hz) instead of 60Hz

  /**
   * Process a single video frame for face landmarks
   */
  const processFrame = useCallback((videoElement: HTMLVideoElement) => {
    if (!faceLandmarkerRef.current || !enabled || isProcessingRef.current) return;

    try {
      isProcessingRef.current = true;
      const now = performance.now();
      
      // Throttle state updates to reduce re-renders
      const shouldUpdateState = now - lastStateUpdateRef.current >= STATE_UPDATE_THROTTLE;
      if (shouldUpdateState) {
        setIsProcessing(true);
      }
      
      // Get current video timestamp in milliseconds
      const timestamp = now;
      
      // Detect face landmarks for video
      const results = faceLandmarkerRef.current.detectForVideo(videoElement, timestamp);
      
      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        // Process the first detected face
        const face = results.faceLandmarks[0];
        
        // Extract confidence score if available (some models provide this)
        const confidence = results.faceBlendshapes && results.faceBlendshapes.length > 0 
          ? results.faceBlendshapes[0].categories[0]?.score || 1.0
          : 1.0;
        
        const processedLandmarks: FaceLandmarkData = {
          landmarks: [face], // Array of detected faces with their landmarks
          confidence,
          timestamp
        };
        
        // Only update landmarks state at throttled rate
        if (shouldUpdateState) {
          setLandmarks(processedLandmarks);
          lastStateUpdateRef.current = now;
        }
      } else {
        // No face detected - only update state if throttled
        if (shouldUpdateState) {
          setLandmarks(null);
          lastStateUpdateRef.current = now;
        }
      }
    } catch (err) {
      console.error("Frame processing failed:", err);
      setError(`Processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      isProcessingRef.current = false;
      // Only update processing state at throttled rate
      if (performance.now() - lastStateUpdateRef.current >= STATE_UPDATE_THROTTLE) {
        setIsProcessing(false);
      }
    }
  }, [enabled]);

  /**
   * Clean up MediaPipe resources
   */
  const cleanup = useCallback(() => {
    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
    }
    setIsInitialized(false);
    setLandmarks(null);
    setError(null);
  }, []);

  // Initialize when stream becomes available
  useEffect(() => {
    if (stream && enabled && !isInitialized) {
      initialize();
    }
  }, [stream, enabled, isInitialized, initialize]);

  // Cleanup on unmount or when stream is removed
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isInitialized,
    isProcessing,
    error,
    landmarks,
    initialize,
    processFrame,
    cleanup
  };
};
