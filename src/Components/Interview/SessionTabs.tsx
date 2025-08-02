/**
 * @fileoverview Session tabs component for interview sessions with Session Logs and Chat functionality.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This component provides a tabbed interface for the interview room, featuring Session Logs that track
 * conversation history from WebSocket messages and transcripts, and a Chat tab for technical interviews.
 * Uses the same color scheme as ChatPanel for consistency.
 *
 * @see {@link src/Components/Interview/InterviewRoom/InterviewRoom.tsx}
 * @see {@link src/Components/Interview/ChatPanel.tsx}
 *
 * Dependencies:
 * - React (useState, useEffect)
 * - Styled Components
 * - WebSocket message types
 */
import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import {
  SessionTabsContainer,
  SessionTabsHeader,
  CloseButton,
  TabContainer,
  Tab,
  ContentArea,
  TabContent,
  LogEntry,
  LogSpeaker,
  LogContent,
  LogTimestamp,
  ChatMessages,
  ChatMessage,
  ChatBubble,
  ChatInputArea,
  ChatInput,
  SendButton,
  ChatInputWrapper,
} from './Styles/StyledSessionTabs';
import { WebSocketMessage } from '../../Hooks/useWebSocketConnection';

interface LogMessage {
  id: string;
  speaker: 'ai' | 'user';
  speakerName: string;
  content: string;
  timestamp: string;
  rawTimestamp: number; // For proper sorting
}

interface ChatMsg {
  id: string;
  content: string;
  sent: boolean;
  timestamp: Date;
}

interface SessionTabsProps {
  isOpen: boolean;
  interviewType: string;
  messages: WebSocketMessage[];
  transcripts: WebSocketMessage[];
  onClose?: () => void;
}

const SendIcon = () => <Send size={16} />;
const XIcon = () => <X size={16} />;

const SessionTabs: React.FC<SessionTabsProps> = ({ 
  isOpen, 
  interviewType, 
  messages, 
  transcripts,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('logs');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([]);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Check if Chat tab should be available (only for Technical Interviews)
  const isTechnicalInterview = interviewType === 'technical' || interviewType.includes('technical');

  // Process WebSocket messages into logs
  useEffect(() => {
    const allMessages: LogMessage[] = [];
    let messageId = 0;

    // Process all AI messages (message and next_question types)
    messages.forEach((msg) => {
      if (msg.type === 'message' || msg.type === 'next_question') {
        // Use actual timestamp from WebSocket message or current time as fallback
        const timestamp = msg.timeStamp ? parseInt(msg.timeStamp) : Date.now();
        
        // Handle different message types
        let content = '';
        if (msg.type === 'message') {
          content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        } else if (msg.type === 'next_question') {
          // For next_question, combine the content and the question
          const baseContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          const question = msg.next_question?.question || '';
          content = question ? `${baseContent} Here's your next question: ${question}` : baseContent;
        }

        allMessages.push({
          id: `ai-${messageId++}`,
          speaker: 'ai',
          speakerName: 'MockMentor',
          content: content,
          timestamp: new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }),
          rawTimestamp: timestamp,
        });
      }
    });

    // Process all transcript messages
    transcripts.forEach((transcript) => {
      if (transcript.type === 'transcript') {
        // Use actual timestamp from WebSocket message or current time as fallback
        const timestamp = transcript.timeStamp ? parseInt(transcript.timeStamp) : Date.now();
        
        allMessages.push({
          id: `user-${messageId++}`,
          speaker: 'user',
          speakerName: 'You',
          content: typeof transcript.content === 'string' ? transcript.content : JSON.stringify(transcript.content),
          timestamp: new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }),
          rawTimestamp: timestamp,
        });
      }
    });

    // Sort by rawTimestamp to maintain true chronological order
    allMessages.sort((a, b) => a.rawTimestamp - b.rawTimestamp);
    setLogs(allMessages);
  }, [messages, transcripts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const message: ChatMsg = {
        id: Date.now().toString(),
        content: chatInput.trim(),
        sent: true,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, message]);
      setChatInput('');
      
      // Reset textarea height
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <SessionTabsContainer isOpen={isOpen}>
      {/* Header with title and close button */}
      <SessionTabsHeader>
        <h3>Session Panel</h3>
        {onClose && (
          <CloseButton 
            onClick={onClose}
            aria-label="Close session panel"
            title="Close session panel"
          >
            <XIcon />
          </CloseButton>
        )}
      </SessionTabsHeader>

      {/* Tab Navigation */}
      <TabContainer>
        <Tab 
          active={activeTab === 'logs'} 
          onClick={() => setActiveTab('logs')}
        >
          Session Logs
        </Tab>
        {isTechnicalInterview && (
          <Tab 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </Tab>
        )}
      </TabContainer>

      {/* Content Area */}
      <ContentArea>
        {/* Session Logs Content */}
        <TabContent active={activeTab === 'logs'}>
          {logs.length === 0 ? (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#666',
              fontSize: '14px' 
            }}>
              No session logs yet. Start the conversation to see messages here.
            </div>
          ) : (
            logs.map(log => (
              <LogEntry key={log.id} speaker={log.speaker}>
                <LogTimestamp>{log.timestamp}</LogTimestamp>
                <LogSpeaker>{log.speakerName}</LogSpeaker>
                <LogContent>{log.content}</LogContent>
              </LogEntry>
            ))
          )}
        </TabContent>

        {/* Chat Content - Only show if technical interview */}
        {isTechnicalInterview && (
          <TabContent active={activeTab === 'chat'}>
            <ChatMessages>
              {chatMessages.length === 0 ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#666',
                  fontSize: '14px' 
                }}>
                  Start a conversation in the chat!
                </div>
              ) : (
                chatMessages.map(message => (
                  <ChatMessage key={message.id} sent={message.sent}>
                    <ChatBubble sent={message.sent}>
                      {message.content}
                    </ChatBubble>
                  </ChatMessage>
                ))
              )}
            </ChatMessages>
            
            <ChatInputArea>
              <ChatInputWrapper>
                <ChatInput
                  value={chatInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message or code... (Enter to send, Shift+Enter for new line)"
                />
                <SendButton
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  aria-label="Send message"
                >
                  <SendIcon />
                </SendButton>
              </ChatInputWrapper>
            </ChatInputArea>
          </TabContent>
        )}
      </ContentArea>
    </SessionTabsContainer>
  );
};

export default SessionTabs;
