'use client';

import { use } from 'react';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatRoomPage({ params }: { params: Promise<{ chatId: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      <ChatWindow roomId={resolvedParams.chatId} />
    </div>
  );
}
