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
