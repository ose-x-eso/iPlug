import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/ NextResponse';

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription missing' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ push_subscription: subscription })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to save push subscription:', error);
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving subscription:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
