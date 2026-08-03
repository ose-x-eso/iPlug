'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { sendMessage, markMessagesAsRead, deleteMessagesForMe, deleteMessagesForEveryone } from '@/app/actions/messages';
import Link from 'next/link';
import { useTransition } from 'react';
import { Hand, MapPin, Phone, User, MoreVertical, AlertCircle, Shield, Ban, Trash2, X } from 'lucide-react';

export default function ChatWindow({ initialMessages, currentUser, otherUser }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [hideDistance, setHideDistance] = useState(false);
  
  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // New States for Media
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pendingTextRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const supabase = createClient();

  const displayName = otherUser?.username || otherUser?.full_name || otherUser?.email?.split('@')[0] || "User";

  const isInitialLoad = useRef(true);

  useEffect(() => {
    setTimeout(() => {
      const ghostEnabled = localStorage.getItem('iplug_ghost_mode') === 'true';
      setHideDistance(ghostEnabled || otherUser?.ghost_mode);
    }, 0);
  }, [otherUser?.ghost_mode]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: isInitialLoad.current ? 'auto' : 'smooth' 
    });
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up Realtime Subscription
  useEffect(() => {
    if (!currentUser?.id || !otherUser?.id) return;

    // Listen for inserts on the messages table where sender or receiver match
    const channel = supabase
      .channel('realtime_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new;
          if (
            (newMessage.sender_id === currentUser.id && newMessage.receiver_id === otherUser.id) ||
            (newMessage.sender_id === otherUser.id && newMessage.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => {
              if (!prev.find(m => m.id === newMessage.id)) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updatedMessage = payload.new;
          setMessages((prev) => 
            prev.map((msg) => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, otherUser?.id, supabase]);

  // Mark messages as read when they come in or when the window opens
  useEffect(() => {
    const hasUnread = messages.some(m => !m.is_read && m.receiver_id === currentUser.id);
    if (hasUnread) {
      markMessagesAsRead(otherUser.id);
      
      // Update local state so they appear read immediately
      setTimeout(() => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.receiver_id === currentUser.id ? { ...msg, is_read: true } : msg
          )
        );
      }, 0);
    }
  }, [messages, currentUser.id, otherUser.id]);

  // Selection Logic
  const toggleSelection = (id) => {
    setSelectedMessages(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) setIsSelectionMode(false);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMessageClick = (e, id) => {
    if (isSelectionMode) {
      e.preventDefault();
      toggleSelection(id);
    }
  };

  const handleMessageLongPress = (id) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      toggleSelection(id);
    }
  };

  const handleDeleteMessages = () => {
    if (selectedMessages.size > 0) {
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async (type) => {
    const ids = Array.from(selectedMessages);
    if (ids.length === 0) {
      setShowDeleteModal(false);
      return;
    }

    // Check if user is sender of all selected messages
    const allSelectedAreMine = ids.every(id => {
      const msg = messages.find(m => m.id === id);
      return msg && msg.sender_id === currentUser.id;
    });

    if (type === 'everyone' && !allSelectedAreMine) {
      setShowDeleteModal(false);
      return; // Fallback security check
    }

    if (type === 'me') {
      setMessages(prev => prev.filter(m => !ids.includes(m.id)));
      deleteMessagesForMe(ids).catch(err => console.error(err));
    } else if (type === 'everyone') {
      setMessages(prev => prev.map(m => ids.includes(m.id) ? { ...m, is_deleted_for_everyone: true } : m));
      deleteMessagesForEveryone(ids).catch(err => console.error(err));
    }
    
    setIsSelectionMode(false);
    setSelectedMessages(new Set());
    setShowDeleteModal(false);
  };

  // Timer logic for long press
  const pressTimer = useRef(null);
  const handleTouchStart = (id) => {
    pressTimer.current = setTimeout(() => handleMessageLongPress(id), 500);
  };
  const handleTouchEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const uploadToStorage = async (file, pathPrefix = 'files') => {
    const fileExt = file.name.split('.').pop() || 'webm';
    const fileName = `${pathPrefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${currentUser.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('chat_attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('chat_attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleMicClick = async () => {
    if (isUploading || isSending) return;

    if (!isRecording && !isPaused) {
      // Start fresh recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'voice_note.webm', { type: 'audio/webm' });
          
          setIsUploading(true);
          try {
            const voice_note_url = await uploadToStorage(audioFile, 'voice');
            
            const formData = new FormData();
            formData.append('receiver_id', otherUser.id);
            formData.append('content', pendingTextRef.current);
            formData.append('voice_note_url', voice_note_url);

            const result = await sendMessage(formData);
            if (result?.error) alert("Failed to send voice note: " + result.error);
            else pendingTextRef.current = '';
          } catch (err) {
            console.error("Voice note upload error:", err);
            alert("Could not upload voice note.");
          } finally {
            setIsUploading(false);
          }
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setIsPaused(false);
        setRecordingTime(0);

        // Simple timer
        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        mediaRecorderRef.current.timer = timer;

      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access denied or unavailable.");
      }
    } else if (isRecording && !isPaused) {
      // Pause recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
        clearInterval(mediaRecorderRef.current.timer);
        setIsPaused(true);
      }
    } else if (isRecording && isPaused) {
      // Resume recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        mediaRecorderRef.current.timer = timer;
        setIsPaused(false);
      }
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      };
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      clearInterval(mediaRecorderRef.current.timer);
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSending || isUploading) return;

    const form = e.target;
    const content = form.content?.value || '';
    const file = attachmentFile;

    // Must have content, file, OR a recording
    if (!content.trim() && !file && !audioChunksRef.current.length) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append('receiver_id', otherUser.id);
    if (content.trim()) formData.append('content', content);
    if (file) formData.append('attachment', file);

    try {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        formData.append('voice_note', audioBlob, 'voice_note.webm');
      }

      const result = await sendMessage(formData);
      
      if (result?.error) {
        alert("Failed to send: " + result.error);
      } else {
        if (result?.notification_error) {
           alert("Message sent, but notification failed: " + result.notification_error);
        }
        form.reset();
        setAttachmentFile(null);
        handleCancelRecording(); // reset audio
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="chat-window-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100dvh', width: '100%', background: 'var(--bg-page)', overflow: 'hidden' }}>
      
      {/* Chat Header OR Selection Header */}
      {isSelectionMode ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0.75rem 1rem', 
          borderBottom: '1px solid var(--border)', 
          background: 'var(--bg-nav)', 
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => { setIsSelectionMode(false); setSelectedMessages(new Set()); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-heading)', cursor: 'pointer', display: 'flex' }}
            >
              <X size={24} />
            </button>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-heading)' }}>
              {selectedMessages.size}
            </span>
          </div>
          <button 
            onClick={handleDeleteMessages}
            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
          >
            <Trash2 size={24} />
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0.75rem 1rem', 
          borderBottom: '1px solid var(--border)', 
          background: 'var(--bg-nav)', 
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => window.history.back()} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-heading)', display: 'flex', cursor: 'pointer', padding: '0.5rem', marginLeft: '-0.5rem' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <Link href={`/profile/${otherUser.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {otherUser.avatar_url ? (
                  <img src={otherUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-heading)' }}>{displayName}</h3>
                {!hideDistance && otherUser.distance_str && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}><MapPin size={12} className="inline-icon" /> {otherUser.distance_str}</p>}
              </div>
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', color: 'var(--text-heading)', position: 'relative' }}>
            <button style={{ color: 'inherit', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setShowMenu(!showMenu)}><MoreVertical size={22} /></button>
            {showMenu && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: '0.5rem', 
                background: 'var(--bg-page, #111)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-md)', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                minWidth: '200px',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                <button 
                  onClick={() => { setIsSelectionMode(true); setShowMenu(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-heading)', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> 
                  Select Messages
                </button>
                <button 
                  onClick={() => { alert("Customize Chat settings coming soon!"); setShowMenu(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-heading)', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Shield size={16} /> Customize Chat
                </button>
                <button 
                  onClick={() => { alert(`Blocked ${displayName}`); setShowMenu(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-heading)', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Ban size={16} /> Block User
                </button>
                <button 
                  onClick={() => { alert(`Reported ${displayName} to admins.`); setShowMenu(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <AlertCircle size={16} /> Report User
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="chat-messages-area" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}><Hand size={16} className="inline-icon" /></span>
            <p>Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.filter(m => !(m.sender_id === currentUser.id && m.deleted_by_sender) && !(m.receiver_id === currentUser.id && m.deleted_by_receiver)).map((msg) => {
            const isMine = msg.sender_id === currentUser.id;
            const isSelected = selectedMessages.has(msg.id);
            return (
              <div 
                className="chat-message-bubble" 
                key={msg.id} 
                onClick={(e) => handleMessageClick(e, msg.id)}
                onTouchStart={() => handleTouchStart(msg.id)}
                onTouchEnd={handleTouchEnd}
                onContextMenu={(e) => { e.preventDefault(); handleMessageLongPress(msg.id); }}
                style={{ 
                  alignSelf: isMine ? 'flex-end' : 'flex-start', 
                  maxWidth: '75%',
                  cursor: isSelectionMode ? 'pointer' : 'default',
                  opacity: isSelectionMode && !isSelected ? 0.6 : 1,
                  transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                  transition: 'transform 0.1s, opacity 0.2s',
                  position: 'relative',
                  WebkitTouchCallout: 'none',
                  userSelect: isSelectionMode ? 'none' : 'auto'
                }}>
                
                {isSelectionMode && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    [isMine ? 'right' : 'left']: '105%',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid var(--border)',
                    background: isSelected ? 'var(--accent-primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                )}

                {msg.is_deleted_for_everyone ? (
                  <div style={{ 
                    background: 'var(--bg-input)', 
                    color: 'var(--text-muted)',
                    padding: '0.75rem 1rem', 
                    borderRadius: isMine ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Ban size={14} /> This message was deleted
                  </div>
                ) : (
                  <div style={{ 
                    background: isMine ? 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-input)', 
                    color: isMine ? 'white' : 'var(--text-heading)',
                    padding: (msg.file_url && msg.file_type === 'image') ? '0.25rem' : '0.75rem 1rem', 
                    borderRadius: isMine ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}>
                    {msg.file_url && msg.file_type === 'image' && (
                      <img src={msg.file_url} alt="Attachment" style={{ width: '100%', maxWidth: '300px', borderRadius: '0.75rem', display: 'block', marginBottom: msg.content ? '0.5rem' : 0 }} />
                    )}
                    {msg.file_url && msg.file_type === 'document' && (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none', background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: msg.content ? '0.5rem' : 0 }}>
                        📄 <span>{msg.file_name || 'Document'}</span>
                      </a>
                    )}
                    {msg.voice_note_url && (
                      <audio controls src={msg.voice_note_url} style={{ width: '200px', height: '40px', outline: 'none' }} />
                    )}
                    {msg.content && <div style={{ padding: (msg.file_url && msg.file_type === 'image') ? '0 0.5rem 0.5rem 0.5rem' : 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>}
                  </div>
                )}
                
                <div style={{ 
                  fontSize: '0.65rem', 
                  marginTop: '0.25rem', 
                  textAlign: isMine ? 'right' : 'left',
                  color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: isMine ? 'flex-end' : 'flex-start'
                }}>
                  <span suppressHydrationWarning>
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                  {isMine && !msg.is_deleted_for_everyone && (
                      <span style={{ 
                        color: msg.is_read ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                        fontSize: '0.8rem',
                        marginLeft: '2px',
                        fontWeight: 'bold',
                        letterSpacing: '-2px'
                      }}>
                        ✓✓
                      </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '0.75rem 1rem calc(0.5rem + env(safe-area-inset-bottom, 0px)) 1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', position: 'relative' }}>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setAttachmentFile(e.target.files[0]);
              setShowAttachments(false);
            }
          }}
          accept="image/*,application/pdf,.doc,.docx"
        />

        {/* Attachment Menu Popup */}
        {showAttachments && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '1rem',
            marginBottom: '0.5rem',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            padding: '0.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 100,
            width: '200px'
          }}>
            {[
              { icon: '📷', label: 'Photo/Video', color: '#ec4899', action: () => fileInputRef.current?.click() },
              { icon: '📄', label: 'Document', color: '#8b5cf6', action: () => fileInputRef.current?.click() },
              { icon: <MapPin size={16} className="inline-icon" />, label: 'Location', color: '#10b981', action: () => alert("Location coming soon!") },
              { icon: <User size={16} className="inline-icon" />, label: 'Contact', color: '#6366f1', action: () => alert("Contact coming soon!") }
            ].map((item, idx) => (
              <div 
                key={idx}
                onClick={item.action}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: 'white'
                }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {attachmentFile && (
          <div style={{ padding: '0.5rem', background: 'var(--bg-input)', borderRadius: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {attachmentFile.type.startsWith('image/') ? '📷' : '📄'} {attachmentFile.name}
            </span>
            <button type="button" onClick={() => setAttachmentFile(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} autoComplete="off">
          <input type="hidden" name="receiver_id" value={otherUser?.id} />
          
          <button 
            type="button"
            onClick={() => setShowAttachments(!showAttachments)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: showAttachments ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, color 0.2s',
              transform: showAttachments ? 'rotate(45deg)' : 'rotate(0)'
            }}
            title="Attach"
          >
            +
          </button>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-input)', padding: '0 0.5rem 0 1rem', opacity: isUploading ? 0.5 : 1 }}>
            {(isRecording || isPaused) ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', color: isPaused ? 'var(--text-muted)' : '#ef4444', fontWeight: 'bold' }}>
                <span className={!isPaused ? 'pulse-animation' : ''}>
                  {isPaused ? 'Paused' : 'Recording'}... {formatTime(recordingTime)}
                </span>
                <button type="button" onClick={handleCancelRecording} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0.5rem' }}>✕ Cancel</button>
              </div>
            ) : (
              <input 
                type="text" 
                name="content"
                placeholder="Type a message..."
                disabled={isSending || isUploading}
                autoComplete="off"
                style={{ flex: 1, padding: '0.75rem 0', border: 'none', background: 'transparent', color: 'var(--text-heading)', outline: 'none' }}
              />
            )}
            
            {/* Camera inside input bar */}
            {!(isRecording || isPaused) && (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isSending || isUploading} style={{ padding: '0.5rem', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </button>
            )}
          </div>
          
          {/* Microphone next to Send / in input bar area */}
          <button 
            type="button" 
            onClick={handleMicClick}
            disabled={isSending || isUploading}
            style={{ 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: isRecording ? 'white' : 'var(--text-muted)', 
              background: isRecording ? (isPaused ? 'var(--text-muted)' : '#ef4444') : 'var(--bg-input)', 
              borderRadius: '50%', 
              border: 'none', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isUploading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-animation"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg>
            ) : isRecording && !isPaused ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            )}
          </button>

          <button 
            type="submit" 
            disabled={isSending || isUploading}
            style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--accent-flat)', color: 'white', fontWeight: 'bold', cursor: (isSending || isUploading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '350px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '1.25rem 1rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, color: 'var(--text-heading)', fontSize: '1.1rem' }}>Delete message{selectedMessages.size > 1 ? 's' : ''}?</h3>
            </div>
            
            <button 
              onClick={() => confirmDelete('me')}
              style={{ padding: '1rem', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', color: '#ef4444', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Delete for me
            </button>
            
            {Array.from(selectedMessages).every(id => messages.find(m => m.id === id)?.sender_id === currentUser.id) && (
              <button 
                onClick={() => confirmDelete('everyone')}
                style={{ padding: '1rem', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', color: '#ef4444', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Delete for everyone
              </button>
            )}
            
            <button 
              onClick={() => setShowDeleteModal(false)}
              style={{ padding: '1rem', background: 'transparent', border: 'none', color: 'var(--text-heading)', fontSize: '1rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
