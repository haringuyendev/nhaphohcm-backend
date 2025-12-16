export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  isTyping?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}
