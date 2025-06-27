/**
 * @fileoverview Chat panel component for real-time messaging during interviews, with accessibility and UX enhancements.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file implements the chat panel interface for interview sessions, providing real-time messaging between users and AI or human interviewers. It features accessible markup, keyboard navigation, and message formatting. The component manages message state, input handling, and integrates with the interview room for seamless communication.
 *
 * Plays a crucial role in enabling interactive, accessible, and user-friendly chat experiences during interviews.
 *
 * @see {@link src/Components/InterviewRoom/InterviewRoom.tsx}
 * @see {@link src/Components/Interview/Styles/StyledChatPanel.ts}
 *
 * Dependencies:
 * - React (useState)
 * - Lucide React Icons (X, Send)
 * - Styled Components
 */
import { FC, useState } from "react";
import { X, Send } from "lucide-react";
import {
  ChatPanelContainer,
  ChatHeader,
  CloseButton,
  MessagesContainer,
  MessagesContent,
  MessageWrapper,
  MessageBubble,
  MessageMeta,
  InputSection,
  InputWrapper,
  MessageInput,
  SendButton,
} from "./Styles/StyledChatPanel";

// Updated icons using lucide-react
const XIcon = () => <X size={16} />;
const SendIcon = () => <Send size={16} />;

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isUser: boolean;
}

/**
 * Props interface for the ChatPanel component.
 *
 * @interface
 * @property {boolean} isOpen - Whether the chat panel is open and visible.
 * @property {function} onClose - Callback to close the chat panel.
 */
interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Chat panel component for real-time messaging during interviews.
 *
 * @component
 * @param {ChatPanelProps} props - Component props for chat panel configuration.
 * @returns {JSX.Element} The rendered chat panel interface with message log and input.
 * @example
 * // Usage in InterviewRoom:
 * <ChatPanel isOpen={isChatOpen} onClose={handleCloseChat} />
 *
 * @throws {Error} No errors thrown - this is a pure UI component.
 * @remarks
 * Side Effects:
 * - Manages message state and input field
 * - Handles keyboard events for sending messages
 * - Provides accessible markup for screen readers
 *
 * Known Issues/Limitations:
 * - No backend integration for real messages (placeholder only)
 * - No support for file/image attachments
 * - No message read receipts or typing indicators
 *
 * Design Decisions/Rationale:
 * - Uses local state for message management (to be replaced with backend integration)
 * - Provides ARIA roles and labels for accessibility
 * - Keyboard navigation and Enter-to-send for usability
 */
const ChatPanel: FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  // TODO: Add messages from backend. This is just a placeholder.
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Sarah Johnson",
      message: "Welcome to the interview! Feel free to ask any questions during our conversation.",
      timestamp: new Date(Date.now() - 120000),
      isUser: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: "You",
        message: newMessage.trim(),
        timestamp: new Date(),
        isUser: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Formats a Date object as a time string (HH:mm, 24-hour format).
   *
   * @function
   * @param {Date} date - The date to format.
   * @returns {string} Formatted time string.
   * @example
   * formatTime(new Date()) // "14:05"
   * @remarks
   * Side Effects: None (pure function)
   */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <ChatPanelContainer 
      isOpen={isOpen}
      role="complementary"
      aria-label="Interview chat panel"
      aria-hidden={!isOpen}
    >
      <ChatHeader>
        <h3 id="chat-title">Chat</h3>
        <CloseButton 
          onClick={onClose}
          aria-label="Close chat panel"
          title="Close chat"
        >
          <XIcon />
        </CloseButton>
      </ChatHeader>

      <MessagesContainer
        role="log"
        aria-labelledby="chat-title"
        aria-live="polite"
        aria-atomic="false"
      >
        <MessagesContent>
          {messages.map((message) => (
            <MessageWrapper key={message.id} isUser={message.isUser}>
              <article role="listitem">
                <MessageBubble isUser={message.isUser}>
                  <p>{message.message}</p>
                </MessageBubble>
                <MessageMeta>
                  <span aria-label="Sender">{message.sender}</span>
                  <span aria-hidden="true">•</span>
                  <time 
                    dateTime={message.timestamp.toISOString()}
                    aria-label={`Sent at ${formatTime(message.timestamp)}`}
                  >
                    {formatTime(message.timestamp)}
                  </time>
                </MessageMeta>
              </article>
            </MessageWrapper>
          ))}
        </MessagesContent>
      </MessagesContainer>

      <InputSection>
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
          <InputWrapper>
            <MessageInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              aria-label="Type your message"
              aria-describedby="send-button"
            />
            <SendButton
              id="send-button"
              type="submit"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              aria-label={newMessage.trim() ? "Send message" : "Type a message to send"}
              title={newMessage.trim() ? "Send message" : "Type a message to send"}
            >
              <SendIcon />
            </SendButton>
          </InputWrapper>
        </form>
      </InputSection>
    </ChatPanelContainer>
  );
};

export default ChatPanel; 
