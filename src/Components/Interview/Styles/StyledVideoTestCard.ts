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

const LoadingSpinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 2px solid #ffffff3d;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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
  LoadingSpinner,
  InterviewSettingsContainer,
  SettingsCard,
  SettingsCardHeader,
  SettingsCardTitle,
  SettingsCardContent,
  ButtonContainer,
  StartInterviewButton,
};
