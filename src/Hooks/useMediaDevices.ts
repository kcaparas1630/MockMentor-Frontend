import { useState, useEffect, useRef } from "react";
import { MediaDeviceSupport } from "../Types/MediaDevices/MediaDeviceSupport";

export interface UseMediaDevicesReturn {
  // State
  videoEnabled: boolean;
  audioEnabled: boolean;
  streamReady: boolean;
  isLoading: boolean;
  error: string | null;
  deviceSupport: MediaDeviceSupport;
  permissionStatus: "granted" | "denied" | "prompt" | "unknown";
  
  // Refs
  streamRef: React.RefObject<MediaStream | null>;
  
  // Actions
  toggleVideo: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  startStream: (videoState?: boolean, audioState?: boolean) => Promise<void>;
  stopStream: () => void;
  checkDeviceSupport: () => Promise<void>;
}

/**
 * Custom hook for managing camera/microphone access and streams
 * Can be reused across video testing page and interview room
 */
export const useMediaDevices = (): UseMediaDevicesReturn => {
  // Refs for media streams
  const streamRef = useRef<MediaStream | null>(null);
  
  // Basic UI state
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Device capabilities
  const [deviceSupport, setDeviceSupport] = useState<MediaDeviceSupport>({
    hasCamera: false,
    hasMicrophone: false,
    hasMediaDevicesAPI: false,
  });
  
  // Browser permission status
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");

  /**
   * Detects available media devices and browser support
   */
  const checkDeviceSupport = async () => {
    setIsLoading(true);

    try {
      // Check browser API support
      const hasMediaDevicesAPI = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );

      if (!hasMediaDevicesAPI) {
        setDeviceSupport({
          hasCamera: false,
          hasMicrophone: false,
          hasMediaDevicesAPI: false,
        });
        setError(
          "Your browser doesn't support camera/microphone access. Please use a modern browser."
        );
        setIsLoading(false);
        return;
      }

      // Enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((device) => device.kind === "videoinput");
      const hasMicrophone = devices.some(
        (device) => device.kind === "audioinput"
      );

      setDeviceSupport({
        hasCamera,
        hasMicrophone,
        hasMediaDevicesAPI,
      });

      // Set appropriate error messages
      if (!hasCamera && !hasMicrophone) {
        setError(
          "No camera or microphone devices found. Please connect your devices and refresh the page."
        );
      } else if (!hasCamera) {
        setError(
          "No camera found. Please connect your camera and refresh the page."
        );
      } else if (!hasMicrophone) {
        setError(
          "No microphone found. Please connect your microphone and refresh the page."
        );
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Device support check failed:", err);
      setError(
        "Unable to access camera/microphone. Please check your browser permissions."
      );
    }

    setIsLoading(false);
  };

  /**
   * Starts media stream with specified constraints
   */
  const startStream = async (
    videoState = videoEnabled,
    audioState = audioEnabled
  ) => {
    if (!deviceSupport.hasMediaDevicesAPI) return;

    setIsLoading(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceSupport.hasCamera && videoState,
        audio: deviceSupport.hasMicrophone && audioState
        ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        }
        : false
      };

      if (!constraints.video && !constraints.audio) {
        setIsLoading(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      setStreamReady(true);
      setPermissionStatus("granted");
    } catch (err) {
      console.error("Stream start failed:", err);
      const error = err as DOMException;

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setError(
          "Camera/microphone access denied. Please allow permissions and try again."
        );
        setPermissionStatus("denied");
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        setError(
          "No camera/microphone found. Please connect your devices and try again."
        );
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        setError("Camera/microphone is already in use by another application.");
      } else {
        setError(
          `Unable to access camera/microphone: ${error.message || "Unknown error"}`
        );
      }

      setVideoEnabled(false);
      setAudioEnabled(false);
    }

    setIsLoading(false);
  };

  /**
   * Stops all media tracks and cleans up
   */
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreamReady(false);
  };

  /**
   * Toggles video on/off
   */
  const toggleVideo = async () => {
    if (!deviceSupport.hasCamera) return;

    const newVideoState = !videoEnabled;
    setVideoEnabled(newVideoState);

    if (streamRef.current) {
      // Stream exists - toggle tracks
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = newVideoState;
      });
    } else {
      // No stream - create new one if needed
      if (newVideoState || audioEnabled) {
        await startStream(newVideoState, audioEnabled);
      }
    }
  };

  /**
   * Toggles audio on/off
   */
  const toggleAudio = async () => {
    if (!deviceSupport.hasMicrophone) return;

    const newAudioState = !audioEnabled;
    setAudioEnabled(newAudioState);

    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = newAudioState;
        });
      } else if (newAudioState) {
        // No audio tracks but user wants audio - recreate stream
        stopStream();
        await startStream(videoEnabled, newAudioState);
      }
    } else {
      // No stream - create one if needed
      if (videoEnabled || newAudioState) {
        await startStream(videoEnabled, newAudioState);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  // Auto-check device support on mount
  useEffect(() => {
    checkDeviceSupport();
  }, []);

  return {
    // State
    videoEnabled,
    audioEnabled,
    streamReady,
    isLoading,
    error,
    deviceSupport,
    permissionStatus,
    
    // Refs
    streamRef,
    
    // Actions
    toggleVideo,
    toggleAudio,
    startStream,
    stopStream,
    checkDeviceSupport,
  };
}; 
