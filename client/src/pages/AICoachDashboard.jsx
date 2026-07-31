import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDatabase, FiSearch, FiPlus, FiDownload,
  FiFolder, FiGrid, FiList,
  FiCheck, FiX, FiUploadCloud, FiEye, FiEdit2, FiTrash2,
  FiLink, FiAlertCircle,
  FiStar, FiRefreshCw, FiUpload
} from 'react-icons/fi';
import axios from 'axios';
import { initGoogleDriveApi, requestGoogleDriveAccess, extractFolderId, getOrCreateAppFolder, fetchFilesFromDrive, uploadPhotoToDrive as uploadFileToDrive } from '../utils/googleDriveApi';

const DEFAULT_ICONS = ['📁', '📚', '📝', '🎯', '💡', '🔬', '🎓', '🖥️', '🌐', '📊', '🎨', '🏆', '⭐', '🔖', '🗂️'];
const DEFAULT_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];

const getFileIcon = (mimeType) => {
  if (!mimeType) return '📄';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('video')) return '🎥';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return '📊';
  if (mimeType.includes('presentation')) return '📊';
  if (mimeType.includes('document')) return '📝';
  return '📄';
};

const formatSize = (bytes) => {
  if (!bytes) return '-';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
};

function CategoryModal({ isOpen, onClose, onSave, editData = null }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#8B5CF6');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setName(editData.name || ''); setIcon(editData.icon || '📁');
      setColor(editData.color || '#8B5CF6'); setDescription(editData.description || '');
    } else { setName(''); setIcon('📁'); setColor('#8B5CF6'); setDescription(''); }
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try { await onSave({ name: name.trim(), icon, color, description: description.trim() }); onClose(); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><FiX size={18} /></button>
        <h2 className="text-base font-bold text-text-primary mb-4">{editData ? 'Edit Category' : 'New Category'}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_ICONS.map(ic => (
                <button key={ic} onClick={() => setIcon(ic)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${icon === ic ? 'ring-2 ring-purple bg-purple/10' : 'bg-surface-elevated hover:bg-surface-elevated/80'}`}>{ic}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">Color</label>
            <div className="flex gap-2">
              {DEFAULT_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ background: c }}
                  className={`w-6 h-6 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-background scale-110' : ''}`} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Study Materials"
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional..." rows={2}
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple resize-none" />
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: color + '22' }}>{icon}</div>
            <div>
              <p className="text-xs font-bold text-text-primary">{name || 'Category Name'}</p>
              <p className="text-[10px] text-text-muted">{description || 'No description'}</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={loading || !name.trim()}
            className="w-full py-2.5 rounded-xl bg-purple text-white font-bold text-xs hover:bg-purple/80 disabled:opacity-50 transition-all">
            {loading ? 'Saving...' : editData ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function UploadResourceModal({ isOpen, onClose, categories, googleAccessToken, userProfile, onSave, requestGoogleAccess, onSaveFolderLink }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [inputMode, setInputMode] = useState('file');
  const [loadingState, setLoadingState] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (!isOpen) {
      setName(''); setDescription(''); setCategoryId(''); setTags('');
      setSelectedFile(null); setLinkUrl(''); setLoadingState('');
    }
  }, [isOpen]);

  const needsSetup = !googleAccessToken;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoadingState('Starting...');
    try {
      let driveData = {};
      if (inputMode === 'file' && selectedFile && googleAccessToken) {
        setLoadingState('Checking Drive Folder...');
        const folderId = await getOrCreateAppFolder(googleAccessToken);
        
        if (!folderId) {
          alert('Failed to initialize Google Drive folder.');
          return;
        }
        
        setLoadingState('Uploading to Drive...');
        const result = await uploadFileToDrive(selectedFile, folderId, googleAccessToken);
        driveData = { drive_file_id: result.id, drive_web_view_link: result.webViewLink, mime_type: selectedFile.type, file_size: selectedFile.size };
      } else if (inputMode === 'link' && linkUrl) {
        driveData = { drive_web_view_link: linkUrl, drive_web_content_link: linkUrl };
      }
      setLoadingState('Saving to Database...');
      await onSave({ name: name.trim(), description: description.trim(), category_id: categoryId || null, tags: tags.split(',').map(t => t.trim()).filter(Boolean), ...driveData });
      onClose();
    } catch (err) { 
      console.error('Upload error:', err);
      alert('Error during ' + loadingState + ': ' + (err.message || 'Unknown error'));
    }
    finally { setLoadingState(''); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><FiX size={18} /></button>
        <h2 className="text-base font-bold text-text-primary mb-1">Add Resource</h2>
        <p className="text-[11px] text-text-muted mb-5">Upload a file to Google Drive or add a link.</p>
        
        {needsSetup && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/30 space-y-2">
            <p className="text-[11px] font-semibold text-yellow-400 flex items-center gap-1.5"><FiAlertCircle size={12} /> Drive setup required for file uploads</p>
            {!googleAccessToken && (
              <button onClick={requestGoogleAccess} className="px-3 py-1.5 bg-[#4285F4] text-white text-[11px] font-bold rounded-lg">Sign in with Google</button>
            )}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Resource name"
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2}
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple">
              <option value="">Uncategorized</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. python, notes, exam"
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">Source</label>
            <div className="flex rounded-xl border border-border-subtle overflow-hidden">
              <button onClick={() => setInputMode('file')} className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${inputMode === 'file' ? 'bg-purple text-white' : 'bg-surface text-text-muted hover:bg-surface-elevated'}`}><FiUpload size={12} /> Upload File</button>
              <button onClick={() => setInputMode('link')} className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${inputMode === 'link' ? 'bg-purple text-white' : 'bg-surface text-text-muted hover:bg-surface-elevated'}`}><FiLink size={12} /> Add Link</button>
            </div>
          </div>
          {inputMode === 'file' ? (
            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${needsSetup ? 'border-yellow-500/30 bg-yellow-500/5 opacity-60' : 'border-border-subtle hover:border-purple/50 cursor-pointer'}`}
              onClick={() => !needsSetup && fileRef.current?.click()}>
              <FiUploadCloud size={28} className="text-purple mb-2" />
              {selectedFile ? <p className="text-xs font-bold text-text-primary">{getFileIcon(selectedFile.type)} {selectedFile.name}</p> : (
                <><p className="text-xs text-text-muted mb-1">Click to select a file</p><p className="text-[10px] text-text-muted opacity-60">PDF, Video, Images, Docs supported</p></>
              )}
              <input ref={fileRef} type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
            </div>
          ) : (
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..."
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple" />
          )}
          <button onClick={handleSubmit} disabled={!!loadingState || !name.trim()}
            className="w-full py-2.5 rounded-xl bg-purple text-white font-bold text-xs hover:bg-purple/80 disabled:opacity-50 flex items-center justify-center gap-2">
            {loadingState ? <><FiRefreshCw className="animate-spin" size={13} /> {loadingState}</> : 'Add Resource'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function EditResourceModal({ isOpen, onClose, resource, categories, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resource) {
      setName(resource.name || ''); setDescription(resource.description || '');
      setCategoryId(resource.category_id || ''); setTags((resource.tags || []).join(', ')); setIsPinned(resource.is_pinned || false);
    }
  }, [resource, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(resource.id, { name: name.trim(), description: description.trim(), category_id: categoryId || null, tags: tags.split(',').map(t => t.trim()).filter(Boolean), is_pinned: isPinned });
      onClose();
    } finally { setLoading(false); }
  };

  if (!isOpen || !resource) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><FiX size={18} /></button>
        <h2 className="text-base font-bold text-text-primary mb-4">Edit Resource</h2>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple">
              <option value="">Uncategorized</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">Tags</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tag1, tag2"
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setIsPinned(!isPinned)}
              className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5 ${isPinned ? 'bg-purple' : 'bg-surface-elevated border border-border-subtle'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isPinned ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-xs text-text-secondary">Pin this resource</span>
          </label>
          <button onClick={handleSave} disabled={loading || !name.trim()}
            className="w-full py-2.5 rounded-xl bg-purple text-white font-bold text-xs hover:bg-purple/80 disabled:opacity-50">
            {loading ? 'Saving...' : 'Update Resource'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card p-6 w-full max-w-xs shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto text-2xl">🗑️</div>
        <div>
          <h3 className="text-sm font-bold text-text-primary">{title}</h3>
          <p className="text-[11px] text-text-muted mt-1">{message}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border-subtle text-text-secondary text-xs font-semibold hover:bg-surface-elevated">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

function ResourceCard({ resource: r, onEdit, onDelete, onTogglePin }) {
  return (
    <div className="card overflow-hidden hover:border-purple/40 transition-all flex flex-col justify-between group">
      <div className="p-4 bg-gradient-to-br from-primary/20 to-purple/20 flex flex-col items-center justify-center text-center h-24 relative">
        <span className="text-3xl mb-1">{getFileIcon(r.mime_type)}</span>
        <h4 className="text-[11px] font-extrabold text-white truncate w-full px-2">{r.name}</h4>
        {r.is_pinned && <FiStar size={10} className="absolute top-2 right-2 text-yellow-400 fill-yellow-400" />}
      </div>
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-bold text-text-primary truncate">{r.name}</p>
          {r.category && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: r.category.color + '22', color: r.category.color }}>
              {r.category.icon} {r.category.name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <span className="text-[9px] text-text-muted font-mono">{formatSize(r.file_size)}</span>
          <div className="flex items-center gap-1.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onTogglePin}><FiStar size={11} className={`hover:text-yellow-400 cursor-pointer ${r.is_pinned ? 'text-yellow-400 fill-yellow-400' : ''}`} /></button>
            {r.drive_web_view_link && <a href={r.drive_web_view_link} target="_blank" rel="noopener noreferrer"><FiEye size={11} className="hover:text-purple cursor-pointer" /></a>}
            {r.drive_web_content_link && <a href={r.drive_web_content_link} target="_blank" rel="noopener noreferrer"><FiDownload size={11} className="hover:text-purple cursor-pointer" /></a>}
            <button onClick={onEdit}><FiEdit2 size={11} className="hover:text-purple cursor-pointer" /></button>
            <button onClick={onDelete}><FiTrash2 size={11} className="hover:text-red-400 cursor-pointer" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AICoachDashboard() {
  const { user } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState({ resourceDriveFolderLink: '' });
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [linkSaved, setLinkSaved] = useState(false);
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [catModal, setCatModal] = useState({ open: false, editData: null });
  const [uploadModal, setUploadModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, resource: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, id: null, title: '', message: '' });

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('google_access_token');
      if (storedToken) setGoogleAccessToken(storedToken);
      const tokenStr = localStorage.getItem('token');
      if (!tokenStr) return;
      try {
        const profileRes = await fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${tokenStr}` } });
        const profileData = await profileRes.json();
        if (profileData.resource_drive_folder_link) setUserProfile(prev => ({ ...prev, resourceDriveFolderLink: profileData.resource_drive_folder_link }));
        const gRes = await fetch('/api/auth/google-token', { headers: { Authorization: `Bearer ${tokenStr}` } });
        const gData = await gRes.json();
        if (gData.access_token) { setGoogleAccessToken(gData.access_token); localStorage.setItem('google_access_token', gData.access_token); }
      } catch (e) { console.error(e); }
    };
    init();
    initGoogleDriveApi(token => setGoogleAccessToken(token), e => console.error(e));
  }, [user]);

  const loadCategories = async () => {
    try { const res = await axios.get('/api/resources/categories'); setCategories(res.data); } catch (e) { console.error(e); }
  };

  const loadResources = async (catId = selectedCategory, query = searchQuery) => {
    setLoadingResources(true);
    try {
      const params = {};
      if (catId && catId !== 'all') params.category_id = catId;
      if (query) params.search = query;
      const res = await axios.get('/api/resources', { params });
      setResources(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingResources(false); }
  };

  useEffect(() => { loadCategories(); loadResources(); }, []);
  useEffect(() => { loadResources(selectedCategory, searchQuery); }, [selectedCategory, searchQuery]);

  const saveFolderLink = async (link) => {
    const val = link !== undefined ? link : userProfile.resourceDriveFolderLink;
    if (!val) return;
    if (link !== undefined) setUserProfile(p => ({ ...p, resourceDriveFolderLink: val }));
    const tokenStr = localStorage.getItem('token');
    if (tokenStr) await fetch('/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenStr}` }, body: JSON.stringify({ resource_drive_folder_link: val }) });
    setLinkSaved(true);
    setTimeout(() => setLinkSaved(false), 3000);
  };

  const handleCreateCategory = async (data) => { await axios.post('/api/resources/categories', data); await loadCategories(); };
  const handleUpdateCategory = async (data) => { await axios.put(`/api/resources/categories/${catModal.editData.id}`, data); await loadCategories(); };
  const handleDeleteCategory = async (id) => { await axios.delete(`/api/resources/categories/${id}`); await loadCategories(); if (selectedCategory === id) setSelectedCategory('all'); setConfirmModal({ open: false }); };
  const handleCreateResource = async (data) => { await axios.post('/api/resources', data); await loadResources(); await loadCategories(); };
  const handleUpdateResource = async (id, data) => { await axios.put(`/api/resources/${id}`, data); await loadResources(); await loadCategories(); };
  const handleDeleteResource = async (id) => { await axios.delete(`/api/resources/${id}`); await loadResources(); await loadCategories(); setConfirmModal({ open: false }); };
  const handleTogglePin = async (resource) => { await axios.put(`/api/resources/${resource.id}`, { is_pinned: !resource.is_pinned }); await loadResources(); };

  const pinnedResources = resources.filter(r => r.is_pinned);
  const allTabs = [
    { id: 'all', label: 'All Resources', icon: '🗂️', count: null },
    ...categories.map(c => ({ id: c.id, label: c.name, icon: c.icon, count: c.resource_count, color: c.color })),
    { id: 'uncategorized', label: 'Uncategorized', icon: '📄', count: null }
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Drive Banner */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-purple">
        <div>
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2"><FiFolder className="text-purple" /> Resource Drive Integration</h3>
          <p className="text-[11px] text-text-muted mt-0.5">Connect a Google Drive folder to store and access your files.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="text" placeholder="Paste Drive folder URL..." value={userProfile.resourceDriveFolderLink || ''}
              onChange={e => setUserProfile({ ...userProfile, resourceDriveFolderLink: e.target.value })}
              className="w-full sm:w-64 px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple" />
            <button onClick={() => saveFolderLink()}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${linkSaved ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-surface-elevated text-text-primary hover:bg-surface border border-border-subtle'}`}>
              {linkSaved ? <><FiCheck size={12} /> Saved</> : 'Save'}
            </button>
          </div>
          <button onClick={requestGoogleDriveAccess}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap w-full sm:w-auto ${googleAccessToken ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-[#4285F4] hover:bg-[#357ae8] text-white'}`}>
            {googleAccessToken ? <><FiCheck size={12} /> Google Connected</> : 'Connect Google'}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center"><FiDatabase size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Resource Library</h1>
            <p className="text-xs text-text-muted">{resources.length} resources · {categories.length} categories</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input type="text" placeholder="Search resources..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-surface-elevated text-xs text-text-primary placeholder-text-muted border border-border-subtle focus:border-purple focus:outline-none w-full sm:w-56" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => setCatModal({ open: true, editData: null })}
              className="flex-1 sm:flex-none justify-center px-4 py-2 text-xs font-bold rounded-xl border border-purple/40 text-purple hover:bg-purple/10 flex items-center gap-1.5 transition-all">
              <FiPlus size={14} /> New Category
            </button>
            <button onClick={() => setUploadModal(true)}
              className="flex-1 sm:flex-none justify-center px-4 py-2 text-xs font-bold rounded-xl bg-purple text-white hover:bg-purple/80 flex items-center gap-1.5 transition-all">
              <FiPlus size={14} /> Add Resource
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary">Browse by Category</h3>
          <span className="text-[11px] text-text-muted">{categories.length} custom {categories.length === 1 ? 'category' : 'categories'}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allTabs.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl border text-center transition-all flex items-center gap-2 text-xs font-semibold whitespace-nowrap ${selectedCategory === cat.id ? 'border-purple bg-purple/10 text-purple' : 'border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated text-text-muted'}`}>
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {cat.count !== null && cat.count !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px]">{cat.count}</span>
              )}
              {cat.id !== 'all' && cat.id !== 'uncategorized' && selectedCategory === cat.id && (
                <span className="flex items-center gap-1 ml-1 border-l border-purple/30 pl-1">
                  <button onClick={e => { e.stopPropagation(); setCatModal({ open: true, editData: categories.find(c => c.id === cat.id) }); }}
                    className="hover:text-white"><FiEdit2 size={10} /></button>
                  <button onClick={e => { e.stopPropagation(); setConfirmModal({ open: true, type: 'category', id: cat.id, title: 'Delete Category?', message: 'Resources will become uncategorized.' }); }}
                    className="hover:text-red-400"><FiTrash2 size={10} /></button>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned */}
      {pinnedResources.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5"><FiStar size={13} className="text-yellow-400 fill-yellow-400" /> Pinned Resources</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pinnedResources.map(r => (
              <ResourceCard key={r.id} resource={r}
                onEdit={() => setEditModal({ open: true, resource: r })}
                onDelete={() => setConfirmModal({ open: true, type: 'resource', id: r.id, title: 'Delete Resource?', message: `"${r.name}" will be permanently removed.` })}
                onTogglePin={() => handleTogglePin(r)} />
            ))}
          </div>
        </div>
      )}

      {/* Library */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex flex-wrap gap-2 items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary break-all">
            {allTabs.find(t => t.id === selectedCategory)?.label || 'All Resources'}
            <span className="ml-2 text-[11px] text-text-muted font-normal whitespace-nowrap">({resources.length})</span>
          </h3>
          <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden shrink-0">
            <button onClick={() => setViewMode('table')} className={`px-2 py-1.5 transition-all ${viewMode === 'table' ? 'bg-purple text-white' : 'text-text-muted hover:text-text-primary'}`}><FiList size={13} /></button>
            <button onClick={() => setViewMode('grid')} className={`px-2 py-1.5 transition-all ${viewMode === 'grid' ? 'bg-purple text-white' : 'text-text-muted hover:text-text-primary'}`}><FiGrid size={13} /></button>
          </div>
        </div>

        {loadingResources ? (
          <div className="py-16 text-center text-text-muted text-xs">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="text-4xl">📚</div>
            <p className="text-sm font-bold text-text-primary">No resources yet</p>
            <p className="text-xs text-text-muted">Add your first resource to get started</p>
            <button onClick={() => setUploadModal(true)} className="mx-auto px-4 py-2 rounded-xl bg-purple text-white font-bold text-xs flex items-center gap-1.5">
              <FiPlus size={14} /> Add Resource
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-elevated/50 text-[10px] text-text-muted uppercase tracking-wider">
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Tags</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Added</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {resources.map(row => (
                  <tr key={row.id} className="hover:bg-surface-elevated/40 group">
                    <td className="py-3 px-4 font-bold text-text-primary">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple/10 text-purple flex items-center justify-center text-sm">{getFileIcon(row.mime_type)}</div>
                        <div>
                          <a href={row.drive_web_view_link || row.drive_web_content_link || '#'} target="_blank" rel="noopener noreferrer"
                            className="leading-tight hover:text-purple transition-colors truncate max-w-[200px] block">
                            {row.name} {row.is_pinned && <FiStar size={10} className="inline ml-1 text-yellow-400 fill-yellow-400" />}
                          </a>
                          {row.description && <p className="text-[10px] text-text-muted truncate max-w-[200px]">{row.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {row.category ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: row.category.color + '22', color: row.category.color }}>
                          {row.category.icon} {row.category.name}
                        </span>
                      ) : <span className="text-[10px] text-text-muted">—</span>}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {(row.tags || []).slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-surface-elevated text-[9px] text-text-secondary border border-border-subtle">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-text-muted">{formatSize(row.file_size)}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-text-muted">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleTogglePin(row)} title={row.is_pinned ? 'Unpin' : 'Pin'}>
                          <FiStar size={13} className={`cursor-pointer hover:text-yellow-400 ${row.is_pinned ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                        </button>
                        {row.drive_web_view_link && <a href={row.drive_web_view_link} target="_blank" rel="noopener noreferrer" title="View online"><FiEye size={13} className="hover:text-purple cursor-pointer" /></a>}
                        {row.drive_web_content_link && <a href={row.drive_web_content_link} target="_blank" rel="noopener noreferrer" title="Download"><FiDownload size={13} className="hover:text-purple cursor-pointer" /></a>}
                        <button onClick={() => setEditModal({ open: true, resource: row })}><FiEdit2 size={13} className="hover:text-purple cursor-pointer" /></button>
                        <button onClick={() => setConfirmModal({ open: true, type: 'resource', id: row.id, title: 'Delete Resource?', message: `"${row.name}" will be permanently removed.` })}><FiTrash2 size={13} className="hover:text-red-400 cursor-pointer" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {resources.map(r => (
              <ResourceCard key={r.id} resource={r}
                onEdit={() => setEditModal({ open: true, resource: r })}
                onDelete={() => setConfirmModal({ open: true, type: 'resource', id: r.id, title: 'Delete Resource?', message: `"${r.name}" will be permanently removed.` })}
                onTogglePin={() => handleTogglePin(r)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {catModal.open && <CategoryModal isOpen={catModal.open} onClose={() => setCatModal({ open: false, editData: null })} onSave={catModal.editData ? handleUpdateCategory : handleCreateCategory} editData={catModal.editData} />}
        {uploadModal && <UploadResourceModal isOpen={uploadModal} onClose={() => setUploadModal(false)} categories={categories} googleAccessToken={googleAccessToken} userProfile={userProfile} onSave={handleCreateResource} requestGoogleAccess={requestGoogleDriveAccess} onSaveFolderLink={saveFolderLink} />}
        {editModal.open && <EditResourceModal isOpen={editModal.open} onClose={() => setEditModal({ open: false, resource: null })} resource={editModal.resource} categories={categories} onSave={handleUpdateResource} />}
        {confirmModal.open && <ConfirmModal isOpen={confirmModal.open} onClose={() => setConfirmModal({ open: false })} title={confirmModal.title} message={confirmModal.message}
          onConfirm={() => { if (confirmModal.type === 'category') handleDeleteCategory(confirmModal.id); else handleDeleteResource(confirmModal.id); }} />}
      </AnimatePresence>
    </div>
  );
}
