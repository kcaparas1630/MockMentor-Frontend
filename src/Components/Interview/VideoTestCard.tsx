import { FC, useState, useEffect, useRef } from "react";
import { Video, Mic, VideoOff, MicOff } from "lucide-react";
import ReusableSelect from "../../Commons/Select";
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
  LoadingSpinner,
  InterviewSettingsContainer,
  SettingsCard,
  SettingsCardHeader,
  SettingsCardTitle,
  SettingsCardContent,
  ButtonContainer,
  StartInterviewButton,
} from "./Styles/StyledVideoTestCard";

interface MediaDeviceSupport {
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasMediaDevicesAPI: boolean;
}

const VideoTestCard: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceSupport, setDeviceSupport] = useState<MediaDeviceSupport>({
    hasCamera: false,
    hasMicrophone: false,
    hasMediaDevicesAPI: false,
  });
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  
  // Interview settings state
  const [interviewType, setInterviewType] = useState('');
  // TODO: Add interview types to Database and fetch from there.
  const interviewTypes = [
    { value: 'technical', label: 'Technical Interview' },
    { value: 'behavioral', label: 'Behavioral Interview' },
    { value: 'system-design', label: 'System Design' },
    { value: 'coding-challenge', label: 'Coding Challenge' },
    { value: 'hr-round', label: 'HR Round' },
  ];

  // Check device support on component mount
  useEffect(() => {
    checkDeviceSupport();
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const checkDeviceSupport = async () => {
    setIsLoading(true);
    
    try {
      // Check if MediaDevices API is supported
      const hasMediaDevicesAPI = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      
      if (!hasMediaDevicesAPI) {
        setDeviceSupport({
          hasCamera: false,
          hasMicrophone: false,
          hasMediaDevicesAPI: false,
        });
        setError("Your browser doesn't support camera/microphone access. Please use a modern browser.");
        setIsLoading(false);
        return;
      }

      // Enumerate available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');

      setDeviceSupport({
        hasCamera,
        hasMicrophone,
        hasMediaDevicesAPI,
      });

      if (!hasCamera && !hasMicrophone) {
        setError("No camera or microphone devices found. Please connect your devices and refresh the page.");
      } else if (!hasCamera) {
        setError("No camera found. Please connect your camera and refresh the page.");
      } else if (!hasMicrophone) {
        setError("No microphone found. Please connect your microphone and refresh the page.");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error checking device support:', err);
      setError("Unable to access camera/microphone. Please check your browser permissions.");
    }
    
    setIsLoading(false);
  };

  const startStream = async () => {
    if (!deviceSupport.hasMediaDevicesAPI) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceSupport.hasCamera && videoEnabled,
        audio: deviceSupport.hasMicrophone && audioEnabled,
      };

      if (!constraints.video && !constraints.audio) {
        setIsLoading(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current && constraints.video) {
        videoRef.current.srcObject = stream;
      }

      setPermissionStatus('granted');
    } catch (err) {
      console.error('Error accessing media devices:', err);
      const error = err as DOMException;
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError("Camera/microphone access denied. Please allow permissions and try again.");
        setPermissionStatus('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError("No camera/microphone found. Please connect your devices and try again.");
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setError("Camera/microphone is already in use by another application.");
      } else {
        setError(`Unable to access camera/microphone: ${error.message || 'Unknown error'}`);
      }
      
      // Reset toggles if stream failed
      setVideoEnabled(false);
      setAudioEnabled(false);
    }
    
    setIsLoading(false);
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleVideo = async () => {
    if (!deviceSupport.hasCamera) return;
    
    const newVideoState = !videoEnabled;
    setVideoEnabled(newVideoState);
    
    if (newVideoState || audioEnabled) {
      await startStream();
    } else if (!audioEnabled) {
      stopStream();
    }
  };

  const toggleAudio = async () => {
    if (!deviceSupport.hasMicrophone) return;
    
    const newAudioState = !audioEnabled;
    setAudioEnabled(newAudioState);
    
    if (newAudioState || videoEnabled) {
      await startStream();
    } else if (!videoEnabled) {
      stopStream();
    }
  };

  const getStatusMessage = () => {
    if (error) {
      return <StatusMessage type="error">{error}</StatusMessage>;
    }
    
    if (permissionStatus === 'granted' && (videoEnabled || audioEnabled)) {
      return <StatusMessage type="success">Camera and microphone are working properly!</StatusMessage>;
    }
    
    if (!deviceSupport.hasMediaDevicesAPI) {
      return <StatusMessage type="error">Your browser doesn't support camera/microphone access.</StatusMessage>;
    }
    
    if (!deviceSupport.hasCamera && !deviceSupport.hasMicrophone) {
      return <StatusMessage type="warning">No camera or microphone devices detected.</StatusMessage>;
    }
    
    return <StatusMessage type="info">Click the buttons below to test your camera and microphone.</StatusMessage>;
  };

  const handleStartInterview = () => {
    console.log('Starting interview with:', { interviewType });
    // Add your interview start logic here
  };

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
        {!deviceSupport.hasCamera ? 'No camera detected' : 
         !videoEnabled ? 'Camera disabled' : 'Loading camera...'}
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
            <InstructionsContainer>
              <InstructionItem>Make sure your camera and microphone are working properly</InstructionItem>
              <InstructionItem>Find a quiet, well-lit space for your interview</InstructionItem>
              <InstructionItem>Check your internet connection is stable</InstructionItem>
              <InstructionItem>Allow browser permissions when prompted</InstructionItem>
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
                name="interview-type"
                label="Interview Type"
                value={interviewType}
                placeholder="Select interview type"
                options={interviewTypes}
                onChange={setInterviewType}
              />
            </SettingsCardContent>
          </SettingsCard>

          <ButtonContainer>
            <StartInterviewButton
              onClick={handleStartInterview}
              disabled={!interviewType || !deviceSupport.hasCamera || !deviceSupport.hasMicrophone}
            >
              Start Interview
            </StartInterviewButton>
          </ButtonContainer>
        </InterviewSettingsContainer>
      </GridContainer>
    </Container>
  );
};

export default VideoTestCard;
