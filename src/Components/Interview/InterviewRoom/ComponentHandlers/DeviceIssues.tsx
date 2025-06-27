/**
 * @fileoverview Device issues component that handles media device access errors and provides recovery options.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This component renders an error state interface when device access fails during interview setup. It provides
 * users with clear error messaging and recovery options including retry functionality and page refresh.
 * This component is crucial for handling device permission failures and guiding users through troubleshooting
 * steps. It maintains the interview room layout while providing focused error resolution tools.
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
 * Device issues component that handles media device access errors with recovery options.
 *
 * @component
 * @param {SessionIssuesProps} props - Component props containing session management functions.
 * @param {string} props.sessionId - Unique identifier for the interview session.
 * Constraints/Format: Must be a valid session ID string
 * @param {function} props.handleEndInterview - Callback function to handle interview termination.
 * Constraints/Format: Must be a valid function that handles cleanup and navigation
 * @returns {JSX.Element} The rendered error state interface with recovery options.
 * @example
 * // Usage when device access fails:
 * <DeviceIssues 
 *   sessionId="abc123" 
 *   handleEndInterview={() => navigate('/exit')} 
 * />
 *
 * @throws {Error} May throw if stream restart fails during retry.
 * @remarks
 * Side Effects: 
 * - Attempts to restart media stream when retry is clicked
 * - May trigger browser permission dialogs
 * - Page refresh when refresh button is clicked
 *
 * Known Issues/Limitations:
 * - Retry functionality may not resolve all device access issues
 * - No progressive retry strategy (exponential backoff)
 * - Error messages could be more specific to error types
 *
 * Design Decisions/Rationale:
 * - Provides immediate retry option for transient failures
 * - Offers page refresh as nuclear option for persistent issues
 * - Displays specific error details for debugging
 * - Maintains consistent interview room layout for user familiarity
 */
const DeviceIssues: FC<SessionIssuesProps> = ({
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

export default DeviceIssues;
