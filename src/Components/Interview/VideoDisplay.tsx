/**
 * @fileoverview Video display component that renders video streams and AI coach interface for interview participants.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This component handles the display of video streams for both users and AI coaches in the interview room.
 * It manages video element lifecycle, provides fallback interfaces for disabled devices, and integrates
 * with the AI coach component for interactive interview experiences. The component is responsible for
 * visual feedback about device status and requirements, making it central to the interview room interface.
 *
 * @see {@link src/Components/InterviewRoom/AiCoach.tsx}
 * @see {@link src/Components/InterviewRoom/Styles/StyledInterviewRoom.ts}
 * @see {@link src/Components/InterviewRoom/Styles/StyledVideoDisplay.ts}
 *
 * Dependencies:
 * - React
 * - Lucide React Icons
 * - Styled Components
 * - AI Coach Component
 */

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
import AICoach, { AICoachMessageState } from "./AiCoach";
import SessionState from "@/Types/SessionState";

/**
 * Props interface for the VideoDisplay component.
 *
 * @interface
 * @property {string} name - Display name for the video participant.
 * Constraints/Format: Must be a non-empty string
 * @property {boolean} [isUser=false] - Whether this display represents the current user.
 * @property {boolean} [isAICoach=false] - Whether this display represents the AI coach.
 * @property {boolean} [videoEnabled=true] - Whether video is enabled for this participant.
 * @property {boolean} [audioEnabled=true] - Whether audio is enabled for this participant.
 * @property {AICoachMessageState} [AICoachMessage] - AI coach state object containing speaking states and text.
 * Constraints/Format: Must contain valid boolean values for state flags and optional text for speech synthesis
 * @property {MediaStream|null} [stream] - Video stream to display.
 * @property {function} [onTranscriptionEnd] - Callback when AI speech transcription ends.
 * @property {function} [onToggleVideo] - Callback to toggle video state.
 * @property {function} [onToggleAudio] - Callback to toggle audio state.
 * @property {function} [onQuestionSpoken] - Callback when AI coach finishes speaking.
 * Constraints/Format: Must accept speechText string parameter
 */
interface VideoDisplayProps {
  name: string;
  isUser?: boolean;
  isAICoach?: boolean;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  AICoachMessage?: AICoachMessageState;
  currentQuestionText?: string;
  sessionState?: SessionState;
  stream?: MediaStream | null;
  processFrame?: (videoElement: HTMLVideoElement) => void;
  isInitialized?: boolean;
  onTranscriptionEnd?: () => void;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onQuestionSpoken?: (speechText: string) => void;
}

/**
 * Video display component that renders video streams and participant interfaces.
 *
 * @component
 * @param {VideoDisplayProps} props - Component props for video display configuration.
 * @returns {JSX.Element} The rendered video display with appropriate interface elements.
 * @example
 * // Usage for user video:
 * <VideoDisplay
 *   name="User Name"
 *   isUser={true}
 *   stream={userStream}
 *   videoEnabled={true}
 * />
 *
 * // Usage for AI coach:
 * <VideoDisplay
 *   name="AI Coach"
 *   isAICoach={true}
 *   AICoachMessage="Hello, let's begin the interview"
 *   onQuestionSpoken={handleQuestionComplete}
 * />
 *
 * @throws {Error} May throw if video element fails to play stream.
 * @remarks
 * Side Effects:
 * - Sets video element source when stream changes
 * - Triggers video playback
 * - Renders AI coach interface with speech synthesis
 *
 * Known Issues/Limitations:
 * - Video play may fail in some browsers without user interaction
 * - Muted user video to prevent feedback (no audio output for user)
 * - Limited error handling for video playback failures
 *
 * Design Decisions/Rationale:
 * - Conditional rendering based on participant type (user vs AI coach)
 * - Provides visual indicators for device status
 * - Shows initials as fallback when video is disabled
 * - Integrates AI coach component for interactive experience
 */
const VideoDisplay: FC<VideoDisplayProps> = ({
  name,
  isUser = false,
  isAICoach = false,
  videoEnabled = true,
  audioEnabled = true,
  stream,
  sessionState,
  AICoachMessage,
  currentQuestionText,
  processFrame,
  isInitialized,
  onQuestionSpoken,
  onTranscriptionEnd,
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
      videoRef.current.srcObject = null;
    }
  }, [stream, videoEnabled]);

  useEffect(() => {
    if (!videoRef.current || !isInitialized) return;
    const processVideoFrame = () => {
      if (processFrame) {
        processFrame(videoRef.current!);
        requestAnimationFrame(processVideoFrame);
      }
    };
    requestAnimationFrame(processVideoFrame);
  }, [isInitialized, processFrame]);

  /**
   * Generates initials from a participant name for avatar display.
   *
   * @function
   * @param {string} name - The participant's full name.
   * Constraints/Format: Must be a non-empty string
   * @returns {string} Uppercase initials (maximum 2 characters).
   * Example Return Value: "JD" for "John Doe"
   * @example
   * // Example usage:
   * const initials = getInitials("John Doe");
   * console.log(initials); // "JD"
   *
   * @throws {Error} Does not throw but may return empty string for invalid input.
   * @remarks
   * Side Effects: None (pure function)
   *
   * Known Issues/Limitations:
   * - Only takes first letter of each word
   * - Limited to 2 characters maximum
   * - Does not handle special characters or non-Latin scripts
   *
   * Design Decisions/Rationale:
   * - Simple algorithm for consistent avatar generation
   * - Uppercase for visual consistency
   * - Handles multiple words by taking first letter of each
   */
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
          AICoachMessage={AICoachMessage}
          currentQuestionText={currentQuestionText}
          sessionState={sessionState}
          onQuestionSpoken={onQuestionSpoken}
          onTranscriptionEnd={onTranscriptionEnd}
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
          {videoEnabled ? (
            <Video size={12} />
          ) : (
            <DisabledIconWrapper>
              <Video size={12} />
              <DisabledIcon>
                <X size={8} />
              </DisabledIcon>
            </DisabledIconWrapper>
          )}
          {audioEnabled ? (
            <Mic size={12} />
          ) : (
            <DisabledIconWrapper>
              <Mic size={12} />
              <DisabledIcon>
                <X size={8} />
              </DisabledIcon>
            </DisabledIconWrapper>
          )}
          <RequiredLabel>Required</RequiredLabel>
        </RequiredIndicatorsContainer>
      )}
    </VideoDisplayWrapper>
  );
};

export default VideoDisplay;
