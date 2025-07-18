import styled from "@emotion/styled";

// Main container
export const AICoachContainer = styled.div`
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

// AI Coach visual circle
export const AICoachCircle = styled.div<{ 
  isAnimating: boolean; 
  audioLevel: number; 
}>`
  position: relative;
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #60a5fa;
  transition: all 100ms ease-out;
  
  transform: scale(${props => 1 + props.audioLevel / 200});
  box-shadow: 0 0 ${props => 20 + props.audioLevel * 0.3}px rgba(59, 130, 246, ${props => 0.3 + props.audioLevel * 0.007});
  
  ${props => props.isAnimating && `
    animation: glow 2s ease-in-out infinite;
  `}


  @keyframes glow {
    0% {
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
    }
    100% {
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
    }
  }

  @media (max-width: 768px) {
    width: 10rem;
    height: 10rem;
  }
`;

// Icon wrapper with enhanced accessibility
export const IconWrapper = styled.div<{ audioLevel: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 100ms ease-out;
  
  filter: drop-shadow(0 0 ${props => 5 + props.audioLevel * 0.1}px rgba(255, 255, 255, 0.8));

  svg {
    width: 4rem;
    height: 4rem;
    
    @media (max-width: 768px) {
      width: 3rem;
      height: 3rem;
    }
  }
`;

// Ripple effect containers
export const RippleContainer = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
`;

export const RippleRing = styled.div<{ delay?: string }>`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid #60a5fa;
  animation: ripple 1.5s ease-out infinite;
  opacity: 0.3;
  
  animation-delay: ${props => props.delay || '0s'};

  @keyframes ripple {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
`;

export const RippleRingSecondary = styled(RippleRing)`
  border: 1px solid rgba(96, 165, 250, 0.7);
  animation-duration: 2s;
  opacity: 0.2;
`;

// Text and info sections
export const AICoachInfo = styled.div`
  text-align: center;
  margin: 1.5rem 0;
  color: #1e293b;
`;

export const AICoachTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #0f172a;
  line-height: 1.3;
`;

export const AICoachStatus = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
`;

// Controls section
export const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 20rem;
`;

export const PrimaryButton = styled.button<{ isAnimating: boolean }>`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 200ms ease;
  width: 100%;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }

  ${props => props.isAnimating && `
    animation: pulse 2s ease-in-out infinite;
  `}

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export const SecondaryButton = styled.button<{ isAnimating: boolean }>`
  padding: 0.5rem 1rem;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 200ms ease;
  width: 100%;

  &:hover:not(:disabled) {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    background: #e2e8f0;
  }

  &:disabled {
    background: #f8fafc;
    color: #94a3b8;
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
`;

// Question display
export const QuestionDisplay = styled.div`
  margin-top: 1.5rem;
  padding: 0 1rem;
  text-align: center;
  max-width: 28rem;
`;

export const QuestionText = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
  font-style: italic;
  
  strong {
    color: #475569;
    font-weight: 600;
  }
`;

// Accessibility enhancements
export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
