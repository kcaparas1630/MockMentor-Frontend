/**
 * @fileoverview Loading component that displays device detection progress during interview room initialization.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This component renders a loading interface while the system checks for device support and availability.
 * It provides users with visual feedback during the device detection phase, including a loading spinner
 * and descriptive text. This component is the first loading state users see when entering an interview
 * room, before device permissions are requested or streams are established.
 *
 * @see {@link src/Components/InterviewRoom/Styles/StyledInterviewRoom.ts}
 *
 * Dependencies:
 * - React
 * - Styled Components
 */

import { FC } from "react";
import {
  InterviewRoomContainer,
  Header,
  HeaderContent,
  HeaderInfo,
  VideoSection,
  VideoContainer,
  LoadingStateContainer,
  LoadingSpinner,
  LoadingTitle,
  LoadingDescription,
} from "../../Styles/StyledInterviewRoom";

/**
 * Props interface for the LoadingWhileCheckingDevice component.
 *
 * @interface
 * @property {string} sessionId - Unique identifier for the interview session.
 * Constraints/Format: Must be a valid session ID string
 */
interface LoadingWhileCheckingDeviceProps {
  sessionId: string;
}

/**
 * Loading component that displays device detection progress during interview initialization.
 *
 * @component
 * @param {LoadingWhileCheckingDeviceProps} props - Component props containing session information.
 * @param {string} props.sessionId - Unique identifier for the interview session.
 * Constraints/Format: Must be a valid session ID string
 * @returns {JSX.Element} The rendered loading interface with spinner and progress text.
 * @example
 * // Usage during device detection:
 * <LoadingWhileCheckingDevice sessionId="abc123" />
 *
 * @throws {Error} Generally does not throw as it's a pure display component.
 * @remarks
 * Side Effects: 
 * - None (pure display component)
 * - Renders loading spinner animation
 *
 * Known Issues/Limitations:
 * - No timeout mechanism for device detection
 * - No progress indicator for detection stages
 * - Could benefit from more detailed status messages
 *
 * Design Decisions/Rationale:
 * - Uses dedicated loading state styling for visual distinction
 * - Provides minimal but clear messaging about detection process
 * - Maintains interview room header for context
 * - Uses animated spinner for visual feedback
 */
const LoadingWhileCheckingDevice: FC<LoadingWhileCheckingDeviceProps> = ({
  sessionId,
}) => {
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
};

export default LoadingWhileCheckingDevice;
