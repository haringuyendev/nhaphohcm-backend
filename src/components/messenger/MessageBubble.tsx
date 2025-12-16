import { cn, getMediaUrl, safeFormatTime } from '@/lib/utils';
import Image from 'next/image';
import { Message, User } from '@/payload-types';

interface MessageBubbleProps {
  message: Message;
  currentUser:User
}

export const MessageBubble = ({ message, currentUser }: MessageBubbleProps) => {
  console.log(message)
  const isOwn=(message.sender as User)?.id===currentUser.id
  return (
    <div className={cn(
      'flex gap-2 animate-fade-in',
      isOwn ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className="w-8 shrink-0">
        {!isOwn && (message.sender as User).avatar && (
          <Image
            width={60}
            height={60}
            src={getMediaUrl((message.sender as User).avatar)}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
      </div>

      {/* Message */}
      <div className={cn(
        'max-w-[70%] group'
      )}>
        <div className={cn(
          'px-4 py-2.5 rounded-2xl',
          isOwn
            ? 'bg-(--message-sent) text-(--message-sent-foreground) rounded-br-md'
            : 'bg-(--message-received) text-(--message-received-foreground) rounded-bl-md'
        )}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        </div>

        {/* Time & Status */}
        <div className={cn(
          'flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-xs text-muted-foreground">
            {safeFormatTime(message.createdAt)}
          </span>
          {/* {isOwn && message.status && (
            <span className="text-muted-foreground">
              {message.isReadBy === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
};
