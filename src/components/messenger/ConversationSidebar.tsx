import { useState } from 'react';
import { ConversationItem } from './ConversationItem';
import { Search, Edit, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Conversation, User } from '@/payload-types';
import { useAuth } from '@/providers/Auth';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationSidebar = ({ conversations, selectedId, onSelect }: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {user} = useAuth();
  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Edit className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm trên Messenger"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-none rounded-full h-10"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Không tìm thấy cuộc trò chuyện
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelect(conversation.id)}
              user={user as User}
            />
          ))
        )}
      </div>
    </div>
  );
};
