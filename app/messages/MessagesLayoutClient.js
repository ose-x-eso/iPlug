'use client';

import { usePathname } from 'next/navigation';
import InboxSidebar from '@/components/chat/InboxSidebar';

export default function MessagesLayoutClient({ user, conversations, children }) {
  const pathname = usePathname();
  // If the pathname is exactly /messages, we are on the list view.
  // If it's anything else (e.g. /messages/[id]), a chat is active.
  const isChatActive = pathname !== '/messages';

  return (
    <div className="messages-layout-container">
      {/* Sidebar Area: 
          Desktop: always visible (forced by CSS media query)
          Mobile: visible only if no chat is active
      */}
      <div className={`messages-sidebar-wrapper ${isChatActive ? 'chat-active-hidden' : ''}`}>
        <InboxSidebar user={user} initialConversations={conversations} />
      </div>

      {/* Chat Content Area:
          Desktop: always visible (forced by CSS media query)
          Mobile: visible only if chat is active
      */}
      <div className={`messages-chat-wrapper ${!isChatActive ? 'chat-inactive-hidden' : ''}`}>
        {children}
      </div>
    </div>
  );
}
