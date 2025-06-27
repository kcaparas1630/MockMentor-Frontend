/**
 * @fileoverview Block interview component that prevents interview from proceeding when required devices are not available.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This component renders a blocking interface when the interview cannot proceed due to missing camera or microphone access.
 * It provides users with clear messaging about device requirements and options to enable their devices. This component
 * is essential for ensuring interviews only proceed when both video and audio are available for face landmark analysis
 * and proper evaluation. It serves as a gatekeeper component in the interview flow.
 *
 * @see {@link src/Hooks/useMediaDevicesContext.ts}
 * @see {@link src/Types/SessionIssuesProps.ts}
 * @see {@link src/Components/InterviewRoom/Styles/StyledInterviewRoom.ts}
 *
 * Dependencies:
 * - React
 * - Media Devices Context Hook
 * - Styled Components
 */

import { FC } from "react";
import useMediaDevicesContext from "@/Hooks/useMediaDevicesContext";
import {
  InterviewRoomContainer,
  Header,
  HeaderContent,
  HeaderInfo,
  EndButton,
  VideoSection,
  VideoContainer,
  MissingDevicesContainer,
  MissingDevicesTitle,
  MissingDevicesDescription,
  MissingDevicesDetails,
  MissingDevicesAlert,
  EnableDevicesButton,
} from "../../Styles/StyledInterviewRoom";
import SessionIssuesProps from "@/Types/SessionIssuesProps";

/**
 * Block interview component that prevents interview from proceeding when required devices are unavailable.
 *
 * @component
 * @param {SessionIssuesProps} props - Component props containing session management functions.
 * @param {string} props.sessionId - Unique identifier for the interview session.
 * Constraints/Format: Must be a valid session ID string
 * @param {function} props.handleEndInterview - Callback function to handle interview termination.
 * Constraints/Format: Must be a valid function that handles cleanup and navigation
 * @returns {JSX.Element} The rendered blocking interface with device enablement options.
 * @example
 * // Usage in interview room routing:
 * <BlockInterview 
 *   sessionId="abc123" 
 *   handleEndInterview={() => navigate('/exit')} 
 * />
 *
 * @throws {Error} May throw if device enablement fails.
 * @remarks
 * Side Effects: 
 * - Attempts to enable camera and microphone when user clicks enable button
 * - May trigger browser permission dialogs
 * - Updates media devices context state
 *
 * Known Issues/Limitations:
 * - Device enablement is asynchronous and may fail
 * - Error handling for device enablement could be more robust
 * - No feedback mechanism for successful device enablement
 *
 * Design Decisions/Rationale:
 * - Blocks interview completely when devices are missing (strict requirement)
 * - Provides clear messaging about MediaPipe requirements
 * - Allows users to attempt device enablement without navigation
 * - Uses consistent styling with other interview room components
 */
const BlockInterview: FC<SessionIssuesProps> = ({
  sessionId,
  handleEndInterview,
}) => {
  const {
    startStream,
    videoEnabled = true,
    audioEnabled = true,
    toggleAudio,
    toggleVideo,
  } = useMediaDevicesContext();

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
            <MissingDevicesTitle>Interview Cannot Proceed</MissingDevicesTitle>
            <MissingDevicesDescription>
              Both camera and microphone access are required for this interview.
            </MissingDevicesDescription>
            <MissingDevicesDetails>
              We use MediaPipe for face landmark analysis and need audio for
              evaluation.
            </MissingDevicesDetails>
            <MissingDevicesAlert>
              <p>
                <strong>Missing:</strong>{[
                  !videoEnabled && "Camera",
                  !audioEnabled && "Microphone",
                ].filter(Boolean).join(" & ")}
              </p>
            </MissingDevicesAlert>
            <EnableDevicesButton
              onClick={async () => {
                try {
                  if (!videoEnabled) toggleVideo();
                  if (!audioEnabled) toggleAudio();
                  await startStream(true, true);
                } catch (error) {
                  console.error("Error enabling devices:", error);
                }
              }}
            >
              Enable Camera & Microphone
            </EnableDevicesButton>
          </MissingDevicesContainer>
        </VideoContainer>
      </VideoSection>
    </InterviewRoomContainer>
  );
};

export default BlockInterview;
