export async function sendWhatsAppNotification(phoneNumber, { type, message, link }) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn('WhatsApp credentials missing. Skipping WhatsApp notification.');
    return { error: 'Missing credentials' };
  }

  // Format the phone number (remove +, spaces, leading zeros, etc. if needed)
  // Meta Cloud API expects the number in international format without the + sign
  const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');

  let textBody = message;
  if (link) {
    textBody += `\n\nLink: ${link}`;
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'text',
    text: {
      body: textBody
    }
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      return { error: data.error?.message || 'Failed to send WhatsApp message' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('WhatsApp fetch error:', error);
    return { error: error.message };
  }
}
