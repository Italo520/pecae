import ChatWindow from '@/components/chat/ChatWindow';

export const metadata = {
  title: 'Conversa | PECAÊ',
};

export default function ChatActivePage({ params }: { params: { chatId: string } }) {
  return <ChatWindow chatId={params.chatId} />;
}
