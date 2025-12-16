import { cn, getMediaUrl } from '@/lib/utils';
import type { Conversation, Message, User } from '@/payload-types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import { useMemo } from 'react';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  user: User
}

function toValidDate(value: any): Date | null {
  if (!value) return null;

  // If it's already a Date
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  // If it's a number (timestamp)
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // If it's an ISO string
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // If value is message-like with createdAt
  if (typeof value === 'object' && value !== null && ('createdAt' in value || 'updatedAt' in value)) {
    const cand = (value.createdAt ?? value.updatedAt) as any;
    if (!cand) return null;
    const d = new Date(cand);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export const ConversationItem = ({ conversation, isSelected, onClick, user }: ConversationItemProps) => {
  // Normalize lastMessage createdAt to a Date (or null)
  const lastMsg = conversation.lastMessage as unknown;
  const lastDate = toValidDate(lastMsg);

  const timeAgo = lastDate
    ? formatDistanceToNow(lastDate, { addSuffix: true, locale: vi })
    : ''; // empty string when no valid date

  // Tìm participant khác current user
  const otherParticipant: User | null = useMemo(() => {
    if (!conversation.participants || conversation.participants.length === 0) return null;

    return (conversation.participants as User[]).find(p => p.id !== user.id) ?? null;
  }, [conversation.participants, user.id]);

  // Lấy avatar của người còn lại
  const avatarSrc = getMediaUrl(otherParticipant?.avatar ?? null);


  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left',
        'hover:bg-secondary/80',
        isSelected && 'bg-secondary'
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Image
          height={60}
          width={60}
          src={avatarSrc ?? '/placeholder-avatar.png'}
          alt={conversation?.title || 'Conversation avatar'}
          className="w-12 h-12 rounded-full object-cover"
        />
        {otherParticipant && (
          // NOTE: use a utility class that exists: bg-online (from your tailwind config), not bg-(--online)
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-(--online) border-2 border-background rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('font-semibold truncate')}>{conversation.isGroup?conversation.title :otherParticipant?.name ?? 'No title'}</span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={cn('text-sm truncate flex-2')}>
            {/* lastMessage can be string or object with text */}
            {typeof lastMsg === 'string' ? lastMsg : (lastMsg as any)?.text ?? ''}
          </span>
          <span className={cn('text-xs shrink-0 flex-1')}>
            {timeAgo}
          </span>
        </div>
      </div>
    </button>
  );
};
