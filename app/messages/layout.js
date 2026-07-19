import { createClient } from '@/utils/supabase/server';
import AppShell from '@/components/layout/AppShell';
import InboxSidebar from '@/components/chat/InboxSidebar';
import { redirect } from 'next/navigation';

export default async function MessagesLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <AppShell initialUser={user}>
      <div className="messages-layout-container">
        {/* Desktop Split Pane */}
        <div className="messages-sidebar-wrapper hidden-mobile">
          <InboxSidebar user={user} />
        </div>
        
        {/* Main Content Area */}
        <div className="messages-content-wrapper">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
