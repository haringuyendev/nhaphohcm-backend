import { Conversation, Message } from '@/types/message';

export const currentUserId = 'user-1';

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Tối nay đi cafe không?',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 2,
    isOnline: true,
    isTyping: false,
  },
  {
    id: 'conv-2',
    name: 'Trần Thị Bình',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'OK, để mình check lại nhé!',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
    unreadCount: 0,
    isOnline: true,
    isTyping: true,
  },
  {
    id: 'conv-3',
    name: 'Lê Minh Cường',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Dự án mới có update chưa?',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'conv-4',
    name: 'Phạm Thu Dung',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Cảm ơn bạn nhiều nha! 🙏',
    lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'conv-5',
    name: 'Nhóm Dev Team',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Anh: Meeting lúc 3h chiều nhé',
    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    unreadCount: 5,
    isOnline: true,
  },
];

export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      content: 'Hey, khỏe không?',
      senderId: 'user-2',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-2',
      content: 'Khỏe nha, bạn sao rồi?',
      senderId: currentUserId,
      timestamp: new Date(Date.now() - 55 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-3',
      content: 'Mình cũng ổn. Cuối tuần này có rảnh không?',
      senderId: 'user-2',
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-4',
      content: 'Có chứ, bạn định đi đâu?',
      senderId: currentUserId,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-5',
      content: 'Tối nay đi cafe không?',
      senderId: 'user-2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'delivered',
    },
  ],
  'conv-2': [
    {
      id: 'msg-1',
      content: 'Bạn ơi, file báo cáo đâu rồi?',
      senderId: currentUserId,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-2',
      content: 'À mình gửi qua email rồi đó',
      senderId: 'user-3',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-3',
      content: 'Mình chưa nhận được, bạn check lại giúp mình nhé',
      senderId: currentUserId,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-4',
      content: 'OK, để mình check lại nhé!',
      senderId: 'user-3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'read',
    },
  ],
};
