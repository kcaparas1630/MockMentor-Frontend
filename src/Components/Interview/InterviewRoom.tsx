import { FC, useState, useEffect } from "react";
import { Route } from "../../routes/interview-room/$sessionId";
import { useMediaDevicesContext } from "../../Hooks/useMediaDevicesContext";
import VideoDisplay from "./VideoDisplay";
import ChatPanel from "./ChatPanel";
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
} from "./Styles/StyledInterviewRoom";

// Simple icons
const MessageCircleIcon = () => <span>💬</span>;

interface InterviewRoomProps {
  jobRole?: string;
  interviewType?: string;
  onEndInterview?: () => void;
}

const InterviewRoom: FC<InterviewRoomProps> = ({
  jobRole = "Software Engineer",
  interviewType = "Technical Interview",
  onEndInterview,
}) => {
  const { sessionId } = Route.useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [duration, setDuration] = useState(0);

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

  // Mock interviewer states (in real app, this would come from video call service)
  const [interviewerVideoEnabled] = useState(true);
  const [interviewerAudioEnabled] = useState(true);

  useEffect(() => {
    console.log("InterviewRoom useEffect: streamReady:", streamReady);
    console.log("InterviewRoom useEffect: isLoading:", isLoading);
    console.log("InterviewRoom useEffect: videoEnabled:", videoEnabled);
    console.log("InterviewRoom useEffect: audioEnabled:", audioEnabled);
  }, [streamReady, isLoading, videoEnabled, audioEnabled]);

  // Duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleChat = () => {
    console.log("Toggling chat:", !isChatOpen);
    setIsChatOpen(!isChatOpen);
  };

  const handleEndInterview = () => {
    stopStream(); // Stop media stream
    if (onEndInterview) {
      onEndInterview();
    } else {
      // Default behavior - could navigate back or show confirmation
      console.log("Interview ended");
      alert("Interview ended. Thank you!");
    }
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
            <EndButton onClick={handleEndInterview}>Exit</EndButton>
          </HeaderContent>
        </Header>
        <VideoSection>
          <VideoContainer>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <h2 style={{ color: '#dc2626', margin: 0 }}>Camera & Microphone Required</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>
                This interview requires access to your camera and microphone for face landmark analysis and audio processing.
              </p>
              <p style={{ color: '#374151', margin: 0, fontSize: '0.875rem' }}>
                Error: {error}
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => startStream(true, true)} 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Retry Access
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Refresh Page
                </button>
              </div>
            </div>
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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <h2 style={{ color: '#374151', margin: 0 }}>Initializing Camera & Microphone</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Please allow access to your camera and microphone when prompted.
              </p>
            </div>
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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <h2 style={{ color: '#374151', margin: 0 }}>Detecting Devices</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Checking for camera and microphone availability...
              </p>
            </div>
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
            <EndButton onClick={handleEndInterview}>Exit</EndButton>
          </HeaderContent>
        </Header>
        <VideoSection>
          <VideoContainer>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <h2 style={{ color: '#dc2626', margin: 0 }}>Interview Cannot Proceed</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Both camera and microphone access are required for this interview.
              </p>
              <p style={{ color: '#374151', margin: 0, fontSize: '0.875rem' }}>
                We use MediaPipe for face landmark analysis and need audio for evaluation.
              </p>
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
                  <strong>Missing:</strong> {!videoEnabled && "Camera"} {!videoEnabled && !audioEnabled && " & "} {!audioEnabled && "Microphone"}
                </p>
              </div>
              <button 
                onClick={() => {
                  toggleVideo();
                  toggleAudio();
                  startStream(true, true);
                }} 
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Enable Camera & Microphone
              </button>
            </div>
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
            <h1>{interviewType} - {jobRole}</h1>
            <p>Interview in progress • Session: {sessionId}</p>
          </HeaderInfo>
          <EndButton onClick={handleEndInterview}>
            End Interview
          </EndButton>
        </HeaderContent>
      </Header>

      {/* Video Grid - Takes up remaining space */}
      <VideoSection>
        <VideoContainer>
          <VideoGrid>
            {/* Interviewer Video */}
            <VideoWrapper>
              <VideoLabel>Interviewer</VideoLabel>
              <VideoDisplayContainer>
                <VideoDisplay
                  name="MockMentor AI"
                  videoEnabled={interviewerVideoEnabled}
                  audioEnabled={interviewerAudioEnabled}
                  // No stream for mock interviewer - will show placeholder
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
            <DurationText>
              Duration: {formatDuration(duration)}
            </DurationText>
            <div style={{ 
              fontSize: "0.875rem", 
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem"
            }}>
              📹 🎤 <span>Active</span>
            </div>
          </StatusInfo>

          {/* Chat Button */}
          <ChatButton isOpen={isChatOpen} onClick={toggleChat}>
            <MessageCircleIcon />
            <span>Chat</span>
          </ChatButton>
        </ControlsContent>
      </BottomControls>

      {/* Chat Panel */}
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Overlay when chat is open on mobile */}
      <ChatOverlay
        isOpen={isChatOpen}
        onClick={() => setIsChatOpen(false)}
      />
    </InterviewRoomContainer>
  );
};

export default InterviewRoom;
