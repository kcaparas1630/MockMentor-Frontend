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

// Compressed emotion features to send to server (much smaller payload)
export interface CompressedEmotionFeatures {
  // Core emotion indicators (0-100 for easier transmission)
  smile: number;           // 0-100: smile intensity
  eyeOpen: number;         // 0-100: eye openness
  browRaise: number;       // 0-100: eyebrow raise
  mouthOpen: number;       // 0-100: mouth openness
  tension: number;         // 0-100: facial tension
  symmetry: number;        // 0-100: facial symmetry
  confidence: number;      // 0-100: MediaPipe confidence
  
  // Metadata
  timestamp: number;
  frameId: string;
}

export interface ProcessingStats {
  featuresExtracted: number;
  featuresSent: number;
  avgLatency: number;
}

// MediaPipe landmark indices
const LANDMARKS = {
  MOUTH_LEFT: 61,
  MOUTH_RIGHT: 291,
  MOUTH_TOP: 13,
  MOUTH_BOTTOM: 14,
  UPPER_LIP_TOP: 12,
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  LEFT_EYE_LEFT: 33,
  LEFT_EYE_RIGHT: 133,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,
  RIGHT_EYE_LEFT: 362,
  RIGHT_EYE_RIGHT: 263,
  LEFT_EYEBROW_OUTER: 70,
  LEFT_EYEBROW_INNER: 63,
  RIGHT_EYEBROW_OUTER: 299,
  RIGHT_EYEBROW_INNER: 293,
  NOSE_BRIDGE: 6,
} as const;

/**
 * Extract compressed features from landmarks (runs on client)
 */
const extractCompressedFeatures = (
  landmarks: NormalizedLandmark[], 
  confidence: number,
  timestamp: number
): CompressedEmotionFeatures => {
  try {
    // Helper function for distance calculation
    const distance = (p1: NormalizedLandmark, p2: NormalizedLandmark): number => {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    // Mouth analysis
    const mouthLeft = landmarks[LANDMARKS.MOUTH_LEFT];
    const mouthRight = landmarks[LANDMARKS.MOUTH_RIGHT];
    const mouthTop = landmarks[LANDMARKS.MOUTH_TOP];
    const mouthBottom = landmarks[LANDMARKS.MOUTH_BOTTOM];
    const upperLip = landmarks[LANDMARKS.UPPER_LIP_TOP];
    
    const mouthWidth = distance(mouthLeft, mouthRight);
    const mouthHeight = distance(mouthTop, mouthBottom);
    const mouthCenter = { x: (mouthLeft.x + mouthRight.x) / 2, y: (mouthLeft.y + mouthRight.y) / 2 };
    
    // Convert to 0-100 scale
    const smile = Math.max(0, Math.min(100, (upperLip.y - mouthCenter.y) * 1000));
    const mouthOpen = Math.max(0, Math.min(100, (mouthHeight / mouthWidth) * 500));
    
    // Eye analysis
    const leftEyeHeight = distance(landmarks[LANDMARKS.LEFT_EYE_TOP], landmarks[LANDMARKS.LEFT_EYE_BOTTOM]);
    const leftEyeWidth = distance(landmarks[LANDMARKS.LEFT_EYE_LEFT], landmarks[LANDMARKS.LEFT_EYE_RIGHT]);
    const rightEyeHeight = distance(landmarks[LANDMARKS.RIGHT_EYE_TOP], landmarks[LANDMARKS.RIGHT_EYE_BOTTOM]);
    const rightEyeWidth = distance(landmarks[LANDMARKS.RIGHT_EYE_LEFT], landmarks[LANDMARKS.RIGHT_EYE_RIGHT]);
    
    const avgEAR = ((leftEyeHeight / leftEyeWidth) + (rightEyeHeight / rightEyeWidth)) / 2;
    const eyeOpen = Math.max(0, Math.min(100, avgEAR * 500));
    
    // Eyebrow analysis
    const leftBrow = (landmarks[LANDMARKS.LEFT_EYEBROW_OUTER].y + landmarks[LANDMARKS.LEFT_EYEBROW_INNER].y) / 2;
    const rightBrow = (landmarks[LANDMARKS.RIGHT_EYEBROW_OUTER].y + landmarks[LANDMARKS.RIGHT_EYEBROW_INNER].y) / 2;
    const noseBridge = landmarks[LANDMARKS.NOSE_BRIDGE].y;
    const browHeight = noseBridge - ((leftBrow + rightBrow) / 2);
    const browRaise = Math.max(0, Math.min(100, browHeight * 800));
    
    // Facial tension (simplified)
    const yPositions = landmarks.slice(0, 50).map(lm => lm.y); // Sample subset for performance
    const meanY = yPositions.reduce((a, b) => a + b, 0) / yPositions.length;
    const variance = yPositions.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0) / yPositions.length;
    const tension = Math.max(0, Math.min(100, variance * 2000));
    
    // Simple symmetry check
    const leftMouthY = mouthLeft.y;
    const rightMouthY = mouthRight.y;
    const mouthSymmetry = 1 - Math.abs(leftMouthY - rightMouthY);
    const symmetry = Math.max(0, Math.min(100, mouthSymmetry * 100));
    
    return {
      smile: Math.round(smile),
      eyeOpen: Math.round(eyeOpen),
      browRaise: Math.round(browRaise),
      mouthOpen: Math.round(mouthOpen),
      tension: Math.round(tension),
      symmetry: Math.round(symmetry),
      confidence: Math.round(confidence * 100),
      timestamp,
      frameId: `frame_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
    };
    
  } catch (error) {
    console.error('Feature extraction error:', error);
    // Return neutral features on error
    return {
      smile: 0,
      eyeOpen: 50,
      browRaise: 0,
      mouthOpen: 0,
      tension: 50,
      symmetry: 50,
      confidence: 0,
      timestamp,
      frameId: `error_${timestamp}`
    };
  }
};

export interface UseFaceLandmarkerReturn {
  // State
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  landmarks: FaceLandmarkData | null;
  
  // Emotion features
  processEmotionFeatures: (socket: WebSocket | null, isSpeaking: boolean) => void;
  
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
  
  // Refs for emotion processing
  const lastSentTimeRef = useRef<number>(0);
  const latencyTrackerRef = useRef<Map<string, number>>(new Map());

  /**
   * Initialize MediaPipe FaceLandmarker
   */
  const initialize = useCallback(async () => {
    if (faceLandmarkerRef.current) return;

    try {
      setError(null);
      
      // Use CDN for wasm files (pinned to specific version to avoid breaking changes)
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
      );

      // Create FaceLandmarker instance with model path resolved via build pipeline
      const faceLandmarker = await FaceLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: `${import.meta.env.BASE_URL}models/face_landmarker.task`, 
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
      // Always reset processing state to prevent UI getting stuck
      setIsProcessing(false);
    }
  }, [enabled]);

  /**
   * Process landmarks and send compressed emotion features to server
   */
  const processEmotionFeatures = useCallback((socket: WebSocket | null, isSpeaking: boolean) => {
    if (!landmarks || !landmarks.landmarks || landmarks.landmarks.length === 0) {
      return;
    }
    
    try {
      // Extract compressed features (this runs on client)
      const features = extractCompressedFeatures(
        landmarks.landmarks[0],
        landmarks.confidence,
        landmarks.timestamp
      );
 
      
      // Only send when user is speaking and throttle to max 5 fps
      const now = Date.now();
      if (!isSpeaking || now - lastSentTimeRef.current < 200) { // 200ms = 5fps
        return;
      }
      
      // Send to server only if connected
      if (socket?.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({
          type: 'emotion_features',
          data: features
        });
        
        // Track for latency measurement
        latencyTrackerRef.current.set(features.frameId, now);
        
        socket.send(payload);
        lastSentTimeRef.current = now;
        
      }
      
    } catch (err) {
      console.error('Failed to process emotion features:', err);
      setError('Emotion processing failed');
    }
  }, [landmarks]);

  /**
   * Clean up MediaPipe resources
   */
  const cleanup = useCallback(() => {
    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
    }
    // Clear emotion processing data
    latencyTrackerRef.current.clear();
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
    processEmotionFeatures,
    initialize,
    processFrame,
    cleanup
  };
};
