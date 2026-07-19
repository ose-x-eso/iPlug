import { sendWhatsAppNotification } from './whatsapp';
import { sendWebPushNotification } from './webpush';
import { createClient } from '@/utils/supabase/server';

export async function dispatchExternalNotifications(userId, { type, message, link }) {
  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('whatsapp_notifications_enabled, push_notifications_enabled, phone, push_subscription')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Failed to fetch profile for external dispatch:', error);
      return;
    }

    const promises = [];

    // WhatsApp Notification
    if (profile.whatsapp_notifications_enabled && profile.phone) {
      promises.push(
        sendWhatsAppNotification(profile.phone, { type, message, link }).catch(err => 
          console.error('WhatsApp dispatch error:', err)
        )
      );
    }

    // Web Push Notification
    if (profile.push_notifications_enabled && profile.push_subscription) {
      promises.push(
        sendWebPushNotification(profile.push_subscription, { type, message, link }).catch(err => 
          console.error('Web Push dispatch error:', err)
        )
      );
    }

    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error in dispatchExternalNotifications:', error);
  }
}
