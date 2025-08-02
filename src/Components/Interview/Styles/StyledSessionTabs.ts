import styled from '@emotion/styled';

export const SessionTabsContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 25rem;
  background-color: #ffffff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.1);
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease-in-out;
  z-index: 50;
  display: flex;
  flex-direction: column;

  @media (max-width: 767px) {
    width: 100%;
  }
`;

export const SessionTabsHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-shrink: 0;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
`;

export const CloseButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e5e7eb;
    color: #374151;
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

export const TabContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
`;

export const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  color: ${props => props.active ? '#3b82f6' : '#6c757d'};
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  background: ${props => props.active ? 'white' : 'transparent'};
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover:not(:disabled) {
    color: ${props => props.active ? '#3b82f6' : '#495057'};
    background: ${props => props.active ? 'white' : '#e9ecef'};
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

export const ContentArea = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const TabContent = styled.div<{ active: boolean }>`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: ${props => props.active ? 'flex' : 'none'};
  flex-direction: column;
`;

// Session Logs Styles - Using ChatPanel color scheme
export const LogEntry = styled.div<{ speaker: 'ai' | 'user' }>`
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  position: relative;
  background: ${props => props.speaker === 'ai' ? '#f3f4f6' : '#e3f2fd'};
  border-left: 3px solid ${props => props.speaker === 'ai' ? '#6b7280' : '#3b82f6'};
`;

export const LogSpeaker = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 4px;
`;

export const LogContent = styled.div`
  font-size: 14px;
  line-height: 1.4;
  color: #1f2937;
  padding-right: 60px;
  white-space: pre-wrap;
`;

export const LogTimestamp = styled.div`
  font-size: 10px;
  color: #6b7280;
  position: absolute;
  top: 8px;
  right: 12px;
`;

// Chat Styles - Similar to ChatPanel
export const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ChatMessage = styled.div<{ sent: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.sent ? 'flex-end' : 'flex-start'};
`;

export const ChatBubble = styled.div<{ sent: boolean }>`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  background: ${props => props.sent ? '#3b82f6' : '#f1f3f4'};
  color: ${props => props.sent ? 'white' : '#1f2937'};
  border-bottom-left-radius: ${props => props.sent ? '18px' : '4px'};
  border-bottom-right-radius: ${props => props.sent ? '4px' : '18px'};
  white-space: pre-wrap;
`;

export const ChatInputArea = styled.div`
  border-top: 1px solid #e9ecef;
  padding: 12px 0;
  flex-shrink: 0;
`;

export const ChatInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

export const ChatInput = styled.textarea`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
  resize: none;
  min-height: 20px;
  max-height: 100px;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const SendButton = styled.button<{ disabled: boolean }>`
  padding: 8px;
  background-color: ${props => props.disabled ? '#e5e7eb' : '#3b82f6'};
  color: ${props => props.disabled ? '#9ca3af' : '#ffffff'};
  border: none;
  border-radius: 50%;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  flex-shrink: 0;

  &:hover {
    background-color: ${props => props.disabled ? '#e5e7eb' : '#2563eb'};
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;