import styled from "@emotion/styled";

export const ChatPanelContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 20rem;
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

export const ChatHeader = styled.header`
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

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  height: calc(100vh - 120px);
`;

export const MessagesContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MessageWrapper = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

export const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: ${props => props.isUser ? '#3b82f6' : '#f3f4f6'};
  color: ${props => props.isUser ? '#ffffff' : '#1f2937'};

  p {
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.4;
  }
`;

export const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;

  span:first-of-type {
    font-weight: 500;
  }
`;

export const InputSection = styled.footer`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-shrink: 0;
`;

export const InputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const MessageInput = styled.textarea`
  flex: 1;
  min-height: 2.5rem;
  max-height: 6.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: none;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const SendButton = styled.button<{ disabled: boolean }>`
  align-self: flex-end;
  padding: 0.5rem;
  background-color: ${props => props.disabled ? '#e5e7eb' : '#3b82f6'};
  color: ${props => props.disabled ? '#9ca3af' : '#ffffff'};
  border: none;
  border-radius: 0.375rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;

  &:hover {
    background-color: ${props => props.disabled ? '#e5e7eb' : '#2563eb'};
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`; 
