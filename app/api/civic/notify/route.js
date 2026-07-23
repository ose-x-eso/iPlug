import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { dispatchExternalNotifications } from '@/lib/notifications/dispatch';

export async function POST(request) {
  try {
    const { broadcastId } = await request.json();
    if (!broadcastId) {
      return NextResponse.json({ error: 'broadcastId required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Fetch the broadcast details
    const { data: broadcast, error: fetchError } = await supabase
      .from('civic_broadcasts')
      .select('*')
      .eq('id', broadcastId)
      .single();

    if (fetchError || !broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // For the YC Demo MVP, we will simulate the geofencing by grabbing all users 
    // who have push notifications enabled. 
    // In production, we would use PostGIS or Haversine formula on a user_locations table.
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .not('push_subscription', 'is', null);

    if (profiles && profiles.length > 0) {
      // Fire notifications to all users
      const promises = profiles.map(profile => 
        dispatchExternalNotifications(profile.id, {
          type: 'civic_alert',
          message: `🚨 Civic Alert: ${broadcast.title}\n${broadcast.description}`,
          link: `/map?lat=${broadcast.latitude}&lng=${broadcast.longitude}`
        })
      );
      
      await Promise.allSettled(promises);
    }

    return NextResponse.json({ success: true, count: profiles?.length || 0 });
  } catch (err) {
    console.error('Error dispatching civic notifications:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
