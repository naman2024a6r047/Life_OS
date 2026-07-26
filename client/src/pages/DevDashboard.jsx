import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiTerminal, FiGitCommit, FiFolder, FiAward, FiGlobe, FiMapPin,
  FiGithub, FiLinkedin, FiTwitter, FiStar, FiExternalLink, FiCode, FiPlus, FiTrash2, FiSave
} from 'react-icons/fi';
import axios from 'axios';

export default function DevDashboard() {
  const { user, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('settings');

  const [devProfile, setDevProfile] = useState(null);
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [developerInfo, setDeveloperInfo] = useState({
    tagline: 'Full Stack Developer & Tech Enthusiast',
    bio: 'I love building scalable web applications and exploring new technologies. Currently focusing on System Design and DevOps.',
    location: 'Jammu, India',
    website: 'naman.dev',
    role: 'Full Stack Developer',
    experience: '2+ Years',
    focus: 'Backend, DevOps, Cloud',
    learning: 'System Design, Docker, Kubernetes',
    openTo: 'Collaboration & Full-time Opportunities'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/dev/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.profile) {
        setDevProfile(res.data.profile);
        setPortfolioLinks(res.data.profile.portfolio_links || []);
        if (res.data.profile.developer_info && Object.keys(res.data.profile.developer_info).length > 0) {
          setDeveloperInfo(res.data.profile.developer_info);
        }
      }
    } catch (error) {
      console.error('Error fetching dev profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await axios.put('/api/dev/profile', {
        portfolio_links: portfolioLinks,
        developer_info: developerInfo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevProfile(res.data);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
            <FiTerminal size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Developer Profile</h1>
            <p className="text-xs text-text-muted">Build. Learn. Share. Grow as a developer.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💻</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">0</p>
              <p className="text-[9px] text-text-muted">Projects</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔄</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">0</p>
              <p className="text-[9px] text-text-muted">Commits</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📁</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">0</p>
              <p className="text-[9px] text-text-muted">Repositories</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏆</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">0</p>
              <p className="text-[9px] text-text-muted">Achievements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-1">
        {portfolioLinks.map((link, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(link.platform)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === link.platform ? 'text-primary border-b-2 border-primary font-semibold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {link.platform}
          </button>
        ))}

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'settings' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Main Layout Grid */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Profile Card */}
        <div className="col-span-1 md:col-span-8 card p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white text-2xl font-bold">
                {(user?.username || 'N')[0].toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-success border-2 border-surface" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">{user?.username || 'Naman'}</h2>
                <span className="badge-primary text-[9px]">Lv. {user?.level || 13}</span>
              </div>
              <p className="text-xs text-text-muted font-medium mt-0.5">{developerInfo?.tagline || 'Tagline not set'}</p>
              <p className="text-xs text-text-secondary mt-2">
                {developerInfo?.bio || 'No bio provided.'}
              </p>

              <div className="flex items-center gap-4 text-xs text-text-muted mt-3">
                {developerInfo?.location && <span className="flex items-center gap-1"><FiMapPin size={12} /> {developerInfo.location}</span>}
                {developerInfo?.website && <span className="flex items-center gap-1 text-info hover:underline"><FiGlobe size={12} /> {developerInfo.website}</span>}
                <span>📅 Joined Jan 2024</span>
              </div>
            </div>

            {/* Role & Specs Box */}
            <div className="w-56 p-3 rounded-xl bg-surface-elevated text-xs space-y-2">
              <div>
                <p className="text-[10px] text-text-muted">Role</p>
                <p className="font-semibold text-text-primary">{developerInfo?.role || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Experience</p>
                <p className="font-semibold text-text-primary">{developerInfo?.experience || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Focus</p>
                <p className="font-semibold text-text-primary">{developerInfo?.focus || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Currently Learning</p>
                <p className="font-semibold text-text-primary">{developerInfo?.learning || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Open to</p>
                <p className="font-semibold text-success">{developerInfo?.openTo || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Stats & Mini Calendar */}
        <div className="col-span-1 md:col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Developer Stats</h3>
            <span className="text-xs text-text-muted">This Month ▾</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-surface-elevated">
              <p className="text-lg font-bold font-mono text-text-primary">0</p>
              <p className="text-[9px] text-text-muted">Contributions</p>
              <span className="text-[8px] text-text-muted font-semibold">-</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-elevated">
              <p className="text-lg font-bold font-mono text-text-primary">0</p>
              <p className="text-[9px] text-text-muted">Pull Requests</p>
              <span className="text-[8px] text-text-muted font-semibold">-</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-elevated">
              <p className="text-lg font-bold font-mono text-text-primary">0</p>
              <p className="text-[9px] text-text-muted">Issues Closed</p>
              <span className="text-[8px] text-text-muted font-semibold">-</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-elevated">
              <p className="text-lg font-bold font-mono text-text-primary">0</p>
              <p className="text-[9px] text-text-muted">Code Reviews</p>
              <span className="text-[8px] text-text-muted font-semibold">-</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Dynamic Iframe Pages for Portfolio Links */}
      {portfolioLinks.map(link => {
        if (activeTab === link.platform) {
          const formattedUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
          return (
            <div key={link.platform} className="w-full min-h-[700px] h-[80vh] mt-4 rounded-xl overflow-hidden border border-border-subtle bg-surface flex flex-col">
              <div className="w-full bg-surface-elevated border-b border-border-subtle px-4 py-2 flex items-center justify-between text-xs text-text-muted">
                <span>Viewing: <strong className="text-text-primary font-mono">{formattedUrl}</strong></span>
                <a href={formattedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <span>Open in new tab if page fails to load</span>
                  <FiExternalLink size={12} />
                </a>
              </div>
              <iframe 
                src={formattedUrl} 
                title={link.platform} 
                className="w-full flex-1 border-0" 
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          );
        }
        return null;
      })}

      {activeTab === 'settings' && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Developer Settings</h3>
              <p className="text-xs text-text-muted mt-1">Manage your profile info, portfolio, and social links.</p>
            </div>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-glow-primary hover:bg-primary-hover disabled:opacity-50"
            >
              <FiSave />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-text-primary">Profile Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={developerInfo.tagline} 
                  onChange={(e) => setDeveloperInfo({ ...developerInfo, tagline: e.target.value })}
                  className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Role</label>
                <input 
                  type="text" 
                  value={developerInfo.role} 
                  onChange={(e) => setDeveloperInfo({ ...developerInfo, role: e.target.value })}
                  className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1">Bio</label>
                <textarea 
                  value={developerInfo.bio} 
                  onChange={(e) => setDeveloperInfo({ ...developerInfo, bio: e.target.value })}
                  rows={2}
                  className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Location</label>
                <input 
                  type="text" 
                  value={developerInfo.location} 
                  onChange={(e) => setDeveloperInfo({ ...developerInfo, location: e.target.value })}
                  className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Website (domain only)</label>
                <input 
                  type="text" 
                  value={developerInfo.website} 
                  onChange={(e) => setDeveloperInfo({ ...developerInfo, website: e.target.value })}
                  className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Experience</label>
                <input 
                  type="text" 
                  value={developerInfo.experience} 
                  onChange={(e) => setDeveloperInfo({ ...developerInfo, experience: e.target.value })}
                  className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Focus Areas</label>
                <input 
                  type="text" 
                  value={developerInfo.focus} 
                  onChange={(e) => setDeveloperInfo({ ...developerInfo, focus: e.target.value })}
                  className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Currently Learning</label>
                <input 
                  type="text" 
                  value={developerInfo.learning} 
                  onChange={(e) => setDeveloperInfo({ ...developerInfo, learning: e.target.value })}
                  className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Open To</label>
                <input 
                  type="text" 
                  value={developerInfo.openTo} 
                  onChange={(e) => setDeveloperInfo({ ...developerInfo, openTo: e.target.value })}
                  className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <h4 className="text-sm font-bold text-text-primary">Portfolio & Social Links</h4>
            {portfolioLinks.map((link, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-surface-elevated border border-border-subtle rounded-xl">
                <div className="w-full sm:w-1/3">
                  <label className="block text-xs font-semibold text-text-muted mb-1">Platform Name</label>
                  <input 
                    type="text" 
                    value={link.platform} 
                    onChange={(e) => {
                      const newLinks = [...portfolioLinks];
                      newLinks[idx].platform = e.target.value;
                      setPortfolioLinks(newLinks);
                    }}
                    placeholder="e.g. GitHub"
                    className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                  />
                </div>
                <div className="w-full sm:flex-1">
                  <label className="block text-xs font-semibold text-text-muted mb-1">URL</label>
                  <input 
                    type="url" 
                    value={link.url} 
                    onChange={(e) => {
                      const newLinks = [...portfolioLinks];
                      newLinks[idx].url = e.target.value;
                      setPortfolioLinks(newLinks);
                    }}
                    placeholder="https://..."
                    className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                  />
                </div>
                <div className="w-full sm:w-auto pt-5">
                  <button 
                    onClick={() => {
                      const newLinks = portfolioLinks.filter((_, i) => i !== idx);
                      setPortfolioLinks(newLinks);
                    }}
                    className="w-full sm:w-auto p-2.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors flex items-center justify-center"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => setPortfolioLinks([...portfolioLinks, { platform: '', url: '' }])}
              className="w-full py-4 border-2 border-dashed border-border-subtle rounded-xl text-text-muted hover:text-primary hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <FiPlus size={24} />
              <span className="text-sm font-semibold">Add New Profile Link</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
