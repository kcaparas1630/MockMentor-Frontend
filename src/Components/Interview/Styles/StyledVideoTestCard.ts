import styled from "@emotion/styled";

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GridContainer = styled.div`
  width: 100%;
  max-width: 72rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
  height: 100%;

  @media (min-width: 1024px) {
    grid-column: span 2 / span 2;
  }
`;

const CardHeader = styled.div`
  padding: 1.5rem 1.5rem 0 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VideoPreview = styled.div`
  position: relative;
  background-color: #111827;
  border-radius: 0.5rem;
  aspect-ratio: 16 / 9;
  overflow: hidden;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
`;

const VideoPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
  text-align: center;
  padding: 1rem;
  flex-direction: column;
  gap: 0.5rem;
`;

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
`;

const ControlButton = styled.button<{ isActive: boolean; disabled?: boolean }>`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  background-color: ${(props) => 
    props.disabled ? "#9ca3af" : props.isActive ? "#3b82f6" : "#6b7280"};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.isActive ? "#2563eb" : "#4b5563")};
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const InstructionsContainer = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const InstructionItem = styled.p`
  margin: 0;

  &:before {
    content: "• ";
    margin-right: 0.25rem;
  }
`;

const StatusMessage = styled.div<{ type: 'error' | 'success' | 'warning' | 'info' }>`
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
  
  ${props => props.type === 'error' && `
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  `}
  
  ${props => props.type === 'success' && `
    background-color: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  `}
  
  ${props => props.type === 'warning' && `
    background-color: #fffbeb;
    color: #d97706;
    border: 1px solid #fed7aa;
  `}

  ${props => props.type === 'info' && `
    background-color: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  `}
`;

// Interview Settings Styles
const InterviewSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SettingsCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
`;

const SettingsCardHeader = styled.div`
  padding: 1.5rem 1.5rem 0 1.5rem;
`;

const SettingsCardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const SettingsCardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StartInterviewButton = styled.button<{ disabled?: boolean }>`
  background-color: ${props => props.disabled ? '#9ca3af' : '#2563eb'};
  color: white;
  padding: 0.75rem 2rem;
  font-size: 1.125rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// Microphone Test Styles
const MicTestContainer = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
`;

const MicTestHeader = styled.div`
  margin-bottom: 0.75rem;
`;

const MicTestTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  letter-spacing: 0.05em;
`;

const MicTestContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MicTestDescription = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.4;
`;

const MicTestControls = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const MicTestButton = styled.button<{ isRecording?: boolean; disabled?: boolean }>`
  background-color: ${props => 
    props.disabled ? '#9ca3af' : 
    props.isRecording ? '#dc2626' : '#3b82f6'};
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${props => 
      props.isRecording ? '#b91c1c' : '#2563eb'};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const PlaybackButton = styled.button<{ disabled?: boolean }>`
  background-color: ${props => props.disabled ? '#9ca3af' : '#059669'};
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #047857;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const AudioLevelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
`;

const AudioLevelBar = styled.div<{ level: number }>`
  flex: 1;
  height: 0.25rem;
  background-color: #e5e7eb;
  border-radius: 0.125rem;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => Math.min(props.level * 100, 100)}%;
    background-color: #3b82f6;
    transition: width 0.1s ease;
  }
`;

const AudioLevelText = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  min-width: fit-content;
`;

const TroubleshootingLink = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;

  a {
    color: #3b82f6;
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: #2563eb;
    }
  }
`;

export {
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
  PlaybackButton,
  AudioLevelContainer,
  AudioLevelBar,
  AudioLevelText,
  TroubleshootingLink,
};
