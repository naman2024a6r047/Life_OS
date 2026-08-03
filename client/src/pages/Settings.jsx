import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiImage, FiSave, FiCheck, FiAlertCircle, FiLink } from 'react-icons/fi';
import axios from 'axios';

export default function Settings() {
  const { user, setUser } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [previewError, setPreviewError] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await axios.put('/api/auth/profile', {
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
      });
      setUser(prev => ({ ...prev, ...res.data.user }));
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const avatarPreview = avatarUrl.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-24 md:pb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <FiUser size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Profile Settings</h1>
          <p className="text-xs text-text-muted">Manage your profile information</p>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="card p-6 space-y-5">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <FiImage className="text-primary" /> Profile Picture
        </h2>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-elevated border-2 border-border-subtle flex items-center justify-center shrink-0">
            {avatarPreview && !previewError ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {(user?.username || 'U')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-text-secondary mb-1 font-medium">Your current avatar</p>
            <p className="text-[11px] text-text-muted italic">
              {user?.avatar_url ? 'Custom image set' : 'No custom image — showing initial letter'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
            Image URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLink className="text-text-muted" size={14} />
            </div>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => { setAvatarUrl(e.target.value); setPreviewError(false); }}
              placeholder="https://example.com/my-photo.jpg"
              className="w-full pl-9 pr-4 py-2.5 bg-surface-elevated border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
            />
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Paste a direct, public image URL. Supported sources: Imgur, any CDN, or a public image link.
          </p>
          {previewError && avatarPreview && (
            <p className="text-[11px] text-danger flex items-center gap-1 mt-1">
              <FiAlertCircle size={11} /> Cannot load this image. Make sure the URL is correct and publicly accessible.
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-text-muted space-y-1">
          <p className="font-semibold text-primary mb-1">How to get an image URL:</p>
          <p>• <span className="text-text-secondary">Imgur.com</span> — Upload photo → right-click image → Copy image address</p>
          <p>• <span className="text-text-secondary">GitHub</span> — Upload to a repo → use the raw file URL</p>
          <p>• <span className="text-text-secondary">Any CDN</span> — Use any publicly accessible .jpg / .png / .webp URL</p>
        </div>
      </div>

      {/* Bio Section */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <FiUser className="text-primary" /> Bio
        </h2>
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">About You</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            placeholder="Systems Builder. Warrior. 100 Days Challenge active."
            className="w-full h-24 p-3 bg-surface-elevated border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted resize-none"
          />
          <p className="text-[11px] text-text-muted text-right mt-1">{bio.length}/200</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-bold text-text-primary">Account Info</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Username', value: user?.username || '—' },
            { label: 'Email', value: user?.email || '—', cls: 'truncate' },
            { label: 'Level', value: `Lv. ${user?.level || 1}`, cls: 'text-primary' },
            { label: 'Total XP', value: `${(user?.xp || 0).toLocaleString()} XP`, cls: 'text-primary' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
              <p className={`text-sm font-bold text-text-primary ${item.cls || ''}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Save Bar */}
      <div className="flex items-center gap-4 sticky bottom-6 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border-subtle shadow-glow-primary">
        {status === 'success' && (
          <span className="flex items-center gap-2 text-success text-sm font-semibold">
            <FiCheck size={16} /> Saved successfully!
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-2 text-danger text-sm font-semibold">
            <FiAlertCircle size={16} /> Failed to save.
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto bg-primary hover:bg-primary-dark text-background font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <FiSave size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  );
}
