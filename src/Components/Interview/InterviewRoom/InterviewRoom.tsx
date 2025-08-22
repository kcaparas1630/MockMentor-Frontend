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
import SessionTabs from "../SessionTabs";
import { ClipboardList, Video, Mic } from "lucide-react";
import { useSearch } from "@tanstack/react-router";
import InitialInterviewData from "@/Types/InitialInterviewData";
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
import DeviceIssues from "./ComponentHandlers/DeviceIssues";
import LoadingStream from "./ComponentHandlers/LoadingStream";
import LoadingWhileCheckingDevice from "./ComponentHandlers/LoadingWhileCheckingDevice";
import BlockInterview from "./ComponentHandlers/BlockInterview";
import formatDuration from "./Utils/FormatDuration";
import { useNavigate } from "@tanstack/react-router";
import SessionState from "@/Types/SessionState";
import { AICoachMessageState } from "../AiCoach";
import { useFaceLandmarker } from "@/Hooks/useFaceLandmarker";
import { LandmarkItem } from "@/Types/LandmarkData";


// Updated icon component using lucide-react
const ClipboardListIcon = () => <ClipboardList size={20} />;
// Key landmark indices for behavioral analysis (eyes, mouth, nose, eyebrows)
  const KEY_LANDMARK_INDICES = [
    // Left eye (6 points): 362, 382, 381, 380, 374, 373
    362, 382, 381, 380, 374, 373,
    // Right eye (6 points): 33, 7, 163, 144, 145, 153
    33, 7, 163, 144, 145, 153,
    // Mouth outer (12 points): 61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318
    61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318,
    // Mouth inner (8 points): 78, 95, 88, 178, 87, 14, 317, 402
    78, 95, 88, 178, 87, 14, 317, 402,
    // Nose (5 points): 1, 2, 5, 4, 6
    1, 2, 5, 4, 6,
    // Left eyebrow (5 points): 46, 53, 54, 55, 56
    46, 53, 54, 55, 56,
    // Right eyebrow (5 points): 285, 295, 296, 334, 293
    285, 295, 296, 334, 293
  ];

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
  const { jobLevel, interviewType, currentQuestion, aiInstructions } = useSearch({ from: Route.id });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  // AI Coach message state object containing speaking states and text
  const [AICoachMessage, setAICoachMessage] = useState<AICoachMessageState>({ 
    isAISpeaking: false, 
    isWaitingForAI: true 
  });
  const [duration, setDuration] = useState<number>(0);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentQuestionText, setCurrentQuestionText] = useState<string | undefined>( currentQuestion || "" );
  const [sessionState, setSessionState] = useState<SessionState> ({
    userReady: false,
  });
  // Track WebSocket messages for SessionTabs
  const [wsMessages, setWsMessages] = useState<WebSocketMessage[]>([]);
  const [wsTranscripts, setWsTranscripts] = useState<WebSocketMessage[]>([]);
  // Landmark collection for behavioral analysis
  const landmarkBufferRef = useRef<LandmarkItem[]>([]);
  const navigate = useNavigate();

  // ==================== REFS ====================

  /**
   * Reference to the main WebSocket connection for AI coach communication.
   * Uses ref to prevent stale closures in callback functions.
   * @type {React.MutableRefObject<WebSocket | null>} mainSocketRef
   */
  const mainSocketRef = useRef<WebSocket | null>(null);
  const isAISpeakingRef = useRef<boolean>(false);

  const { users } = GetUserQuery();

  const currentQuestionTextRef = useRef<string | undefined>(currentQuestionText || "");


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

  // Landmarks with emotion processing
  const { landmarks, isInitialized, processFrame, processEmotionFeatures } = useFaceLandmarker(
    streamRef.current,
    videoEnabled
  );

  // Collect landmarks during speech periods (filtered key points only)
  const lastCollectionTimeRef = useRef<number>(0);
  const COLLECTION_INTERVAL_MS = 3000; // Collect every 3000ms for smooth behavioral analysis
  
  
  
  useEffect(() => {
    if (landmarks && isStreaming) {
      const now = Date.now();
      if (now - lastCollectionTimeRef.current >= COLLECTION_INTERVAL_MS) {
        // Filter to only key landmarks for behavioral analysis and remove visibility data
        const filteredLandmarks = landmarks.landmarks.map((face: Array<{x: number; y: number; z?: number}>) => 
          KEY_LANDMARK_INDICES.map(index => face[index]).filter(Boolean).map(landmark => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z
          }))
        );
        
        const landmarkData: LandmarkItem = {
          landmarks: filteredLandmarks,
          confidence: landmarks.confidence,
          timeStamp: now
        };
        landmarkBufferRef.current.push(landmarkData);
        lastCollectionTimeRef.current = now;
      }
    }
  }, [landmarks, isStreaming]);

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
    navigate({ to: "/video-test" });
  };

  const updateCurrentQuestionText = useCallback((questionText: string | undefined) => {
    setCurrentQuestionText(questionText);
    currentQuestionTextRef.current = questionText;
  }, []);


  // ==================== WEBSOCKET MESSAGE HANDLERS ====================

  const handleQuestionSpoken = useCallback((speechText: string) => {
    const questionToUse = currentQuestionTextRef.current || currentQuestion;
    updateCurrentQuestionText(questionToUse);
    setAICoachMessage({
      isAISpeaking: true,
      isWaitingForAI: false,
      text: speechText
    });
  }, [currentQuestion, updateCurrentQuestionText]);
  
  const handleAIWebSocket = useCallback(
    (message: WebSocketMessage) => {
      // Store messages for SessionTabs
      if (message.type === "message") {
        setWsMessages(prev => [...prev, message]);
        // Handle question from AI coach
        handleQuestionSpoken(JSON.stringify(message.content));
        setSessionState((prev) => ({
          ...prev,
          userReady: message.state?.ready ?? false,
      }));
      } else if (message.next_question && message.type === "next_question") {
        setWsMessages(prev => [...prev, message]);
        const fullMessage = `${message.content} Here's your next question ${message.next_question.question}`;
        handleQuestionSpoken(fullMessage);
        // Handle new question data
        updateCurrentQuestionText(message.next_question.question);
      } else if (message.type === "transcript") {
        setWsTranscripts(prev => [...prev, message]);
        console.log("Transcript received:", message.content);
      } else if (message.type === "incremental_transcript") {
        console.log("Incremental transcript received:", message.content);
      } else if (message.type === "error") {
        console.error("Error received:", message.content);
      }
    },
    [handleQuestionSpoken, updateCurrentQuestionText]
  );
  // ==================== WEBSOCKET CONNECTIONS ====================

  const {
    socket: mainSocket,
    isConnected,
    isConnecting,
    reconnect,
  } = useWebSocketConnection("ws", handleAIWebSocket);

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
        const interviewData: InitialInterviewData = {
          session_id: sessionId,
          user_name: users?.profile?.name,
          jobRole: jobRole,
          jobLevel: jobLevel,
          questionType: interviewType,
          aiInstructions: aiInstructions || "",
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
    aiInstructions,
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
    if (!isConnected || !mainSocket || !streamRef.current) {
      return;
    }
    if (isAISpeakingRef.current) {
      console.log("AI is speaking, skipping transcription");
      return;
    }
    // Start VAD and listen for speaking changes
    // Start audio detection with streaming callback
    startDetectingAudio(
      streamRef.current,
      (isSpeaking: boolean) => {
        if (isSpeaking) {
          setIsStreaming(true);
          // Clear any existing timeout
          if (streamingTimeoutRef.current) {
            clearTimeout(streamingTimeoutRef.current);
          }
        } else {
          // User stopped speaking - send end signal after delay
          streamingTimeoutRef.current = setTimeout(() => {
            if (mainSocket && mainSocket.readyState === WebSocket.OPEN) {
              try {
                console.log("Sending audio end signal and emotion analysis");
                
                // Set AI speaking to false and waiting for AI to true when audio_end is sent
                setAICoachMessage(prev => ({
                  ...prev,
                  isAISpeaking: false,
                  isWaitingForAI: true
                }));
                
                // Send audio end signal for text analysis first
                mainSocket.send(
                  JSON.stringify({
                    type: "audio_end",
                    timeStamp: Date.now(),
                  })
                );
                
              } catch (error) {
                console.error("Error sending audio end signal:", error);
              }
            }
            setIsStreaming(false);
          }, 500);
        }
      },
      (audioChunk: string, isSpeaking: boolean) => {
        if (!isSpeaking) {
          return;
        }

        // Stream audio chunks to server
        if (mainSocket && mainSocket.readyState === WebSocket.OPEN) {
          try {
            mainSocket.send(
              JSON.stringify({
                type: "audio_chunk",
                data: audioChunk,
                timeStamp: Date.now(),
                isSpeaking: isSpeaking,
              })
            );
            
            // Process emotion features when user is speaking
            processEmotionFeatures(mainSocket, isSpeaking);
          } catch (error) {
            console.error("Error sending audio chunk:", error);
          }
        }
      }
    );

    // cleanup function
    return () => {
      stopDetectingAudio();
    };
  }, [
    isConnected,
    mainSocket,
    streamRef,
    startDetectingAudio,
    stopDetectingAudio,
    processEmotionFeatures,
  ]);

  const handleAISpeechEnd = useCallback(() => {
    // stop any ongoing audio detection first
    stopDetectingAudio();

    // update ai speaking state
    setAICoachMessage(prev => ({
      ...prev,
      isAISpeaking: false,
      isWaitingForAI: false
    }));

    // Use a small delay to ensure all state updates are processed
    setTimeout(() => {
      handleTranscriptionMessage(); // Call transcription message handler when AI speech ends
    }, 100);
  }, [handleTranscriptionMessage, stopDetectingAudio]);

  // ==================== CONDITIONAL USE EFFECTS ====================

  // Duration timer
  useEffect(() => {
    if (!streamReady) return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [streamReady]);

  // Effect to trigger handleInterviewStart after 5 seconds and set waiting state,
  // but only when the socket connection is established.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConnected) {
      // Set waiting for AI state immediately when connected
      setAICoachMessage(prev => ({
        ...prev,
        isAISpeaking: false,
        isWaitingForAI: true
      }));
      
      timer = setTimeout(() => {
        handleInterviewStart();
      }, 2000); // Changed to 2 seconds as per user request
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

  // cleanup effect to stop audio detection when AI starts speaking
  useEffect(() => {
    if (AICoachMessage.isAISpeaking) {
      stopDetectingAudio();
      setIsStreaming(false);

      // Clear any pending timeout
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    }
  }, [AICoachMessage.isAISpeaking, stopDetectingAudio]);

  // Initialize the question from search params
  useEffect(() => {
    if (currentQuestion) {
      updateCurrentQuestionText(currentQuestion);
    }
  }, [currentQuestion, updateCurrentQuestionText]);

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
      <ChatButton
        isOpen={isChatOpen}
        onClick={toggleChat}
        aria-label={isChatOpen ? "Close session panel" : "Open session panel"}
        aria-expanded={isChatOpen}
      >
        <ClipboardListIcon />
      </ChatButton>
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
              <VideoLabel>MockMentor</VideoLabel>
              <VideoDisplayContainer>
                <VideoDisplay
                  name="MockMentor"
                  isAICoach={true}
                  sessionState={sessionState}
                  AICoachMessage={AICoachMessage}
                  currentQuestionText={currentQuestionText}
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
                  isInitialized={isInitialized}
                  processFrame={processFrame}
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
            {isStreaming && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#10b981",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    animation: "pulse 1s infinite",
                  }}
                />
                <span style={{ fontSize: "12px" }}>Streaming</span>
              </div>
            )}
            <ConnectionStatus>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isConnected
                    ? "#10b981"
                    : isConnecting
                      ? "#f59e0b"
                      : "#ef4444",
                  marginRight: "4px",
                }}
              />
              <span>
                {isConnected
                  ? "Connected"
                  : isConnecting
                    ? "Connecting..."
                    : "Disconnected"}
              </span>
              {!isConnected && !isConnecting && (
                <button
                  onClick={reconnect}
                  style={{
                    marginLeft: "8px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Reconnect
                </button>
              )}
            </ConnectionStatus>
          </StatusInfo>
        </ControlsContent>
      </BottomControls>
      {/* Session Tabs Panel */}
      <SessionTabs 
        isOpen={isChatOpen}
        interviewType={interviewType}
        messages={wsMessages}
        transcripts={wsTranscripts}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Overlay when tabs are open on mobile */}
      <ChatOverlay isOpen={isChatOpen} onClick={() => setIsChatOpen(false)} />
    </InterviewRoomContainer>
  );
};

export default InterviewRoom;
