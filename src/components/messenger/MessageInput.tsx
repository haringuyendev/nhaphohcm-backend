import { useState, KeyboardEvent } from 'react';
import { Send, Smile, Image, Paperclip, Mic, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string) => void;
}

export const MessageInput = ({ onSend }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-border bg-background">
      <div className="flex items-end gap-2">
        {/* Action buttons */}
        <div className="flex items-center gap-1 pb-1">
          <button className="p-2 rounded-full hover:bg-secondary transition-colors">
            <Paperclip className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary transition-colors">
            <Image className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary transition-colors">
            <Mic className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Aa"
            rows={1}
            className={cn(
              'w-full px-4 py-2.5 pr-10 bg-secondary rounded-full resize-none',
              'focus:outline-none focus:ring-2 focus:ring-primary/20',
              'placeholder:text-muted-foreground text-foreground',
              'scrollbar-thin max-h-32'
            )}
            style={{ minHeight: '42px' }}
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-background/50 transition-colors">
            <Smile className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Send button */}
        <button 
          onClick={handleSend}
          className="p-2 rounded-full hover:bg-secondary transition-colors pb-1"
        >
          {message.trim() ? (
            <Send className="w-5 h-5 text-primary" />
          ) : (
            <ThumbsUp className="w-5 h-5 text-primary" />
          )}
        </button>
      </div>
    </div>
  );
};
