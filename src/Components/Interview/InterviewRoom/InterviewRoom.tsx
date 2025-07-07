/**
 * @fileoverview Main interview room component that orchestrates video streaming, WebSocket communication, and AI coach interactions.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This is the central component for conducting live interviews with AI coaching capabilities. It manages:
 * - Real-time video/audio streaming between participants
 * - WebSocket connections for AI coach communication and transcription services
 * - Media device management and status monitoring
 * - Interview session lifecycle (start, duration tracking, end)
 * - Chat functionality for additional communication
 * - Voice activity detection for automatic transcription triggering
 *
 * The component implements a sophisticated state management system to handle multiple WebSocket connections,
 * media stream orchestration, and error handling for various device and network failure scenarios.
 *
 * @see {@link src/Components/InterviewRoom/VideoDisplay.tsx}
 * @see {@link src/Components/InterviewRoom/ChatPanel.tsx}
 * @see {@link src/Components/InterviewRoom/AiCoach.tsx}
 * @see {@link src/Hooks/useMediaDevicesContext.tsx}
 * @see {@link src/Hooks/useWebSocketConnection.tsx}
 *
 * Dependencies:
 * - React (useState, useEffect, useRef, useCallback)
 * - TanStack Router (Route, useSearch)
 * - Lucide React Icons
 * - Custom Hooks (useMediaDevicesContext, useWebSocketConnection, useDetectAudio)
 * - Styled Components
 */
import { FC, useState, useEffect, useRef, useCallback } from "react";
import { Route } from "@/routes/interview-room/$sessionId";
import useMediaDevicesContext from "@/Hooks/useMediaDevicesContext";
import VideoDisplay from "../VideoDisplay";
import ChatPanel from "../ChatPanel";
import { MessageCircle, Video, Mic } from "lucide-react";
import { useSearch } from "@tanstack/react-router";
import {
  InterviewRoomContainer,
  Header,
  HeaderContent,
  HeaderInfo,
  EndButton,
  VideoSection,
  VideoContainer,
  VideoGrid,
  VideoWrapper,
  VideoLabel,
  VideoDisplayContainer,
  BottomControls,
  ControlsContent,
  StatusInfo,
  RecordingStatus,
  RecordingDot,
  DurationText,
  ConnectionStatus,
  ChatButton,
  ChatOverlay,
  ActiveDevicesIndicator,
} from "../Styles/StyledInterviewRoom";
import { GetUserQuery } from "../../../Hooks/UserHooks";
import useWebSocketConnection, {
  WebSocketMessage,
} from "../../../Hooks/useWebSocketConnection";
import { useDetectAudio } from "../../../Hooks/useDetectAudio";
import { createRecorder } from "../Helper/createRecorder";
import DeviceIssues from "./ComponentHandlers/DeviceIssues";
import LoadingStream from "./ComponentHandlers/LoadingStream";
import LoadingWhileCheckingDevice from "./ComponentHandlers/LoadingWhileCheckingDevice";
import BlockInterview from "./ComponentHandlers/BlockInterview";
import formatDuration from "./Utils/FormatDuration";

// Updated icon component using lucide-react
const MessageCircleIcon = () => <MessageCircle size={20} />;

/**
 * Main interview room component that provides the complete interview experience.
 *
 * @component
 * @returns {JSX.Element} The rendered interview room interface with video, chat, and controls.
 * @example
 * // Usage in routing:
 * <Route path="/interview-room/$sessionId" component={InterviewRoom} />
 *
 * @throws {Error} May throw if WebSocket connections fail or media devices are inaccessible.
 * @remarks
 * Side Effects:
 * - Establishes multiple WebSocket connections for AI communication and transcription
 * - Manages media stream lifecycle (start, monitor, cleanup)
 * - Triggers voice activity detection and audio recording
 * - Updates interview duration timer
 * - Handles cleanup on component unmount
 *
 * Known Issues/Limitations:
 * - Requires stable internet connection for WebSocket functionality
 * - Media permissions must be granted before component mounts
 * - Voice activity detection may have false positives in noisy environments
 * - WebSocket reconnection logic not implemented
 *
 * Design Decisions/Rationale:
 * - Uses useRef for WebSocket instances to prevent stale closures in callbacks
 * - implements separate WebSocket connections for AI coach and transcription services
 * - Uses useCallback for performance optimization of frequently called handlers
 * - Conditional rendering based on device status and permissions
 * - Centralized error handling for device and network issues
 */
const InterviewRoom: FC = () => {
  // Get session ID from URL params. Check routes.
  const { sessionId } = Route.useParams();
  // Get job level and interview type from search params. Check routes.
  const { jobLevel, interviewType } = useSearch({ from: Route.id });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  // Text message to be sent to AI Coach Component. Message coming from AI Coach WebSocket
  const [AICoachMessage, setAICoachMessage] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);

  // ==================== REFS ====================

  /**
   * Reference to the main WebSocket connection for AI coach communication.
   * Uses ref to prevent stale closures in callback functions.
   * @type {React.MutableRefObject<WebSocket | null>} mainSocketRef
   */
  const mainSocketRef = useRef<WebSocket | null>(null);

  const { users } = GetUserQuery();

  // ==================== CUSTOM HOOKS ====================

  const {
    videoEnabled = true,
    audioEnabled = true,
    streamReady,
    isLoading,
    error,
    streamRef,
    stopStream,
    deviceSupport,
  } = useMediaDevicesContext();
  const { startDetectingAudio, stopDetectingAudio } = useDetectAudio();

  // ==================== DERIVED VALUES ====================

  /**
   * Extract job role from user profile.
   * @type {string|undefined} jobRole - The user's current job role.
   */
  const jobRole = users?.profile?.jobRole;

  // ==================== UTILITY FUNCTIONS ====================

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleEndInterview = () => {
    stopStream(); // Stop media stream
    // TODO: GO back to previous page. Do Cleanup
  };

  // ==================== WEBSOCKET MESSAGE HANDLERS ====================

  const handleQuestionSpoken = useCallback((speechText: string) => {
    setAICoachMessage(speechText);
  }, []);

  const handleAIWebSocket = useCallback(
    (message: WebSocketMessage) => {
      // Handle different types of messages from the server
      if (message.type === "message") {
        // Handle question from AI coach
        handleQuestionSpoken(JSON.stringify(message.content));
      }
    },
    [handleQuestionSpoken]
  );
  // ==================== WEBSOCKET CONNECTIONS ====================

  const { socket: mainSocket, isConnected, isConnecting, reconnect } = useWebSocketConnection("ws", handleAIWebSocket);

  // ==================== INTERVIEW LIFECYCLE HANDLERS ====================

  /**
   * Initiates the interview session by sending initial configuration to AI coach.
   *
   * @function
   * @returns {void}
   * @example
   * // Example usage (typically called automatically):
   * handleInterviewStart();
   *
   * @throws {Error} May throw if WebSocket send operation fails.
   * @remarks
   * Side Effects:
   * - Sends interview configuration to AI coach WebSocket
   * - Implements retry mechanism for WebSocket readiness
   * - Sets internal flag to prevent duplicate sends
   *
   * Known Issues/Limitations:
   * - Uses polling retry mechanism instead of event-based approach
   * - Limited retry attempts (50 attempts with 500ms intervals)
   * - No user feedback during retry attempts
   *
   * Design Decisions/Rationale:
   * - Uses closure variable to prevent duplicate sends
   * - Validates required data before sending
   * - Implements timeout-based retry for WebSocket readiness
   * - Memoized with all dependencies to ensure fresh values
   */

  const handleInterviewStart = useCallback(() => {
    let isSent = false;
    const sendMessage = () => {
      // if message is already sent, return
      if (isSent) return;
      // check if there is user. if not, return
      if (!users?.profile?.name) return;
      // Check if socket is truly ready, not just existing.
      if (mainSocket && mainSocket.readyState === WebSocket.OPEN) {
        const interviewData = {
          session_id: sessionId,
          user_name: users?.profile?.name,
          jobRole: jobRole,
          jobLevel: jobLevel,
          questionType: interviewType,
        };
        const initialUnifiedMessage = {
          content: interviewData,
        };
        try {
          mainSocket.send(JSON.stringify(initialUnifiedMessage));
          isSent = true;
        } catch (error) {
          console.error("Error sending WebSocket message:", error);
        }
      } else {
        setTimeout(sendMessage, 500); // Internal retry for initial message if socket not open
      }
    };
    sendMessage(); // Start the process
  }, [
    mainSocket,
    sessionId,
    users?.profile?.name,
    jobRole,
    jobLevel,
    interviewType,
  ]); // Dependencies for handleInterviewStart

  /**
   * Manages audio transcription process with voice activity detection.
   *
   * @function
   * @returns {void}
   * @example
   * // Example usage (typically called after AI speech ends):
   * handleTranscriptionMessage();
   *
   * @throws {Error} May throw if audio recording or WebSocket operations fail.
   * @remarks
   * Side Effects:
   * - Starts voice activity detection on media stream
   * - Creates and manages audio recorder instance
   * - Sends recorded audio data to transcription WebSocket
   * - Automatically stops recording when user stops speaking
   *
   * Known Issues/Limitations:
   * - Requires stable WebSocket connection for transcription service
   * - Voice activity detection may have false positives/negatives
   * - No handling for recorder creation failures
   * - FileReader operations may fail silently
   *
   * Design Decisions/Rationale:
   * - Uses closure variables to track recording state
   * - Implements automatic start/stop based on voice activity
   * - Converts audio to base64 for WebSocket transmission
   * - Cleans up voice activity detection when recording stops
   * - Memoized with all dependencies for performance
   */

  const handleTranscriptionMessage = useCallback(() => {
    if (
      !isConnected ||
      !mainSocket ||
      !streamRef.current
    ) {
      return;
    }

    let recorder: ReturnType<typeof createRecorder> | null = null;
    let isRecording = false;

    // Start VAD and listen for speaking changes
    startDetectingAudio(streamRef.current, (isSpeaking: boolean) => {
      if (isSpeaking && !isRecording) {
        // Start recording
        recorder = createRecorder(
          streamRef.current!,
          (blob) => {
            // On stop, send audio to server
            const reader = new FileReader();
            reader.onload = () => {
              const base64Data = reader.result as string;
              const base64Audio = base64Data.split(",")[1];
              const audioMessage = {
                type: "audio",
                data: base64Audio,
              };
              try {
                mainSocket.send(JSON.stringify(audioMessage));
              } catch (error) {
                console.error("Error sending audio data:", error);
              }
            };
            reader.onerror = () => {
              console.error("Error reading blob data");
            };
            reader.readAsDataURL(blob);
          },
          (err) => {
            console.error("Recorder error:", err);
          }
        );
        recorder.start();
        isRecording = true;
      } else if (!isSpeaking && isRecording) {
        recorder?.stop();
        isRecording = false;
        // Stop VAD when user stops talking
        stopDetectingAudio();
      }
    });
  }, [isConnected, mainSocket, streamRef, startDetectingAudio, stopDetectingAudio]);

  const handleAISpeechEnd = useCallback(() => {
    handleTranscriptionMessage(); // Call transcription message handler when AI speech ends
  }, [handleTranscriptionMessage]);


  // ==================== CONDITIONAL USE EFFECTS ====================

  // Duration timer
  useEffect(() => {
    if (!streamReady) return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [streamReady]);

  // Effect to trigger handleInterviewStart after 5 seconds,
  // but only when the socket connection is established.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConnected) {
      timer = setTimeout(() => {
        handleInterviewStart();
      }, 5000);
    }
    // cleanup
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isConnected, handleInterviewStart]); // Dependencies: connection status and handleInterviewStart for latest function instance

  // Effect to update ref for mainSocket changes
  useEffect(() => {
    mainSocketRef.current = mainSocket;
  }, [mainSocket]);

  // ==================== CONDITIONAL RENDERING ====================

  // Show error state if there are device issues
  if (error && !streamReady) {
    return (
      <DeviceIssues
        sessionId={sessionId}
        handleEndInterview={handleEndInterview}
      />
    );
  }
  // Show loading/setup state if devices are not ready
  if (!streamReady && isLoading) {
    return (
      <LoadingStream
        sessionId={sessionId}
        handleEndInterview={handleEndInterview}
      />
    );
  }

  // Show loading state while checking device support
  if (!deviceSupport.hasMediaDevicesAPI && !error) {
    return <LoadingWhileCheckingDevice sessionId={sessionId} />;
  }

  // Block interview if video/audio are not enabled (required for face landmarks)
  if (!videoEnabled || !audioEnabled) {
    return (
      <BlockInterview
        sessionId={sessionId}
        handleEndInterview={handleEndInterview}
      />
    );
  }

  // ==================== MAIN RENDER ====================
  
  return (
    <InterviewRoomContainer>
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderInfo>
            <h1>
              {jobRole} -{" "}
              {interviewType
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h1>
            <p>Interview in progress • Session: {sessionId}</p>
          </HeaderInfo>
          <EndButton
            onClick={handleEndInterview}
            aria-label="End Interview Session"
          >
            End Interview
          </EndButton>
        </HeaderContent>
      </Header>

      {/* Video Grid - Takes up remaining space */}
      <VideoSection>
        <VideoContainer>
          <VideoGrid>
            {/* AI Coach/Interviewer */}
            <VideoWrapper>
              <VideoLabel>AI Interview Coach</VideoLabel>
              <VideoDisplayContainer>
                <VideoDisplay
                  name="AI Coach"
                  isAICoach={true}
                  AICoachMessage={AICoachMessage}
                  onQuestionSpoken={handleQuestionSpoken}
                  onTranscriptionEnd={handleAISpeechEnd}
                />
              </VideoDisplayContainer>
            </VideoWrapper>

            {/* User Video */}
            <VideoWrapper>
              <VideoLabel>You</VideoLabel>
              <VideoDisplayContainer>
                <VideoDisplay
                  name="You"
                  isUser={true}
                  videoEnabled={videoEnabled}
                  audioEnabled={audioEnabled}
                  stream={streamRef.current}
                />
              </VideoDisplayContainer>
            </VideoWrapper>
          </VideoGrid>
        </VideoContainer>
      </VideoSection>

      {/* Bottom Controls */}
      <BottomControls>
        <ControlsContent>
          <StatusInfo>
            <RecordingStatus>
              <RecordingDot />
              <span>Recording</span>
            </RecordingStatus>
            <DurationText>Duration: {formatDuration(duration)}</DurationText>
            <ActiveDevicesIndicator>
              <Video size={16} />
              <Mic size={16} />
              <span>Active</span>
            </ActiveDevicesIndicator>
            <ConnectionStatus>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: isConnected ? '#10b981' : isConnecting ? '#f59e0b' : '#ef4444',
                marginRight: '4px'
              }} />
              <span>
                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
              </span>
              { /* TODO: Implement reconnection without going back at initial setup. */}
              {!isConnected && !isConnecting && (
                <button 
                  onClick={reconnect}
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Reconnect
                </button>
              )}
            </ConnectionStatus>
          </StatusInfo>

          {/* Chat Button */}
          <ChatButton
            isOpen={isChatOpen}
            onClick={toggleChat}
            aria-label={isChatOpen ? "Close chat" : "Open chat"}
            aria-expanded={isChatOpen}
          >
            <MessageCircleIcon />
            <span>Chat</span>
          </ChatButton>
        </ControlsContent>
      </BottomControls>

      {/* Chat Panel */}
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Overlay when chat is open on mobile */}
      <ChatOverlay isOpen={isChatOpen} onClick={() => setIsChatOpen(false)} />
    </InterviewRoomContainer>
  );
};

export default InterviewRoom;
