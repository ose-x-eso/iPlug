'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function EditProfileModal({ isOpen, onClose, profile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setErrorMsg('');
        setSuccessMsg('');
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function uploadImage(file, path) {
    if (!file || file.size === 0) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}_${path}_${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.target);
    const avatarFile = formData.get('avatar_file');
    const coverFile = formData.get('cover_file');

    try {
      let avatar_url = profile?.avatar_url;
      let cover_url = profile?.cover_url;

      if (avatarFile && avatarFile.size > 0) {
        avatar_url = await uploadImage(avatarFile, 'avatar');
      }
      if (coverFile && coverFile.size > 0) {
        cover_url = await uploadImage(coverFile, 'cover');
      }

      const updates = {
        title: formData.get('title') || null,
        bio: formData.get('bio') || null,
        phone_number: formData.get('phone_number') || null,
        portfolio_url: formData.get('portfolio_url') || null,
        avatar_url,
        cover_url
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1000);

    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>Edit Profile</h2>
          <p>Customize your public appearance.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          {errorMsg && <div className="auth-error">{errorMsg}</div>}
          {successMsg && (
            <div className="auth-success" style={{ padding: '10px', background: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 'var(--fs-sm)' }}>
              {successMsg}
            </div>
          )}

          {!successMsg && (
            <>
              <div className="input-group">
                <label>Professional Title</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={profile?.title || ''} 
                  placeholder="e.g. Developer, Certified Plumber, Artist" 
                  className="input-field" 
                />
              </div>

              <div className="input-group">
                <label>Bio / About Me</label>
                <textarea 
                  name="bio" 
                  defaultValue={profile?.bio || ''} 
                  placeholder="Tell people about yourself..."
                  rows="4"
                  className="input-field"
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <div className="input-group">
                <label>Portfolio / External Links</label>
                <textarea 
                  name="portfolio_url" 
                  defaultValue={profile?.portfolio_url || ''} 
                  placeholder="Portfolio link: https://...&#10;Other links..." 
                  className="input-field" 
                  rows="3"
                />
              </div>

              <div className="input-group">
                <label>Phone Number (Public)</label>
                <input 
                  type="tel" 
                  name="phone_number" 
                  defaultValue={profile?.phone_number || ''} 
                  placeholder="+234..." 
                  className="input-field" 
                />
              </div>

              <div className="input-group">
                <label>Profile Picture</label>
                <input 
                  type="file" 
                  name="avatar_file" 
                  accept="image/*"
                  className="input-field" 
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <div className="input-group">
                <label>Cover Banner</label>
                <input 
                  type="file" 
                  name="cover_file" 
                  accept="image/*"
                  className="input-field" 
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full mt-lg" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
