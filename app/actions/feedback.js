'use server';

import { createClient } from '@/utils/supabase/server';

export async function submitFeedback(feedbackText) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Insert feedback (user_id will be null if they are not logged in)
    const { error } = await supabase
      .from('beta_feedback')
      .insert({
        user_id: user?.id || null,
        feedback: feedbackText
      });

    if (error) {
      console.error('Error submitting feedback:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error submitting feedback:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}
