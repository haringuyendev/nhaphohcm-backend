import { MessageCircle } from 'lucide-react';

export const EmptyChat = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-(--chat-bg)">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MessageCircle className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Tin nhắn của bạn</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
      </p>
    </div>
  );
};
