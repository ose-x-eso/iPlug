import { sendWhatsAppNotification } from './whatsapp';
import { sendWebPushNotification } from './webpush';
import { createAdminClient } from '@/utils/supabase/admin';

export async function dispatchExternalNotifications(userId, { type, message, link }) {
  try {
    console.log(`[PUSH] Dispatching external notification to user ${userId}, type=${type}`);
    const supabaseAdmin = createAdminClient();
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('whatsapp_notifications_enabled, push_notifications_enabled, phone, push_subscription')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('[PUSH] Failed to fetch profile for external dispatch:', error);
      return;
    }

    console.log(`[PUSH] Profile fetched. push_enabled=${profile.push_notifications_enabled}, has_subscription=${!!profile.push_subscription}`);

    const promises = [];

    // WhatsApp Notification
    if (profile.whatsapp_notifications_enabled && profile.phone) {
      promises.push(
        sendWhatsAppNotification(profile.phone, { type, message, link })
          .then(res => console.log('[PUSH] WhatsApp sent successfully:', res))
          .catch(err => console.error('[PUSH] WhatsApp dispatch error:', err))
      );
    }

    // Web Push Notification
    if (profile.push_notifications_enabled && profile.push_subscription) {
      console.log(`[PUSH] Sending web push to subscription endpoint: ${typeof profile.push_subscription === 'object' ? profile.push_subscription.endpoint?.slice(0, 60) : 'string-type'}...`);
      promises.push(
        sendWebPushNotification(profile.push_subscription, { type, message, link })
          .then(res => console.log('[PUSH] Web Push sent successfully:', res))
          .catch(err => console.error('[PUSH] Web Push dispatch error:', err))
      );
    } else {
      console.log(`[PUSH] Skipping web push: enabled=${profile.push_notifications_enabled}, has_sub=${!!profile.push_subscription}`);
    }

    await Promise.allSettled(promises);
    console.log(`[PUSH] Dispatch complete for user ${userId}`);
  } catch (error) {
    console.error('[PUSH] Error in dispatchExternalNotifications:', error);
  }
}

