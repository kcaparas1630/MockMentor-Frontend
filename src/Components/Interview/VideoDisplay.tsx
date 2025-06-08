import { FC, useEffect, useRef } from "react";
import { MicOff, Video, Mic, X } from "lucide-react";
import {
  VideoDisplayWrapper,
  VideoElement,
  VideoPlaceholder,
  AvatarPlaceholder,
  NameLabel,
} from "./Styles/StyledInterviewRoom";
import {
  AudioStatusIndicator,
  RequiredIndicatorsContainer,
  DisabledIconWrapper,
  RequiredLabel,
  DisabledIcon,
  PlaceholderText,
  PlaceholderError,
} from "./Styles/StyledVideoDisplay";
import AICoach from "./AiCoach";

interface VideoDisplayProps {
  name: string;
  isUser?: boolean;
  isAICoach?: boolean;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  stream?: MediaStream | null;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onQuestionSpoken?: (question: string, questionIndex: number) => void;
  onInterviewStart?: () => void;
  onInterviewEnd?: () => void;
}

const VideoDisplay: FC<VideoDisplayProps> = ({
  name,
  isUser = false,
  isAICoach = false,
  videoEnabled = true,
  audioEnabled = true,
  stream,
  onQuestionSpoken,
  onInterviewStart,
  onInterviewEnd,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && videoEnabled) {
      videoRef.current.srcObject = stream;

      // Try to play the video and log any errors
      videoRef.current.play().catch((error) => {
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

  // If this is the AI Coach, render the special AI interface
  if (isAICoach) {
    return (
      <VideoDisplayWrapper isUser={isUser}>
        <NameLabel>{name}</NameLabel>
        <AICoach 
          isActive={true}
          onQuestionSpoken={onQuestionSpoken}
          onInterviewStart={onInterviewStart}
          onInterviewEnd={onInterviewEnd}
        />
      </VideoDisplayWrapper>
    );
  }

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
          <PlaceholderText>
            {videoEnabled
              ? "Loading video..."
              : "Camera required for interview"}
          </PlaceholderText>
          {!videoEnabled && (
            <PlaceholderError>
              Please enable your camera to continue
            </PlaceholderError>
          )}
        </VideoPlaceholder>
      )}

      {/* Audio status indicator for non-user video */}
      {!isUser && !audioEnabled && (
        <AudioStatusIndicator>
          <MicOff size={12} />
        </AudioStatusIndicator>
      )}

      {/* Required indicators for user video */}
      {isUser && (
        <RequiredIndicatorsContainer>
          {videoEnabled ? <Video size={12} /> : (
            <DisabledIconWrapper>
              <Video size={12} />
              <DisabledIcon>
                <X size={8} />
              </DisabledIcon>
            </DisabledIconWrapper>
          )}
          {audioEnabled ? <Mic size={12} /> : (
            <DisabledIconWrapper>
              <Mic size={12} />
              <DisabledIcon>
                <X size={8} />
              </DisabledIcon>
            </DisabledIconWrapper>
          )}
          <RequiredLabel>
            Required
          </RequiredLabel>
        </RequiredIndicatorsContainer>
      )}
    </VideoDisplayWrapper>
  );
};

export default VideoDisplay;
