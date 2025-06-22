import { FC, useState, useEffect, useCallback } from "react";
import { Route } from "../../routes/interview-room/$sessionId";
import { useMediaDevicesContext } from "../../Hooks/useMediaDevicesContext";
import VideoDisplay from "./VideoDisplay";
import ChatPanel from "./ChatPanel";
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
  ChatButton,
  ChatOverlay,
  ErrorStateContainer,
  ErrorTitle,
  ErrorDescription,
  ErrorDetails,
  ErrorActions,
  RetryButton,
  RefreshButton,
  LoadingStateContainer,
  LoadingSpinner,
  LoadingTitle,
  LoadingDescription,
  MissingDevicesContainer,
  MissingDevicesTitle,
  MissingDevicesDescription,
  MissingDevicesDetails,
  MissingDevicesAlert,
  EnableDevicesButton,
  ActiveDevicesIndicator,
} from "./Styles/StyledInterviewRoom";
import { GetUserQuery } from "../../Hooks/UserHooks";
import useWebSocketConnection, {
  WebSocketMessage,
} from "../../Hooks/useWebSocketConnection";
import recordStream from "../../Hooks/useMediaRecorder";

// Updated icon component using lucide-react
const MessageCircleIcon = () => <MessageCircle size={20} />;

const InterviewRoom: FC = () => {
  const { sessionId } = Route.useParams();
  const { jobLevel, interviewType } = useSearch({ from: Route.id });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [AICoachMessage, setAICoachMessage] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const { users } = GetUserQuery();
  const jobRole = users?.profile?.jobRole;

  const {
    videoEnabled = true,
    audioEnabled = true,
    streamReady,
    isLoading,
    error,
    streamRef,
    startStream,
    stopStream,
    deviceSupport,
    toggleVideo,
    toggleAudio,
  } = useMediaDevicesContext();

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleEndInterview = () => {
    stopStream(); // Stop media stream
    console.log("Interview ended");
    alert("Interview ended. Thank you!");
  };

  // --------- Callbacks to handle parent and child communication --------- //
  // TODO: SEPARATE CONCERNS INTO DIFFERENT FILES
  // Use useCallback to memoize the function to prevent unnecessary re-renders
  const handleQuestionSpoken = useCallback((speechText: string) => {
    setAICoachMessage(speechText);
  }, []);

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      // Handle different types of messages from the server
      if (message.type === "message") {
        // Handle question from AI coach
        handleQuestionSpoken(JSON.stringify(message.content));
      }
    },
    [handleQuestionSpoken]
  );
  const mainSocket = useWebSocketConnection("ws", handleWebSocketMessage);
  const transcriptionSocket = useWebSocketConnection(
    "ws/transcription",
    handleWebSocketMessage
  );
  // TODO: Remove these handlers and use Web-VAD to detect when the user is speaking
  // AI Coach handlers
  // Use useCallback for handleInterviewStart to memoize it
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
        console.log(
          "WebSocket not ready, retrying initial message in 500ms..."
        );
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

  const handleTranscriptionMessage = useCallback(async () => {
    // Check if transaction is ready , not just ready.
    if (
      transcriptionSocket &&
      transcriptionSocket.readyState === WebSocket.OPEN
    ) {
      console.log("Starting audio recording");
      if (streamRef.current) {
        // Record the current stream`
        const blob = await recordStream(streamRef.current);
        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result as string;
          // Remove the data URL prefix (e.g., "data:audio/ogg;base64,")
          const base64Audio = base64Data.split(",")[1];

          // Send the audio data in the correct format
          const audioMessage = {
            type: "audio",
            data: base64Audio,
          };

          try {
            transcriptionSocket.send(JSON.stringify(audioMessage));
            console.log("Audio data sent to transcription service");
          } catch (error) {
            console.error("Error sending audio data:", error);
          }
        };

        reader.onerror = () => {
          console.error("Error reading blob data");
        };

        reader.readAsDataURL(blob);
      }
    }
  }, [transcriptionSocket, streamRef]);

  const handleAISpeechEnd = useCallback(() => {
    console.log("AI speech ended");
    handleTranscriptionMessage(); // Call transcription message handler when AI speech ends
  }, [handleTranscriptionMessage]);

  // ----------------- End of Callbacks ----------------- //

  // -------------------- USE EFFECTS --------------------

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
    if (mainSocket && mainSocket.readyState === WebSocket.OPEN) {
      console.log(
        "Socket is open, scheduling initial interview start in 5 seconds."
      );
      timer = setTimeout(() => {
        handleInterviewStart();
      }, 5000);
    }
    // cleanup
    return () => {
      if (timer) {
        clearTimeout(timer);
        console.log("Cleared initial interview start timer.");
      }
    };
  }, [mainSocket, handleInterviewStart]); // Dependencies: socket for connection, handleInterviewStart for latest function instance

  // ------------------------------------------------- //

  // TODO: Separate different concerns into different files.
  // Show error state if there are device issues
  if (error && !streamReady) {
    return (
      <InterviewRoomContainer>
        <Header>
          <HeaderContent>
            <HeaderInfo>
              <h1>Interview Room - {sessionId}</h1>
              <p>Camera/Microphone Required</p>
            </HeaderInfo>
            <EndButton
              onClick={handleEndInterview}
              aria-label="End Interview Session"
            >
              Exit
            </EndButton>
          </HeaderContent>
        </Header>
        <VideoSection>
          <VideoContainer>
            <ErrorStateContainer>
              <ErrorTitle>Camera & Microphone Required</ErrorTitle>
              <ErrorDescription>
                This interview requires access to your camera and microphone for
                face landmark analysis and audio processing.
              </ErrorDescription>
              <ErrorDetails>Error: {error}</ErrorDetails>
              <ErrorActions>
                <RetryButton onClick={() => startStream(true, true)}>
                  Retry Access
                </RetryButton>
                <RefreshButton onClick={() => window.location.reload()}>
                  Refresh Page
                </RefreshButton>
              </ErrorActions>
            </ErrorStateContainer>
          </VideoContainer>
        </VideoSection>
      </InterviewRoomContainer>
    );
  }

  // Show loading/setup state if devices are not ready
  if (!streamReady && isLoading) {
    return (
      <InterviewRoomContainer>
        <Header>
          <HeaderContent>
            <HeaderInfo>
              <h1>Interview Room - {sessionId}</h1>
              <p>Setting up devices...</p>
            </HeaderInfo>
          </HeaderContent>
        </Header>
        <VideoSection>
          <VideoContainer>
            <LoadingStateContainer>
              <LoadingSpinner />
              <LoadingTitle>Initializing Camera & Microphone</LoadingTitle>
              <LoadingDescription>
                Please allow access to your camera and microphone when prompted.
              </LoadingDescription>
            </LoadingStateContainer>
          </VideoContainer>
        </VideoSection>
      </InterviewRoomContainer>
    );
  }

  // Show loading state while checking device support
  if (!deviceSupport.hasMediaDevicesAPI && !error) {
    return (
      <InterviewRoomContainer>
        <Header>
          <HeaderContent>
            <HeaderInfo>
              <h1>Interview Room - {sessionId}</h1>
              <p>Checking device support...</p>
            </HeaderInfo>
          </HeaderContent>
        </Header>
        <VideoSection>
          <VideoContainer>
            <LoadingStateContainer>
              <LoadingSpinner />
              <LoadingTitle>Detecting Devices</LoadingTitle>
              <LoadingDescription>
                Checking for camera and microphone availability...
              </LoadingDescription>
            </LoadingStateContainer>
          </VideoContainer>
        </VideoSection>
      </InterviewRoomContainer>
    );
  }

  // Block interview if video/audio are not enabled (required for face landmarks)
  if (!videoEnabled || !audioEnabled) {
    return (
      <InterviewRoomContainer>
        <Header>
          <HeaderContent>
            <HeaderInfo>
              <h1>Interview Room - {sessionId}</h1>
              <p>Camera & Microphone Required</p>
            </HeaderInfo>
            <EndButton
              onClick={handleEndInterview}
              aria-label="End Interview Session"
            >
              Exit
            </EndButton>
          </HeaderContent>
        </Header>
        <VideoSection>
          <VideoContainer>
            <MissingDevicesContainer>
              <MissingDevicesTitle>
                Interview Cannot Proceed
              </MissingDevicesTitle>
              <MissingDevicesDescription>
                Both camera and microphone access are required for this
                interview.
              </MissingDevicesDescription>
              <MissingDevicesDetails>
                We use MediaPipe for face landmark analysis and need audio for
                evaluation.
              </MissingDevicesDetails>
              <MissingDevicesAlert>
                <p>
                  <strong>Missing:</strong> {!videoEnabled && "Camera"}{" "}
                  {!videoEnabled && !audioEnabled && " & "}{" "}
                  {!audioEnabled && "Microphone"}
                </p>
              </MissingDevicesAlert>
              <EnableDevicesButton
                onClick={() => {
                  toggleVideo();
                  toggleAudio();
                  startStream(true, true);
                }}
              >
                Enable Camera & Microphone
              </EnableDevicesButton>
            </MissingDevicesContainer>
          </VideoContainer>
        </VideoSection>
      </InterviewRoomContainer>
    );
  }
  // ------------- End of separation of concerns ------------- //
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
