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
