/**
 * @fileoverview Loading stream component that displays loading state while media devices are being initialized.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This component renders a loading interface during media stream initialization. It provides users with
 * visual feedback that the system is working to establish camera and microphone access. The component
 * includes retry functionality and maintains the interview room layout for consistency. It serves as
 * an intermediate state between device checking and successful stream establishment.
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
import {
  InterviewRoomContainer,
  Header,
  HeaderContent,
  HeaderInfo,
  EndButton,
  VideoSection,
  VideoContainer,
  ErrorStateContainer,
  ErrorTitle,
  ErrorDescription,
  ErrorDetails,
  ErrorActions,
  RetryButton,
  RefreshButton,
} from "../../Styles/StyledInterviewRoom";
import SessionIssuesProps from "@/Types/SessionIssuesProps";
import useMediaDevicesContext from "@/Hooks/useMediaDevicesContext";

/**
 * Loading stream component that provides feedback during media stream initialization.
 *
 * @component
 * @param {SessionIssuesProps} props - Component props containing session management functions.
 * @param {string} props.sessionId - Unique identifier for the interview session.
 * Constraints/Format: Must be a valid session ID string
 * @param {function} props.handleEndInterview - Callback function to handle interview termination.
 * Constraints/Format: Must be a valid function that handles cleanup and navigation
 * @returns {JSX.Element} The rendered loading interface with retry options.
 * @example
 * // Usage during stream initialization:
 * <LoadingStream 
 *   sessionId="abc123" 
 *   handleEndInterview={() => navigate('/exit')} 
 * />
 *
 * @throws {Error} May throw if stream initialization fails during retry.
 * @remarks
 * Side Effects: 
 * - Attempts to restart media stream when retry is clicked
 * - May trigger browser permission dialogs
 * - Page refresh when refresh button is clicked
 *
 * Known Issues/Limitations:
 * - Similar to DeviceIssues component (could be consolidated)
 * - No timeout mechanism for stream initialization
 * - Loading state could be more visually distinct
 *
 * Design Decisions/Rationale:
 * - Reuses error state styling for consistency
 * - Provides same recovery options as DeviceIssues
 * - Maintains interview room header for context
 * - Shows error details for debugging purposes
 */
const LoadingStream: FC<SessionIssuesProps> = ({
  sessionId,
  handleEndInterview,
}) => {
  const { startStream, error } = useMediaDevicesContext();

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
};

export default LoadingStream;
