'use client';

import { ChatPanel } from '@/components/messenger/ChatPanel';
import { ConversationSidebar } from '@/components/messenger/ConversationSidebar';
import { EmptyChat } from '@/components/messenger/EmptyChat';
import { sendMessage } from '@/endpoints/messages';
import { getUserByIdAction } from '@/endpoints/user';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Conversation, User } from '@/payload-types';
import { useAuth } from '@/providers/Auth';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

function makeTempId() {
  return `temp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const[setlectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [optimisticConv, setOptimisticConv] = useState<Conversation | null>(null); // NEW
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const to = searchParams.get('to')?.toString();

  const onEvent = useCallback((event: string, payload: any) => {
    console.debug('socket event', event, payload);

    // Nếu server trả conversations mới (create/update) và nó chứa to -> chọn nó thay optimistic
    if (event === 'COLLECTION_CHANGED' && payload?.collection === 'conversations') {
      const doc = payload?.doc;
      if (!doc) return;

      // nếu có optimisticConv và doc.participants chứa `to`, chuyển sang real conv
      if (optimisticConv && to) {
        const partIds = (doc.participants ?? []).map((p:any) => (typeof p === 'string' ? p : p?.id));
        if (partIds.includes(to)) {
          // set selected to real id and clear optimistic
          setSelectedConvId(doc.id);
          setOptimisticConv(null);

          // refresh conversations list (server-side should handle but ensure local sync)
          // We'll prepend/merge doc into conversations to keep list fresh
          setConversations(prev => {
            if (prev.some(c => c.id === doc.id)) return prev;
            return [doc, ...prev].slice().sort((a,b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
          });
          return;
        }
      }

      // Otherwise if server changed conversation that we already have in list, update it
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === doc.id);
        if (idx === -1) {
          // new conv -> add
          return [doc, ...prev].slice().sort((a,b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
        } else {
          const next = [...prev];
          next[idx] = doc;
          return next.slice().sort((a,b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
        }
      });
    }

    // Messages: update conversation's lastMessage if applicable
    if (event === 'COLLECTION_CHANGED' && payload?.collection === 'messages') {
      const msg = payload?.doc;
      if (!msg || !msg.conversation) return;
      const convId = typeof msg.conversation === 'string' ? msg.conversation : msg.conversation.id;
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, lastMessage: msg, updatedAt: msg.updatedAt ?? msg.createdAt } : c));
    }
  }, [optimisticConv, to]);

  // subscribe to collections
  const { data, status, fetchCollection } = useWebSocket(onEvent, [
    { col: 'conversations', limit: 50, where: { participants: { contains: user?.id } } },
    { col: 'messages', limit: 100, sort: 'createdAt', where: { conversation: { participants: { contains: user?.id } } } },
  ]);

  // sync server conversations -> local list (no injecting optimistic)
  useEffect(() => {
    const convDocs = data?.conversations ?? null;
    if (!convDocs) return;
    setConversations(prev => {
      const list = Array.isArray(convDocs) ? convDocs as Conversation[] : [];
      // keep existing ordering, but do not remove optimisticConv here
      return list.slice().sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
    });

    // if `to` exists and server already has a conversation with that participant, select it and clear optimistic
    if (to) {
      const found = convDocs.find((c: any) =>
        (c.participants ?? []).some((p: any) => (typeof p === 'string' ? p : p?.id) === to)
      );
      if (found) {
        setSelectedConvId(found.id);
        setOptimisticConv(null);
      }
    }
  }, [data?.conversations, to]);

  const getUserAndCreateConversation=useCallback(async()=>{
    if (!to || !user?.id) return;

    const participants=await getUserByIdAction(to);
    if (!participants) return;
    // try to find existing conversation
    const found = conversations.find(c => (c.participants ?? []).some((p: any) => (typeof p === 'string' ? p : p?.id) === to));
    if (found) {
      setSelectedConvId(found.id);
      setOptimisticConv(null);
      return;
    }

    // no existing conversation -> create optimistic object but don't insert into conversations list
    const tempConversation: Conversation = {
      id: makeTempId(),
      title: '', // could be recipient name if you fetch it
      isGroup: false,
      participants: [
        participants.docs[0],
        user
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: null as any,
    } as any;

    setSelectedConvId(null); // ensure none selected from list
    setOptimisticConv(tempConversation);

    // optionally fetch conversations/messages (but we won't merge optimistic into list)
    if (status === 'connected') {
      fetchCollection('conversations'); // keep list fresh
      // we don't fetch messages because there isn't a conversation yet
    }
  },[to,user?.id,status,fetchCollection])
  
  useEffect(() => {
    getUserAndCreateConversation();
  }, [getUserAndCreateConversation]);

  // Select existing conversation from sidebar
  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConvId(id);
    setOptimisticConv(null); // clear optimistic if user directly selects real conv
    setConversations(prev => prev.map(conv => conv.id === id ? { ...conv, unreadCount: 0 } : conv));
  }, []);

  // sending: if optimisticConv present -> pass `to` so server creates conversation
  const handleSendMessage = useCallback(async (content: string) => {
    // if user opened chat via ?to and we have optimisticConv => pass that to backend
    const passTo = optimisticConv ? optimisticConv.participants?.[0] : undefined;
    const convIdOrEmpty = selectedConvId ?? ''; // server will create conv if passTo provided
    try {
      await sendMessage(convIdOrEmpty, content, user as User, passTo as User);
      // do not mutate messages here; wait for server NEW_MESSAGE / COLLECTION_CHANGED to sync
    } catch (err: any) {
      toast.error(err?.message ?? 'Gửi thất bại');
    }
  }, [selectedConvId, optimisticConv, user]);

  // fetch initial collections when socket connected
  useEffect(() => {
    if (status !== 'connected' || !user?.id) return;
    fetchCollection('conversations');
    fetchCollection('messages');
  }, [status, user?.id, fetchCollection]);

  // compute conversation object to pass to ChatPanel:
  const selectedConversation = useMemo(() => {
    if (selectedConvId) return conversations.find(c => c.id === selectedConvId) ?? null;
    if (optimisticConv) return optimisticConv;
    return null;
  }, [conversations, selectedConvId, optimisticConv]);

  // messages: for optimisticConv we show empty list (no conversation exists yet)
  const selectedMessages = useMemo(() => {
    if (!selectedConvId) return [];
    const allMsgs: any[] = data?.messages ?? [];
    return allMsgs
      .filter(m => {
        const conv = m.conversation;
        const convId = typeof conv === 'string' ? conv : conv?.id ?? null;
        return convId === selectedConvId;
      })
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [data?.messages, selectedConvId]);

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="w-80 shrink-0 hidden md:block">
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedConvId}
          onSelect={handleSelectConversation}
        />
      </div>

      <div className="flex-1 min-w-0">
        {selectedConversation ? (
          <ChatPanel
            conversation={selectedConversation}
            messages={selectedMessages}
            onSendMessage={handleSendMessage}
            user={user as User}
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};

export default Index;
