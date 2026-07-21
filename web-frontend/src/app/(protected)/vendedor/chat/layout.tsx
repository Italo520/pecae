import ChatSidebar from '@/components/chat/ChatSidebar';

export const metadata = {
  title: 'Mensagens | PECAÊ',
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-[var(--background)] overflow-hidden">
      {/* Sidebar de Chats */}
      <div className="w-full md:w-[320px] lg:w-[350px] h-full border-r border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl flex-shrink-0 flex flex-col hidden md:flex">
        <ChatSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full flex flex-col bg-[var(--background)]">
        {children}
      </div>
    </div>
  );
}
