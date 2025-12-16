import { getMediaUrl } from '@/lib/utils';
import { Conversation, User } from '@/payload-types';
import { Phone, Video, Info } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';
import { useAuth } from '@/providers/Auth';

interface ChatHeaderProps {
  conversation: Conversation;
}

export const ChatHeader = ({ conversation }: ChatHeaderProps) => {
  const {user} = useAuth();
  console.log(conversation);
  // Tìm participant khác current user
    const otherParticipant: User | null = useMemo(() => {
      if (!conversation.participants || conversation.participants.length === 0) return null;
  
      return (conversation.participants as User[]).find(p => p.id !== user?.id) ?? null;
    }, [conversation.participants, user?.id]);
  
    // Lấy avatar của người còn lại
    const avatarSrc = getMediaUrl(otherParticipant?.avatar ?? null);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image
            width={60}
            height={60}
            src={avatarSrc}
            alt={conversation.title||''}
            className="w-10 h-10 rounded-full object-cover"
          />
          {/* {conversation.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-(--online) border-2 border-background rounded-full" />
          )} */}
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{conversation.isGroup?conversation.title :otherParticipant?.name}</h2>
          {/* <p className="text-xs text-muted-foreground">
            {conversation.isTyping
              ? 'Đang nhập...'
              : conversation.isOnline
                ? 'Đang hoạt động'
                : 'Không hoạt động'}
          </p> */}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <Phone className="w-5 h-5 text-primary" />
        </button>
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <Video className="w-5 h-5 text-primary" />
        </button>
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <Info className="w-5 h-5 text-primary" />
        </button>
      </div>
    </div>
  );
};
