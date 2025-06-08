import { FC, useState } from "react";
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

// Simple icons
const XIcon = () => <span>✕</span>;
const SendIcon = () => <span>→</span>;

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isUser: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      console.log("Sent message:", newMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <ChatPanelContainer isOpen={isOpen}>
      <ChatHeader>
        <h3>Chat</h3>
        <CloseButton onClick={onClose}>
          <XIcon />
        </CloseButton>
      </ChatHeader>

      <MessagesContainer>
        <MessagesContent>
          {messages.map((message) => (
            <MessageWrapper key={message.id} isUser={message.isUser}>
              <MessageBubble isUser={message.isUser}>
                <p>{message.message}</p>
              </MessageBubble>
              <MessageMeta>
                <span>{message.sender}</span>
                <span>•</span>
                <span>{formatTime(message.timestamp)}</span>
              </MessageMeta>
            </MessageWrapper>
          ))}
        </MessagesContent>
      </MessagesContainer>

      <InputSection>
        <InputWrapper>
          <MessageInput
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </SendButton>
        </InputWrapper>
      </InputSection>
    </ChatPanelContainer>
  );
};

export default ChatPanel; 
