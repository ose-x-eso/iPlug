'use client';

import { usePathname } from 'next/navigation';
import InboxSidebar from '@/components/chat/InboxSidebar';

export default function MessagesLayoutClient({ user, conversations, children }) {
  const pathname = usePathname();
  // If the pathname is exactly /messages, we are on the list view.
  // If it's anything else (e.g. /messages/[id]), a chat is active.
  const isChatActive = pathname !== '/messages';

  return (
    <div className="flex w-full overflow-hidden bg-[var(--bg-base)] h-[calc(100dvh-70px)] md:h-[calc(100dvh-var(--topbar-height))]">
      {/* Sidebar Area: 
          Desktop: always visible (block)
          Mobile: visible only if no chat is active (!isChatActive)
      */}
      <div 
        className={`w-full md:w-[350px] md:flex flex-shrink-0 flex-col border-r border-[var(--border)] h-full ${
          isChatActive ? 'hidden' : 'flex'
        }`}
      >
        <InboxSidebar user={user} initialConversations={conversations} />
      </div>

      {/* Chat Content Area:
          Desktop: always visible (flex)
          Mobile: visible only if chat is active (isChatActive)
      */}
      <div 
        className={`flex-1 min-w-0 h-full flex-col relative ${
          !isChatActive ? 'hidden md:flex' : 'flex'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
