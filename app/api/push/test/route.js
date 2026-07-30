import { createClient } from '@/utils/supabase/server';
import { sendWebPushNotification } from '@/lib/notifications/webpush';
import { NextResponse } from 'next/server';

// GET /api/push/test - sends a test push to the currently logged-in user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Not logged in', detail: authErr?.message }, { status: 401 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('push_notifications_enabled, push_subscription, username')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found', detail: profileErr?.message }, { status: 404 });
    }

    // Step 1: Check if push is enabled in DB
    if (!profile.push_notifications_enabled) {
      return NextResponse.json({
        error: 'Push notifications are NOT enabled for your account',
        hint: 'Go to Settings and click "Enable Push Notifications" first',
        push_notifications_enabled: false,
        has_subscription: !!profile.push_subscription
      }, { status: 400 });
    }

    // Step 2: Check if subscription exists
    if (!profile.push_subscription) {
      return NextResponse.json({
        error: 'No push subscription saved in your profile',
        hint: 'Go to Settings and click "Enable Push Notifications" to register your browser',
        push_notifications_enabled: true,
        has_subscription: false
      }, { status: 400 });
    }

    // Step 3: Attempt to send test push
    const result = await sendWebPushNotification(profile.push_subscription, {
      type: 'TEST',
      message: `Hey ${profile.username || 'there'}! Push notifications are working!`,
      link: '/notifications'
    });

    return NextResponse.json({
      success: true,
      message: 'Test push sent! You should see a notification on your device.',
      result,
      subscription_endpoint: typeof profile.push_subscription === 'object'
        ? profile.push_subscription.endpoint?.slice(0, 80) + '...'
        : 'stored as string'
    });
  } catch (err) {
    console.error('Push test error:', err);
    return NextResponse.json({
      error: 'Push test failed',
      detail: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
