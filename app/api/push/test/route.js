import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendWebPushNotification } from '@/lib/notifications/webpush';
import { dispatchExternalNotifications } from '@/lib/notifications/dispatch';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode'); // e.g. ?mode=admin

    if (mode === 'admin') {
      // Test the admin client dispatch pathway exactly as messages.js does it
      try {
        await dispatchExternalNotifications(user.id, {
          type: 'TEST',
          message: 'Admin Dispatch Test Successful!',
          link: '/notifications'
        });
        return NextResponse.json({ success: true, message: 'Admin dispatch fired' });
      } catch (err) {
        return NextResponse.json({ error: 'Admin dispatch failed', details: err.message }, { status: 500 });
      }
    }

    // Standard client test
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('push_notifications_enabled, push_subscription, username')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.push_notifications_enabled || !profile.push_subscription) {
      return NextResponse.json({ error: 'Push not enabled or missing subscription' }, { status: 400 });
    }

    const result = await sendWebPushNotification(profile.push_subscription, {
      type: 'TEST',
      message: `Standard Test Successful!`,
      link: '/notifications'
    });

    if (result.error) {
      return NextResponse.json({ error: 'Push failed', details: result }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Standard push fired' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}
