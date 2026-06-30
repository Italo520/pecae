import ChatSidebar from '@/components/chat/ChatSidebar';

export const metadata = {
  title: 'Negociações | PECAÊ',
};

export default function NegociacoesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-[var(--color-surface)] overflow-hidden">
      {/* Sidebar de Chats */}
      <div className="w-full md:w-[320px] lg:w-[350px] h-full border-r border-white/5 bg-black/20 backdrop-blur-xl flex-shrink-0 flex flex-col hidden md:flex">
        <ChatSidebar context="buyer" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full flex flex-col bg-black/10">
        {children}
      </div>
    </div>
  );
}
