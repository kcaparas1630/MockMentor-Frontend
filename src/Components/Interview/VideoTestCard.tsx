/**
 * @fileoverview Video and microphone test card for pre-interview device readiness, with real-time feedback and settings selection.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file implements the device test card for interview preparation, allowing users to test their camera and microphone, view real-time feedback, and select interview settings. It integrates with custom hooks for device management and provides accessibility and error handling throughout the device check process.
 *
 * Plays a crucial role in ensuring users are technically ready for interviews by validating device functionality and collecting interview preferences.
 *
 * @see {@link src/Components/InterviewRoom/InterviewRoom.tsx}
 * @see {@link src/Components/Interview/Styles/StyledVideoTestCard.ts}
 * @see {@link src/Hooks/useMicTesting.ts}
 *
 * Dependencies:
 * - React (useState, useEffect, useRef)
 * - Lucide React Icons (Video, Mic, VideoOff, MicOff)
 * - Custom hooks (useMicTesting, useMediaDevicesContext)
 * - Styled Components
 * - Axios
 */
import { FC, useState, useEffect, useRef, useCallback } from "react";
import { Video, Mic, VideoOff, MicOff } from "lucide-react";
import ReusableSelect from "@/Commons/Select";
import LoadingSpinner from "@/Commons/Spinner";
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
  StartButtonRequirements,
  HelperText,
  SaveIndicator,
  ValidationFeedback,
  ValidationList,
  TextAreaContainer,
} from "./Styles/StyledVideoTestCard";
import { useMicTesting } from "@/Hooks/useMicTesting";
import { getUserToken } from "@/Hooks/UserHooks";
import axios from "axios";
import { useRouter } from "@tanstack/react-router";
import useMediaDevicesContext from "@/Hooks/useMediaDevicesContext";
import { useCalibration } from "@/Hooks/useCalibration";
import { ToastContainer, toast } from "react-toastify";
import ReusableTextArea from "@/Commons/ReusableTextArea";
import { aiInstructionValidator, ValidationResult } from "@/Utils/AIInstructionValidator";

const baseUrl = import.meta.env.VITE_EXPRESS_URL || "http://localhost:3000";
const TEXTAREA_PLACEHOLDER = `Act as an experienced HR interviewer. Follow these guidelines:
1. Use the STAR method (Situation, Task, Action, Result) for all behavioral questions
2. Focus on past experiences and concrete examples
3. Ask follow-up questions like:
   - "What was your specific role in that situation?"
   - "What would you do differently next time?"
   - "How did you measure success?"
4. Evaluate leadership, teamwork, problem-solving, and communication skills
5. Maintain a warm but professional tone
6. Allow time for thoughtful responses`;
/**
 * Video and microphone test card component for pre-interview device readiness.
 *
 * @component
 * @returns {JSX.Element} The rendered device test card with camera/mic test and interview settings.
 * @example
 * // Usage in onboarding flow:
 * <VideoTestCard />
 *
 * @throws {Error} May throw if device APIs are unavailable or interview start fails.
 * @remarks
 * Side Effects:
 * - Connects media streams to video element
 * - Starts/stops microphone test using custom hook
 * - Handles interview start API call and navigation
 *
 * Known Issues/Limitations:
 * - No support for multiple cameras/microphones
 * - No advanced troubleshooting or diagnostics
 * - Interview types/job levels are hardcoded (should be fetched from backend)
 *
 * Design Decisions/Rationale:
 * - Uses custom hooks for device management and mic testing
 * - Provides real-time feedback and accessibility
 * - Integrates settings selection for interview configuration
 */
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
  } = useMediaDevicesContext();

  // Use the custom hook for microphone testing
  const {
    isMicTesting,
    audioLevel,
    error: micError,
    startMicTest: startMicTestHook,
    stopMicTest,
    calibrate,
    isCalibrating,
  } = useMicTesting();

  // Use calibration context
  const { setThresholds } = useCalibration();

  // Component-specific refs
  const videoRef = useRef<HTMLVideoElement>(null);

  // Interview start button state. Nothing important. Just changing the text of the button.
  const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);
  // Interview settings state
  const [jobLevel, setJobLevel] = useState<string>("");
  const [interviewType, setInterviewType] = useState<string>("");
  const [interviewInstructions, setInterviewInstructions] =
    useState<string>("");
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [aiInstructionValidation, setAiInstructionValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  const [showAiInstructionFeedback, setShowAiInstructionFeedback] = useState(false);
  // Check if calibration thresholds exist in localStorage
  const [hasCalibrationThresholds, setHasCalibrationThresholds] =
    useState<boolean>(false);
  // TODO: Add interview types to Database and fetch from there.
  const interviewTypes = [
    { value: "technical", label: "Technical Interview" },
    { value: "behavioral", label: "Behavioral Interview" },
    { value: "system-design", label: "System Design" },
    { value: "coding-challenge", label: "Coding Challenge" },
    { value: "hr-round", label: "HR Round" },
  ];
  const jobLevels = [
    { value: "entry", label: "Entry-Level" },
    { value: "mid", label: "Mid-Level" },
    { value: "senior", label: "Senior-Level" },
    { value: "staff", label: "Staff-Level" },
    { value: "principal", label: "Principal-Level" },
  ];

  // Handle AI instruction validation
  const validateAiInstructions = useCallback((instructions: string) => {
    const validation = aiInstructionValidator.validateInstructions(instructions);
    setAiInstructionValidation(validation);
    setShowAiInstructionFeedback(instructions.length > 0);
    return validation;
  }, []);

  // Handle Validation errors for interview settings
  const validateForm = useCallback(() => {
    const errors: string[] = [];
    if (!jobLevel) {
      errors.push("Please select a job level.");
    }
    if (!interviewType) {
      errors.push("Please select an interview type.");
    }
    if (!videoEnabled) {
      errors.push("Camera is required for the interview.");
    }
    if (!audioEnabled) {
      errors.push("Microphone is required for the interview.");
    }
    if (!hasCalibrationThresholds) {
      errors.push(
        "Please calibrate your microphone before starting the interview."
      );
    }
    
    // Validate AI instructions if provided
    if (interviewInstructions.trim()) {
      const aiValidation = validateAiInstructions(interviewInstructions);
      if (!aiValidation.isValid) {
        errors.push("AI instructions contain errors. Please review and fix them.");
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [
    jobLevel,
    interviewType,
    videoEnabled,
    audioEnabled,
    hasCalibrationThresholds,
    interviewInstructions,
    validateAiInstructions,
  ]);

  const isFormValid = validationErrors.length === 0;

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

  // Wrapper function for calibration
  const startCalibration = async () => {
    if (!deviceSupport.hasMicrophone || !streamRef.current) return;

    try {
      const thresholds = await calibrate(streamRef.current);
      toast.success("Calibration completed successfully");
      // Store thresholds in context
      setThresholds(thresholds);

      // Store thresholds in localStorage
      localStorage.setItem(
        "audio_calibration_thresholds",
        JSON.stringify(thresholds)
      );
      setHasCalibrationThresholds(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Calibration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

   // Handle AI instruction changes with validation
  const handleAiInstructionsChange = useCallback((value: string) => {
    setInterviewInstructions(value);
  }, []);

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

  // Check for existing calibration thresholds in localStorage
  useEffect(() => {
    const storedThresholds = localStorage.getItem(
      "audio_calibration_thresholds"
    );
    setHasCalibrationThresholds(!!storedThresholds);
  }, []);

  // Auto-stop mic testing when audio is disabled
  useEffect(() => {
    if (!audioEnabled && isMicTesting) {
      stopMicTest();
    }
  }, [audioEnabled, isMicTesting, stopMicTest]);

  // Auto-Validate Form when settings change
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  useEffect(() => {
    // Debounced validation for real-time feedback
    const timeoutId = setTimeout(() => {
      if (interviewInstructions.trim()) {
        validateAiInstructions(interviewInstructions);
      } else {
        setShowAiInstructionFeedback(false);
        setAiInstructionValidation({ isValid: true, errors: [], warnings: [] });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [interviewInstructions, validateAiInstructions]);

  // TODO: Determine if this is needed, for now it's just a user feedback with no functionality.
  // Debounced save indicator
  useEffect(() => {
    if (interviewInstructions.length > 0) {
      setShowSaveIndicator(true);
      const timer = setTimeout(() => setShowSaveIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [interviewInstructions]);

  /**
   * Returns appropriate status message based on current device and error state.
   *
   * @function
   * @returns {JSX.Element} Status message element for UI.
   * @remarks
   * Side Effects: None (pure function)
   */
  const getStatusMessage = () => {
    if (error) {
      return (
        <StatusMessage type="error" role="alert">
          {error}
        </StatusMessage>
      );
    }

    if (permissionStatus === "granted" && (videoEnabled || audioEnabled)) {
      return (
        <StatusMessage type="success" role="status">
          Camera and microphone are working properly!
        </StatusMessage>
      );
    }

    if (!deviceSupport.hasMediaDevicesAPI) {
      return (
        <StatusMessage type="error" role="alert">
          Your browser doesn't support camera/microphone access.
        </StatusMessage>
      );
    }

    if (!deviceSupport.hasCamera && !deviceSupport.hasMicrophone) {
      return (
        <StatusMessage type="warning" role="alert">
          No camera or microphone devices detected.
        </StatusMessage>
      );
    }

    return (
      <StatusMessage type="info" role="status">
        Click the buttons below to test your camera and microphone.
      </StatusMessage>
    );
  };

  /**
   * Handles the interview start process, including API call and navigation.
   *
   * @function
   * @returns {Promise<void>} Resolves when interview is started or error is handled.
   * @throws {Error} Sets error state if API call fails.
   * @remarks
   * Side Effects:
   * - Calls backend API to start interview
   * - Navigates to interview room on success
   */
  const handleStartInterview = async () => {
    try {
      // Validate form before starting interview
      if (!validateForm()) {
        return;
      }
      // Get User Token for Firebase Auth verification
      const userToken = await getUserToken();
      setIsInterviewStarted(true);
      const response = await axios.post(
        `${baseUrl}/api/start-interview`,
        { jobLevel, interviewType },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setTimeout(() => {
        if (response.data?.sessionId) {
          // Sanitize AI instructions before sending to interview room
          let sanitizedInstructions = "";
          if (interviewInstructions.trim()) {
            try {
              const validation = aiInstructionValidator.validateInstructions(interviewInstructions);
              sanitizedInstructions = validation.sanitizedText || "";
            } catch (error) {
              console.error("AI instruction sanitization failed:", error);
              setError("Failed to process interview instructions. Please try again.")
              setIsInterviewStarted(false);
              return;
            }
          }
          
          const searchParams = {
            interviewType,
            jobLevel,
            currentQuestion: response.data.currentQuestion?.question,
            aiInstructions: sanitizedInstructions,
          };
          router.navigate({
            to: `/interview-room/${response.data.sessionId}`,
            search: searchParams,
          });
        }
      }, 1000);
    } catch (error) {
      setIsInterviewStarted(false);
      setError("Error starting interview. Please try again.");
      console.error("Error starting interview:", error);
    }
  };

  /**
   * Renders the video preview or placeholder based on device state.
   *
   * @function
   * @returns {JSX.Element} Video element or placeholder.
   * @remarks
   * Side Effects: None (pure function)
   */
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
      return (
        <VideoElement
          ref={videoRef}
          autoPlay
          muted
          playsInline
          aria-label="Camera preview"
        />
      );
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
      <ToastContainer />
      <main>
        <GridContainer>
          <Card as="section" aria-labelledby="device-test-title">
            <CardHeader>
              <CardTitle id="device-test-title">
                Camera & Microphone Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusMessage()}
              <VideoPreview>
                {renderVideoContent()}
                <ControlsContainer
                  role="toolbar"
                  aria-label="Media device controls"
                >
                  <ControlButton
                    isActive={videoEnabled}
                    disabled={!deviceSupport.hasCamera || isLoading}
                    onClick={toggleVideo}
                    aria-label={
                      !deviceSupport.hasCamera
                        ? "No camera available"
                        : videoEnabled
                          ? "Turn off camera"
                          : "Turn on camera"
                    }
                    title={
                      !deviceSupport.hasCamera
                        ? "No camera available"
                        : videoEnabled
                          ? "Turn off camera"
                          : "Turn on camera"
                    }
                  >
                    {videoEnabled ? (
                      <Video size={20} />
                    ) : (
                      <VideoOff size={20} />
                    )}
                  </ControlButton>
                  <ControlButton
                    isActive={audioEnabled}
                    disabled={!deviceSupport.hasMicrophone || isLoading}
                    onClick={toggleAudio}
                    aria-label={
                      !deviceSupport.hasMicrophone
                        ? "No microphone available"
                        : audioEnabled
                          ? "Turn off microphone"
                          : "Turn on microphone"
                    }
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
              <MicTestContainer as="section" aria-labelledby="mic-test-title">
                <MicTestHeader>
                  <MicTestTitle id="mic-test-title">MIC TEST</MicTestTitle>
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
                      aria-label={
                        isMicTesting
                          ? "Stop microphone test"
                          : "Start microphone test"
                      }
                      aria-describedby="mic-test-description"
                    >
                      {isMicTesting ? "Stop Testing" : "Start Testing"}
                    </MicTestButton>
                    <MicTestButton
                      onClick={startCalibration}
                      disabled={
                        !deviceSupport.hasMicrophone ||
                        !audioEnabled ||
                        isCalibrating
                      }
                      isRecording={isCalibrating}
                      aria-label={
                        isCalibrating
                          ? "Calibration in progress"
                          : "Start microphone calibration"
                      }
                    >
                      {isCalibrating
                        ? "Calibrating..."
                        : hasCalibrationThresholds
                          ? "Recalibrate"
                          : "Calibrate"}
                    </MicTestButton>
                  </MicTestControls>
                  {isMicTesting && audioEnabled && (
                    <AudioLevelContainer
                      role="progressbar"
                      aria-label="Audio level"
                    >
                      <AudioLevelBar
                        level={audioLevel}
                        aria-valuenow={Math.round(audioLevel * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Audio level: ${Math.round(audioLevel * 100)}%`}
                      />
                      <AudioLevelText id="audio-level-status">
                        {audioLevel > 0.1
                          ? "Voice detected!"
                          : "Speak to test your microphone..."}
                      </AudioLevelText>
                    </AudioLevelContainer>
                  )}
                  {isCalibrating && audioEnabled && (
                    <AudioLevelContainer
                      role="progressbar"
                      aria-label="Audio level"
                    >
                      <AudioLevelBar
                        level={audioLevel}
                        aria-valuenow={Math.round(audioLevel * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Audio level: ${Math.round(audioLevel * 100)}%`}
                      />
                      <AudioLevelText id="audio-level-status">
                        Calibrating... Please speak naturally for 5 seconds
                      </AudioLevelText>
                    </AudioLevelContainer>
                  )}
                </MicTestContent>
              </MicTestContainer>

              <InstructionsContainer
                as="section"
                aria-labelledby="instructions-title"
              >
                <h4
                  id="instructions-title"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    margin: "0 0 0.5rem 0",
                    color: "#374151",
                  }}
                >
                  Pre-Interview Checklist
                </h4>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  <InstructionItem as="li">
                    Make sure your camera and microphone are working properly
                  </InstructionItem>
                  <InstructionItem as="li">
                    Find a quiet, well-lit space for your interview
                  </InstructionItem>
                  <InstructionItem as="li">
                    Check your internet connection is stable
                  </InstructionItem>
                  <InstructionItem as="li">
                    Allow browser permissions when prompted
                  </InstructionItem>
                  <InstructionItem as="li">
                    Recommended to use Desktop for better experience
                  </InstructionItem>
                </ul>
              </InstructionsContainer>
            </CardContent>
          </Card>

          {/* Interview Settings */}
          <InterviewSettingsContainer
            as="aside"
            aria-labelledby="settings-title"
          >
            <SettingsCard as="section">
              <SettingsCardHeader>
                <SettingsCardTitle id="settings-title">
                  Interview Details
                </SettingsCardTitle>
              </SettingsCardHeader>
              <SettingsCardContent>
                <form>
                  <fieldset
                    style={{
                      border: "none",
                      margin: 0,
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <legend className="sr-only">Interview Configuration</legend>
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
                    <TextAreaContainer>
                      <ReusableTextArea
                        name="interview-instructions"
                        placeholder={TEXTAREA_PLACEHOLDER}
                        label="Interview Instructions"
                        value={interviewInstructions}
                        onChange={handleAiInstructionsChange}
                      />
                      
                      {/* Validation Feedback */}
                      {showAiInstructionFeedback && (
                        <>
                          {aiInstructionValidation.errors.length > 0 && (
                            <ValidationFeedback type="error">
                              <strong>❌ Validation Errors:</strong>
                              <ValidationList>
                                {aiInstructionValidation.errors.map((error, index) => (
                                  <li key={`error-${index}`}>{error}</li>
                                ))}
                              </ValidationList>
                            </ValidationFeedback>
                          )}
                          
                          {aiInstructionValidation.warnings.length > 0 && (
                            <ValidationFeedback type="warning">
                              <strong>⚠️ Suggestions:</strong>
                              <ValidationList>
                                {aiInstructionValidation.warnings.map((warning, index) => (
                                  <li key={`warning-${index}`}>{warning}</li>
                                ))}
                              </ValidationList>
                            </ValidationFeedback>
                          )}
                          
                          {aiInstructionValidation.isValid && 
                           aiInstructionValidation.errors.length === 0 && 
                           aiInstructionValidation.warnings.length === 0 && (
                            <ValidationFeedback type="success">
                              ✅ Instructions look good! AI will use these guidelines during the interview.
                            </ValidationFeedback>
                          )}
                        </>
                      )}
                      
                      <SaveIndicator show={showSaveIndicator}>
                        ✓ Changes saved
                      </SaveIndicator>
                      <HelperText>
                        💡 <strong>Tip:</strong> The more specific your
                        instructions, the better the AI will follow your preferred
                        interview style. Use numbered lists or bullet points for
                        clarity.
                      </HelperText>
                    </TextAreaContainer>
                  </fieldset>
                </form>
                {validationErrors.length > 0 && (
                  <StartButtonRequirements show={true}>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </StartButtonRequirements>
                )}
              </SettingsCardContent>
            </SettingsCard>

            <ButtonContainer>
              <StartInterviewButton
                onClick={handleStartInterview}
                disabled={!isFormValid}
                aria-describedby="start-button-requirements"
              >
                {isInterviewStarted ? (
                  <>
                    <LoadingSpinner />
                    <span>Starting Interview...</span>
                  </>
                ) : (
                  "Start Interview"
                )}
              </StartInterviewButton>
            </ButtonContainer>
          </InterviewSettingsContainer>
        </GridContainer>
      </main>
    </Container>
  );
};

export default VideoTestCard;
