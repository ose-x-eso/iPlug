import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Since this is a server-side cron job, it needs to use a service role key or standard client
// Ensure you set SUPABASE_SERVICE_ROLE_KEY in your environment for production to bypass RLS.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate the date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Fetch messages that are unread and older than 2 days
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('messages')
      .select('receiver_id, sender_id')
      .eq('is_read', false)
      .lt('created_at', twoDaysAgo.toISOString());

    if (messagesError) {
      console.error("Error fetching unread messages:", messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    if (!unreadMessages || unreadMessages.length === 0) {
      return NextResponse.json({ message: 'No old unread messages found' });
    }

    // Get unique receiver IDs
    const receivers = [...new Set(unreadMessages.map(msg => msg.receiver_id))];

    // Create a notification for each receiver
    const notifications = receivers.map(receiverId => ({
      user_id: receiverId,
      type: 'Unread Messages',
      message: 'You have messages that have been unread for more than 2 days! Don\'t keep your customers waiting.'
    }));

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifError) {
      console.error("Error creating reminders:", notifError);
      return NextResponse.json({ error: 'Failed to create notifications' }, { status: 500 });
    }

    // Optionally: Mark these messages as 'reminded' to avoid sending notifications repeatedly.
    // Since we don't have a 'reminded' column in the MVP, this endpoint will resend if triggered again,
    // so in production, you should add a 'reminded' boolean column or query based on exact ranges.

    return NextResponse.json({ 
      success: true, 
      message: `Sent reminders to ${receivers.length} users.` 
    });

  } catch (err) {
    console.error("Cron Reminder Error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
