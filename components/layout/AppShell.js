'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { markMessageAsDelivered, markAllUnreadAsDelivered } from '@/app/actions/messages';

import DesktopSidebar from './DesktopSidebar';
import MobileTabBar from './MobileTabBar';
import MobileTopNav from './MobileTopNav';
import AuthModal from '@/components/auth/AuthModal';
import CreatePlugModal from '@/components/feed/CreatePlugModal';
import FeedbackWidget from './FeedbackWidget';
import { useToast } from '@/components/ui/ToastProvider';
import './layout.css';

export default function AppShell({ children, initialUser }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(initialUser || null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();
  const isMessagesPage = pathname?.startsWith('/messages');
  
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchBadges = async (currentUser) => {
      if (!currentUser) return;
      
      markAllUnreadAsDelivered();
      
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);
      if (count !== null) setUnreadCount(count);

      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)
        .eq('is_read', false);
      if (notifCount !== null) setUnreadNotificationsCount(notifCount);
    };

    const fetchUserAndBadges = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      fetchBadges(currentUser);
    };
    
    if (!initialUser) {
      fetchUserAndBadges();
    } else {
      fetchBadges(initialUser);
    }

    const interval = setInterval(() => {
      markAllUnreadAsDelivered();
    }, 5000);

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    let messageSub;
    let notifSub;
    if (user) {
      messageSub = supabase
        .channel('appshell_messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
          (payload) => {
            setUnreadCount((prev) => prev + 1);
            markMessageAsDelivered(payload.new.id);
            if (payload.new.sender_id !== user.id) {
              toast.info('New message received');
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
          (payload) => {
            if (payload.old.is_read === false && payload.new.is_read === true) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();

      notifSub = supabase
        .channel('appshell_notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setUnreadNotificationsCount((prev) => prev + 1);
            toast.info(payload.new.message || 'New notification');
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.old.is_read === false && payload.new.is_read === true) {
              setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      authSub.unsubscribe();
      if (messageSub) supabase.removeChannel(messageSub);
      if (notifSub) supabase.removeChannel(notifSub);
    };
  }, [supabase, user?.id, initialUser, toast]);

  return (
    <div className="app-shell">
      <DesktopSidebar user={user} unreadCount={unreadCount} unreadNotificationsCount={unreadNotificationsCount} onOpenCreate={() => setIsCreateOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />
      
      <main className="app-main-content">
        {!isMessagesPage && <MobileTopNav unreadNotificationsCount={unreadNotificationsCount} />}
        
        {children}
      </main>
      
      <MobileTabBar user={user} unreadCount={unreadCount} unreadNotificationsCount={unreadNotificationsCount} onOpenCreate={() => setIsCreateOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      {user && (
        <CreatePlugModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}
      
      {/* Universal Feedback Widget for Beta */}
      <FeedbackWidget />
    </div>
  );
}
