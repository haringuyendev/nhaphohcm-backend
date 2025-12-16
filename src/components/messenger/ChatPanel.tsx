import { useRef, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { currentUserId } from '@/data/mockData';
import { Conversation, Message, User } from '@/payload-types';

interface ChatPanelProps {
  user:User
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export const ChatPanel = ({ conversation, messages, onSendMessage, user }: ChatPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-chat-bg">
      <ChatHeader conversation={conversation} />
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-1">
        {messages.map((message, index) => {
          return (
            <MessageBubble
              key={message.id}
              message={message}
              currentUser={user}
            />
          );
        })}
        
        {/* {conversation.isTyping && <TypingIndicator />} */}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={onSendMessage} />
    </div>
  );
};
