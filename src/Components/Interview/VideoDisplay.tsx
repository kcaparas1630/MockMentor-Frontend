import { FC, useEffect, useRef } from "react";
import {
  VideoDisplayWrapper,
  VideoElement,
  VideoPlaceholder,
  AvatarPlaceholder,
  NameLabel,
} from "./Styles/StyledInterviewRoom";

interface VideoDisplayProps {
  name: string;
  isUser?: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  stream?: MediaStream | null;
}

const VideoDisplay: FC<VideoDisplayProps> = ({
  name,
  isUser = false,
  videoEnabled,
  audioEnabled,
  stream,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("VideoDisplay useEffect:", { stream, videoEnabled, streamActive: stream?.active });
    
    if (videoRef.current && stream && videoEnabled) {
      console.log("Setting stream to video element:", stream);
      console.log("Stream tracks:", stream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted
      })));
      
      videoRef.current.srcObject = stream;
      
      // Try to play the video and log any errors
      videoRef.current.play().catch(error => {
        console.error("Video play failed:", error);
      });
    } else if (videoRef.current) {
      console.log("Clearing video element srcObject");
      videoRef.current.srcObject = null;
    }
  }, [stream, videoEnabled]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <VideoDisplayWrapper isUser={isUser}>
      <NameLabel>{name}</NameLabel>
      
      {videoEnabled && stream ? (
        <VideoElement
          ref={videoRef}
          autoPlay
          muted={isUser} // Mute user's own video to prevent feedback
          playsInline
        />
      ) : (
        <VideoPlaceholder>
          <AvatarPlaceholder>{getInitials(name)}</AvatarPlaceholder>
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            {videoEnabled ? "Loading video..." : "Camera required for interview"}
          </p>
          {!videoEnabled && (
            <p style={{ fontSize: "0.75rem", margin: "0.5rem 0 0 0", color: "#ef4444" }}>
              Please enable your camera to continue
            </p>
          )}
        </VideoPlaceholder>
      )}
      
      {/* Audio status indicator for non-user video */}
      {!isUser && !audioEnabled && (
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.75rem",
          }}
        >
          🔇
        </div>
      )}

      {/* Required indicators for user video */}
      {isUser && (
        <div
          style={{
            position: "absolute",
            bottom: "0.75rem",
            left: "0.75rem",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {videoEnabled ? "📹" : "📹❌"}
          {audioEnabled ? "🎤" : "🎤❌"}
          <span style={{ marginLeft: "0.25rem", fontSize: "0.625rem" }}>
            Required
          </span>
        </div>
      )}
    </VideoDisplayWrapper>
  );
};

export default VideoDisplay; 
