import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createNotification } from '@/app/actions/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: unreadMessages, error: messagesError } = await supabase
      .from('messages')
      .select('id, receiver_id, sender_id, created_at')
      .eq('is_read', false)
      .lt('created_at', twoDaysAgo.toISOString());

    if (messagesError) {
      console.error('Error fetching unread messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    if (!unreadMessages || unreadMessages.length === 0) {
      return NextResponse.json({ message: 'No old unread messages found' });
    }

    const receiverIds = [...new Set(unreadMessages.map((msg) => msg.receiver_id))];
    let sentCount = 0;

    for (const receiverId of receiverIds) {
      const { data: recentReminder } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', receiverId)
        .in('type', ['UNREAD_REMINDER', 'Unread Messages'])
        .gte('created_at', twoDaysAgo.toISOString())
        .limit(1);

      if (recentReminder && recentReminder.length > 0) {
        continue;
      }

      await createNotification(
        receiverId,
        'UNREAD_REMINDER',
        'You have messages that have been unread for more than 2 days. Do not keep your customers waiting.',
        { link: '/messages' }
      );
      sentCount += 1;
    }

    const messageIds = unreadMessages.map((msg) => msg.id);
    await supabase
      .from('messages')
      .update({ reminded_at: new Date().toISOString() })
      .in('id', messageIds);

    return NextResponse.json({
      success: true,
      message: `Sent reminders to ${sentCount} users.`,
    });
  } catch (err) {
    console.error('Cron Reminder Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
