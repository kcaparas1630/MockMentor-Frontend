import {
  FC,
  useState,
  useEffect,
  useRef,
} from "react";
import { Video, Mic, VideoOff, MicOff } from "lucide-react";
import ReusableSelect from "../../Commons/Select";
import LoadingSpinner from "../../Commons/Spinner";
import {
  Container,
  GridContainer,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  VideoPreview,
  VideoElement,
  VideoPlaceholder,
  ControlsContainer,
  ControlButton,
  InstructionsContainer,
  InstructionItem,
  StatusMessage,
  InterviewSettingsContainer,
  SettingsCard,
  SettingsCardHeader,
  SettingsCardTitle,
  SettingsCardContent,
  ButtonContainer,
  StartInterviewButton,
  MicTestContainer,
  MicTestHeader,
  MicTestTitle,
  MicTestContent,
  MicTestDescription,
  MicTestControls,
  MicTestButton,
  AudioLevelContainer,
  AudioLevelBar,
  AudioLevelText,
} from "./Styles/StyledVideoTestCard";
import { useMediaDevices } from "../../Hooks/useMediaDevices";
import { useMicTesting } from "../../Hooks/useMicTesting";
import { getUserToken } from "../../Hooks/UserHooks";
import axios from "axios";
import { useRouter } from "@tanstack/react-router";



const VideoTestCard: FC = () => {
  const router = useRouter();
  // Use the custom hook for all media device logic
  const {
    videoEnabled,
    audioEnabled,
    streamReady,
    isLoading,
    error: mediaError,
    deviceSupport,
    permissionStatus,
    streamRef,
    toggleVideo,
    toggleAudio,
  } = useMediaDevices();

  // Use the custom hook for microphone testing
  const {
    isMicTesting,
    audioLevel,
    error: micError,
    startMicTest: startMicTestHook,
    stopMicTest,
  } = useMicTesting();

  // Component-specific refs
  const videoRef = useRef<HTMLVideoElement>(null);

  // Interview start button state. Nothing important. Just changing the text of the button.
  const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);
  // Interview settings state
  const [jobLevel, setJobLevel] = useState<string>("");
  const [interviewType, setInterviewType] = useState<string>("");
  // TODO: Add interview types to Database and fetch from there.
  const interviewTypes = [
    { value: "technical", label: "Technical Interview" },
    { value: "behavioral", label: "Behavioral Interview" },
    { value: "system-design", label: "System Design" },
    { value: "coding-challenge", label: "Coding Challenge" },
    { value: "hr-round", label: "HR Round" },
  ];
  const jobLevels = [
    { value: "Entry-Level", label: "Entry-Level" },
    { value: "Mid-Level", label: "Mid-Level" },
    { value: "Senior-Level", label: "Senior-Level" },
    { value: "Staff-Level", label: "Staff-Level" },
    { value: "Principal-Level", label: "Principal-Level" },
  ];

  // Combine errors from both hooks
  const [error, setError] = useState<string | null>(mediaError || micError);
  // Wrapper function for mic testing that handles audio enabling
  const startMicTest = async () => {
    if (!deviceSupport.hasMicrophone) return;

    // Ensure audio is enabled first
    if (!audioEnabled) {
      await toggleAudio();
    }

    // Wait for stream to be ready
    let attempts = 0;
    const maxAttempts = 50;
    while (!streamRef.current && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    if (!streamRef.current) {
      console.error("Stream not ready after timeout");
      return;
    }

    // Start mic testing with the current stream
    if (streamRef.current) {
      await startMicTestHook(streamRef.current);
    }
  };

  // Connect the media stream to the video element when both are ready
  useEffect(() => {
    if (videoRef.current && streamRef.current && videoEnabled && streamReady) {
      // Set the stream as the source for the video element
      videoRef.current.srcObject = streamRef.current;

      // Start playing the video - catch errors in case autoplay is blocked
      videoRef.current.play().catch(() => {
        setError(
          "Video autoplay is blocked. Please click video to start playing."
        );
      });
    }
  }, [videoEnabled, streamReady, streamRef]);

  // Auto-stop mic testing when audio is disabled
  useEffect(() => {
    if (!audioEnabled && isMicTesting) {
      stopMicTest();
    }
  }, [audioEnabled, isMicTesting, stopMicTest]);

  // Returns appropriate status message based on current state
  const getStatusMessage = () => {
    if (error) {
      return <StatusMessage type="error">{error}</StatusMessage>;
    }

    if (permissionStatus === "granted" && (videoEnabled || audioEnabled)) {
      return (
        <StatusMessage type="success">
          Camera and microphone are working properly!
        </StatusMessage>
      );
    }

    if (!deviceSupport.hasMediaDevicesAPI) {
      return (
        <StatusMessage type="error">
          Your browser doesn't support camera/microphone access.
        </StatusMessage>
      );
    }

    if (!deviceSupport.hasCamera && !deviceSupport.hasMicrophone) {
      return (
        <StatusMessage type="warning">
          No camera or microphone devices detected.
        </StatusMessage>
      );
    }

    return (
      <StatusMessage type="info">
        Click the buttons below to test your camera and microphone.
      </StatusMessage>
    );
  };

  const handleStartInterview = async () => {
    // Get User Token for Firebase Auth verification
    const userToken = await getUserToken();
    setIsInterviewStarted(true);
    const response = await axios.post(
      "http://localhost:3000/api/start-interview",
      { jobLevel, interviewType },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    setTimeout(() => {
      if (response.data?.sessionId) {
        router.navigate({
          to: `/interview-room/${response.data.sessionId}`,
          params: { sessionId: response.data.sessionId },
        });
      }
    }, 1000); // 1 seconds delay 
  };

  // Renders different video content based on current state
  const renderVideoContent = () => {
    if (isLoading) {
      return (
        <VideoPlaceholder>
          <LoadingSpinner />
          <span>Initializing camera...</span>
        </VideoPlaceholder>
      );
    }

    if (videoEnabled && streamRef.current && deviceSupport.hasCamera) {
      return <VideoElement ref={videoRef} autoPlay muted playsInline />;
    }

    return (
      <VideoPlaceholder>
        {!deviceSupport.hasCamera
          ? "No camera detected"
          : !videoEnabled
            ? "Camera disabled"
            : "Loading camera..."}
      </VideoPlaceholder>
    );
  };

  return (
    <Container>
      <GridContainer>
        <Card>
          <CardHeader>
            <CardTitle>Camera & Microphone Test</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusMessage()}
            <VideoPreview>
              {renderVideoContent()}
              <ControlsContainer>
                <ControlButton
                  isActive={videoEnabled}
                  disabled={!deviceSupport.hasCamera || isLoading}
                  onClick={toggleVideo}
                  title={
                    !deviceSupport.hasCamera
                      ? "No camera available"
                      : videoEnabled
                        ? "Turn off camera"
                        : "Turn on camera"
                  }
                >
                  {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </ControlButton>
                <ControlButton
                  isActive={audioEnabled}
                  disabled={!deviceSupport.hasMicrophone || isLoading}
                  onClick={toggleAudio}
                  title={
                    !deviceSupport.hasMicrophone
                      ? "No microphone available"
                      : audioEnabled
                        ? "Turn off microphone"
                        : "Turn on microphone"
                  }
                >
                  {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </ControlButton>
              </ControlsContainer>
            </VideoPreview>

            {/* Microphone Test Section */}
            <MicTestContainer>
              <MicTestHeader>
                <MicTestTitle>MIC TEST</MicTestTitle>
              </MicTestHeader>
              <MicTestContent>
                <MicTestDescription>
                  Having mic issues? Start a test and speak to see if your
                  microphone is detecting your voice.
                </MicTestDescription>
                <MicTestControls>
                  <MicTestButton
                    onClick={isMicTesting ? stopMicTest : startMicTest}
                    disabled={!deviceSupport.hasMicrophone || !audioEnabled}
                    isRecording={isMicTesting}
                  >
                    {isMicTesting ? "Stop Testing" : "Start Testing"}
                  </MicTestButton>
                </MicTestControls>
                {isMicTesting && audioEnabled && (
                  <AudioLevelContainer>
                    <AudioLevelBar level={audioLevel} />
                    <AudioLevelText>
                      {audioLevel > 0.1
                        ? "Voice detected!"
                        : "Speak to test your microphone..."}
                    </AudioLevelText>
                  </AudioLevelContainer>
                )}
              </MicTestContent>
            </MicTestContainer>

            <InstructionsContainer>
              <InstructionItem>
                Make sure your camera and microphone are working properly
              </InstructionItem>
              <InstructionItem>
                Find a quiet, well-lit space for your interview
              </InstructionItem>
              <InstructionItem>
                Check your internet connection is stable
              </InstructionItem>
              <InstructionItem>
                Allow browser permissions when prompted
              </InstructionItem>
              <InstructionItem>
                Recommended to use Desktop for better experience.
              </InstructionItem>
            </InstructionsContainer>
          </CardContent>
        </Card>

        {/* Interview Settings */}
        <InterviewSettingsContainer>
          <SettingsCard>
            <SettingsCardHeader>
              <SettingsCardTitle>Interview Details</SettingsCardTitle>
            </SettingsCardHeader>
            <SettingsCardContent>
              <ReusableSelect
                name="job-level"
                label="Job Level"
                value={jobLevel}
                placeholder="Select Job Level"
                options={jobLevels}
                onChange={setJobLevel}
              />
              <ReusableSelect
                name="interview-type"
                label="Interview Type"
                value={interviewType}
                placeholder="Select Interview Type"
                options={interviewTypes}
                onChange={setInterviewType}
              />
            </SettingsCardContent>
          </SettingsCard>

          <ButtonContainer>
            <StartInterviewButton
              onClick={handleStartInterview}
              disabled={
                !interviewType ||
                !deviceSupport.hasCamera ||
                !deviceSupport.hasMicrophone
              }
            >
              {isInterviewStarted ? 
              <>
              <LoadingSpinner />
              <span>Starting Interview...</span>
              </>
              : "Start Interview"}
            </StartInterviewButton>
          </ButtonContainer>
        </InterviewSettingsContainer>
      </GridContainer>
    </Container>
  );
};

export default VideoTestCard;
