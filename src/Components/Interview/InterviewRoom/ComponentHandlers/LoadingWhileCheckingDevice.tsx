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

interface LoadingWhileCheckingDeviceProps {
  sessionId: string;
}

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
}
export default LoadingWhileCheckingDevice;
