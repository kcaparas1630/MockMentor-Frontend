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
import useWebSocketConnection, { WebSocketMessage } from "../../Hooks/useWebSocketConnection";

// Updated icon component using lucide-react
const MessageCircleIcon = () => <MessageCircle size={20} />;



const InterviewRoom: FC = () => {
  const { sessionId } = Route.useParams();
  const { jobLevel, interviewType } = useSearch({ from: Route.id });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [AICoachMessage, setAICoachMessage] = useState<string>('');
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

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    // Handle different types of messages from the server
    if (message.type === 'message') {
      // Handle question from AI coach
      handleQuestionSpoken(message.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const socket = useWebSocketConnection(handleWebSocketMessage);

  // Duration timer
  useEffect(() => {
    if (!streamReady) return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [streamReady]);

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
  // TODO: Remove these handlers and use Web-VAD to detect when the user is speaking
  // AI Coach handlers
  const handleInterviewStart = () => {
    // Function to send message when connection is ready
    const sendMessage = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const interviewData = {
          session_id: sessionId,
          user_name: users?.profile?.name,
          jobRole: jobRole,
          jobLevel: jobLevel,
          questionType: interviewType
        }
        const initialUnifiedMessage = {
          content: interviewData
        };
    
        socket.send(JSON.stringify(initialUnifiedMessage));
      } else {
        console.log("WebSocket not ready, retrying in 500ms...");
        // Retry after a short delay if not connected
        setTimeout(sendMessage, 500);
      }
    };
    sendMessage();
  };

  const handleQuestionSpoken = (speechText: string) => {
    setAICoachMessage(speechText);
  };


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

  return (
    <InterviewRoomContainer>
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderInfo>
            <h1>
              {jobRole} - {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}
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
                  onInterviewStart={handleInterviewStart}
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
