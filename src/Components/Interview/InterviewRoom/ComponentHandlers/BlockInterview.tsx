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
                <strong>Missing:</strong> {!videoEnabled && "Camera"}{" "}
                {!videoEnabled && !audioEnabled && " & "}{" "}
                {!audioEnabled && "Microphone"}
              </p>
            </MissingDevicesAlert>
            <EnableDevicesButton
              onClick={() => {
                toggleVideo();
                toggleAudio();
                startStream(true, true);
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
