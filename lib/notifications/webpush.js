import webpush from 'web-push';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    'mailto:support@iplug.local',
    publicVapidKey,
    privateVapidKey
  );
} else {
  console.warn('VAPID keys not configured in .env.local. Web Push will fail.');
}

export async function sendWebPushNotification(subscription, { type, message, link }) {
  if (!publicVapidKey || !privateVapidKey) {
    throw new Error('VAPID keys missing in environment variables. Did you restart the server after adding them?');
  }

  try {
    const payload = JSON.stringify({
      title: 'iPlug',
      body: message,
      url: link || '/',
      icon: '/iplug_logo.png' // use existing logo
    });

    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error) {
    console.error('Web Push send error:', error);
    // If statusCode is 410, the subscription has expired or is invalid
    if (error.statusCode === 410) {
      return { error: 'Subscription expired', code: 410 };
    }
    return { error: error.message };
  }
}
