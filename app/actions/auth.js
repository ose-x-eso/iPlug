'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from './notifications'

export async function login(formData) {
  try {
    const supabase = await createClient();
    
    const rawEmail = formData.get('email');
    const emailOrUsername = rawEmail ? String(rawEmail).toLowerCase() : '';
    const password = formData.get('password');

    let loginEmail = emailOrUsername;

    // If it's not an email, assume it's a username and look up the email
    if (emailOrUsername && !emailOrUsername.includes('@')) {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', emailOrUsername)
        .maybeSingle();
        
      if (profileErr || !profile || !profile.email) {
        return { error: 'Username not found.' };
      }
      loginEmail = profile.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: String(password),
    });

    if (error) {
      return { error: String(error.message || 'Invalid login credentials') };
    }
    return { success: true };
  } catch (err) {
    console.error("Login server action exception:", err);
    return { error: 'A server error occurred: ' + (err?.message || 'Unknown') };
  }
}

export async function signUp(formData) {
  try {
    const supabase = await createClient()
    
    const email = formData.get('email')?.toLowerCase();
    const password = formData.get('password')
    const fullName = formData.get('fullName')
    const phoneNumber = formData.get('phoneNumber')
    const username = formData.get('username')?.toLowerCase();

    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { error: 'That username is already taken. Please choose another.' }
    }

    // Check if phone number is already taken
    if (phoneNumber) {
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single();
        
      if (existingPhone) {
        return { error: 'That phone number is already registered. Please use another.' }
      }
    }

    // 1. Sign up the user and pass metadata for the trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          username: username,
        }
      }
    })

    if (error) {
      console.error('Supabase auth signUp error object:', error);
      console.error('Supabase auth signUp error.message:', error.message);
      let errorMessage = error.message;
      if (typeof errorMessage === 'object' || errorMessage === '{}') {
        errorMessage = 'Database error during sign up. Please try again.';
      }
      return { error: errorMessage || 'An unknown error occurred during sign up.' }
    }

    if (data?.user) {
      // Supabase fake signs up users if the email already exists to prevent enumeration.
      if (data.user.identities && data.user.identities.length === 0) {
        return { error: 'This email is already registered. Please log in.' };
      }
      
      // If session is null, email confirmation is required!
      if (!data.session) {
        return { success: true, requireConfirmation: true };
      }

      // If we have a session, we can safely upsert
      await supabase.from('profiles').upsert({ id: data.user.id, username, email, full_name: fullName, phone_number: phoneNumber });
      
      // Send Welcome Notification
      await createNotification(
        data.user.id,
        'Welcome',
        'Welcome to iPlug! Start exploring services and shops around you.'
      );
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('Sign up error:', err);
    let errorMessage = err?.message;
    if (typeof errorMessage === 'object' || errorMessage === '{}') {
      errorMessage = 'An unexpected database error occurred during sign up.';
    }
    return { error: errorMessage || 'An unexpected error occurred during sign up.' };
  }
}

export async function logout() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message || 'An unknown error occurred during logout.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function sendPasswordResetEmail(formData) {
  const supabase = await createClient();
  const email = formData.get('email');

  if (!email) {
    return { error: 'Email is required' };
  }

  // The redirectTo URL must go through the callback route to exchange the code for a session cookie
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateUserPassword(formData) {
  const supabase = await createClient();
  const currentPassword = formData.get('currentPassword');
  const password = formData.get('password');

  if (!currentPassword) {
    return { error: 'Current password is required' };
  }

  if (!password || password.length < 6) {
    return { error: 'New password must be at least 6 characters' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { error: 'You must be logged in to do this.' };
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: 'Incorrect current password.' };
  }

  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteUserAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // To delete a user, we must call a custom PostgreSQL function 'delete_user' via RPC.
  const { error } = await supabase.rpc('delete_user');

  if (error) {
    return { error: error.message };
  }

  // Sign out the user locally after successful deletion
  await supabase.auth.signOut();
  
  revalidatePath('/', 'layout');
  return { success: true };
}
