import styled from "@emotion/styled";

// Main container
export const InterviewRoomContainer = styled.div`
  height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  position: relative;

  @media (min-width: 1024px) {
    height: 95vh;
  }
`;

// Header section
export const Header = styled.header`
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  flex-shrink: 0;
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 72rem;
  margin: 0 auto;
`;

export const HeaderInfo = styled.div`
  h1 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }
  
  p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }
`;

export const EndButton = styled.button`
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #b91c1c;
  }

  &:focus {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }
`;

// Video section
export const VideoSection = styled.main`
  flex: 1;
  padding: 1rem;
  min-height: 0;
`;

export const VideoContainer = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  height: 100%;
`;

export const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  height: 100%;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const VideoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const VideoLabel = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.5rem 0;
  flex-shrink: 0;
`;

export const VideoDisplayContainer = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
`;

// Bottom controls
export const BottomControls = styled.footer`
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  flex-shrink: 0;
`;

export const ControlsContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 72rem;
  margin: 0 auto;
`;

export const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const RecordingStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

export const RecordingDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export const DurationText = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

export const ChatButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.isOpen ? '#3b82f6' : '#d1d5db'};
  background-color: ${props => props.isOpen ? '#3b82f6' : '#ffffff'};
  color: ${props => props.isOpen ? '#ffffff' : '#374151'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.isOpen ? '#2563eb' : '#f9fafb'};
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

// Chat overlay for mobile
export const ChatOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  display: ${props => props.isOpen ? 'block' : 'none'};

  @media (min-width: 768px) {
    display: none;
  }
`;

// Video Display Component Styles
export const VideoDisplayWrapper = styled.div<{ isUser?: boolean }>`
  position: relative;
  background-color: #1f2937;
  border-radius: 0.5rem;
  overflow: hidden;
  height: 100%;
  min-height: 200px;

  @media (min-width: 768px) {
    min-height: 300px;
  }
`;

export const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const VideoPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #374151;
  color: white;
  text-align: center;
  padding: 1rem;
`;

export const AvatarPlaceholder = styled.div`
  width: 4rem;
  height: 4rem;
  background-color: #6b7280;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
`;

export const VideoControls = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
`;

export const ControlButton = styled.button<{ active: boolean }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.active ? '#3b82f6' : '#6b7280'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#2563eb' : '#4b5563'};
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

export const NameLabel = styled.div`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
`;
