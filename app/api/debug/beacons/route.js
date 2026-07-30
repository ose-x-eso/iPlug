import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/debug/beacons - check what beacons the server can see
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Query exactly the same way the map page does
    const { data: beacons, error: beaconError } = await supabase
      .from('profiles')
      .select('id, username, full_name, is_requesting_skill, skill_request_desc, skill_request_lat, skill_request_lng')
      .eq('is_requesting_skill', true)
      .not('skill_request_lat', 'is', null);

    // Also get ALL profiles that have is_requesting_skill = true (even without lat)
    const { data: allRequesters, error: allError } = await supabase
      .from('profiles')
      .select('id, username, full_name, is_requesting_skill, skill_request_desc, skill_request_lat, skill_request_lng')
      .eq('is_requesting_skill', true);

    // Check current user's push status
    let pushInfo = null;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('push_notifications_enabled, push_subscription, is_requesting_skill, skill_request_desc, skill_request_lat, skill_request_lng')
        .eq('id', user.id)
        .single();
      pushInfo = {
        push_enabled: profile?.push_notifications_enabled,
        has_subscription: !!profile?.push_subscription,
        is_requesting: profile?.is_requesting_skill,
        request_desc: profile?.skill_request_desc,
        request_lat: profile?.skill_request_lat,
        request_lng: profile?.skill_request_lng
      };
    }

    return NextResponse.json({
      logged_in_as: user?.id || 'anonymous',
      beacons_with_location: beacons || [],
      beacon_query_error: beaconError?.message || null,
      all_requesters_including_no_location: allRequesters || [],
      all_requesters_error: allError?.message || null,
      your_push_info: pushInfo
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
