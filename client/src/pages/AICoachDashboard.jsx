import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDatabase, FiSearch, FiPlus, FiBookmark, FiDownload, FiUpload,
  FiFileText, FiVideo, FiBook, FiGlobe, FiFolder, FiMoreVertical,
  FiArrowRight, FiGrid, FiList, FiChevronDown, FiZap, FiCheck, FiX, FiUploadCloud
} from 'react-icons/fi';
import { initGoogleDriveApi, requestGoogleDriveAccess, extractFolderId, fetchFilesFromDrive, uploadPhotoToDrive as uploadFileToDrive } from '../utils/googleDriveApi';

export default function AICoachDashboard() {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Google Drive State
  const [userProfile, setUserProfile] = useState({ resourceDriveFolderLink: '' });
  const [linkSaved, setLinkSaved] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  
  // Files State
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize and Fetch Token
  useEffect(() => {
    if (user && user.resource_drive_folder_link && !userProfile.resourceDriveFolderLink) {
      setUserProfile(prev => ({ ...prev, resourceDriveFolderLink: user.resource_drive_folder_link }));
    }

    const fetchToken = async () => {
      try {
        const tokenStr = localStorage.getItem('token');
        if (!tokenStr) return;
        
        const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${tokenStr}` }
        });
        const profileData = await profileRes.json();
        if (profileData.resource_drive_folder_link) {
            setUserProfile(prev => ({ ...prev, resourceDriveFolderLink: profileData.resource_drive_folder_link }));
        }

        const res = await fetch('http://localhost:5000/api/auth/google-token', {
          headers: { 'Authorization': `Bearer ${tokenStr}` }
        });
        const data = await res.json();
        if (data.access_token) {
          setGoogleAccessToken(data.access_token);
        }
      } catch (err) {
        console.error("Failed to fetch google token automatically", err);
      }
    };
    fetchToken();

    initGoogleDriveApi(
      (token) => setGoogleAccessToken(token),
      (error) => console.error("Google Drive Auth Error:", error)
    );
  }, [user]);

  // Load files when we have token and folder link
  useEffect(() => {
      const loadFiles = async () => {
          if (!googleAccessToken || !userProfile.resourceDriveFolderLink) return;
          const folderId = extractFolderId(userProfile.resourceDriveFolderLink);
          if (!folderId) return;

          setIsLoadingFiles(true);
          try {
              const fetchedFiles = await fetchFilesFromDrive(folderId, googleAccessToken);
              setFiles(fetchedFiles);
          } catch(err) {
              console.error("Error fetching files:", err);
          } finally {
              setIsLoadingFiles(false);
          }
      }
      loadFiles();
  }, [googleAccessToken, userProfile.resourceDriveFolderLink]);

  const saveFolderLink = async () => {
      setLinkSaved(true);
      const tokenStr = localStorage.getItem('token');
      if(tokenStr) {
        fetch('http://localhost:5000/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenStr}` },
          body: JSON.stringify({ resource_drive_folder_link: userProfile.resourceDriveFolderLink })
        }).catch(console.error);
      }
      setTimeout(() => setLinkSaved(false), 3000);
  };

  const handleUpload = async () => {
      if (!selectedFile || !googleAccessToken || !userProfile.resourceDriveFolderLink) return;
      
      const folderId = extractFolderId(userProfile.resourceDriveFolderLink);
      if (!folderId) return;

      setIsUploading(true);
      try {
          await uploadFileToDrive(selectedFile, folderId, googleAccessToken);
          // Refresh list
          const fetchedFiles = await fetchFilesFromDrive(folderId, googleAccessToken);
          setFiles(fetchedFiles);
          setIsUploadModalOpen(false);
          setSelectedFile(null);
      } catch(err) {
          console.error("Upload failed", err);
      } finally {
          setIsUploading(false);
      }
  };

  const categories = [
    { id: 'all', label: 'All Resources', icon: '🗂️' },
    { id: 'materials', label: 'Study Materials', icon: '📖' },
    { id: 'papers', label: 'Practice Papers', icon: '📝' },
    { id: 'cheatsheets', label: 'Cheat Sheets', icon: '📄' },
    { id: 'videos', label: 'Videos', icon: '🎥' },
    { id: 'books', label: 'Books', icon: '📚' },
    { id: 'tools', label: 'Tools & Websites', icon: '🌐' },
  ];

  const getFileIcon = (mimeType) => {
      if (!mimeType) return '📄';
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('video')) return '🎥';
      if (mimeType.includes('image')) return '🖼️';
      if (mimeType.includes('audio')) return '🎵';
      if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return '📊';
      return '📄';
  };

  const getFormatSize = (bytes) => {
      if (!bytes) return '-';
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      if (bytes == 0) return '0 B';
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const featured = filteredFiles.slice(0, 4); // Just take first 4 as featured

  return (
    <div className="p-6 space-y-5">
      
      {/* Drive Settings Banner */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-purple">
          <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <FiFolder className="text-purple" /> Resource Drive Integration
              </h3>
              <p className="text-[11px] text-text-muted mt-1 max-w-lg">
                  Connect a Google Drive folder to store and access your learning resources, study materials, and cheat sheets directly from this dashboard.
              </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex flex-col gap-1 w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Paste Google Drive Folder URL..." 
                  className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple"
                  value={userProfile.resourceDriveFolderLink || ''}
                  onChange={(e) => {
                    setUserProfile({...userProfile, resourceDriveFolderLink: e.target.value});
                  }}
                />
              </div>
              <button 
                onClick={saveFolderLink} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${linkSaved ? 'bg-success/10 text-success border border-success/30' : 'bg-surface-elevated text-text-primary hover:bg-surface border border-border-subtle'}`}
              >
                {linkSaved ? <><FiCheck /> Saved</> : 'Save Link'}
              </button>
              <button onClick={requestGoogleDriveAccess} className="px-4 py-2 bg-[#4285F4] hover:bg-[#357ae8] text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
                <span>{googleAccessToken ? 'Signed in to Google' : 'Sign in with Google'}</span>
              </button>
          </div>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
            <FiDatabase size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Resources</h1>
            <p className="text-xs text-text-muted">Your ultimate study hub. Curated materials to help you learn better.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-12 py-2 rounded-xl bg-surface-elevated text-xs text-text-primary placeholder-text-muted border border-border-subtle focus:border-purple focus:outline-none w-64"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-text-muted bg-white/5 px-1.5 py-0.5 rounded border border-border-subtle">
              Ctrl + K
            </span>
          </div>
          <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary text-xs bg-purple hover:bg-purple/80 flex items-center gap-1.5">
            <FiPlus size={16} /> Add Resource
          </button>
        </div>
      </div>

      {/* Browse by Category */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary">Browse by Category</h3>
          <button className="text-xs font-semibold text-purple hover:underline flex items-center gap-1">
            View All Categories <FiArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
                selectedCategory === cat.id ? 'border-purple bg-purple/10' : 'border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated'
              }`}
            >
              <span className="text-lg block mb-1">{cat.icon}</span>
              <p className="text-[11px] font-bold text-text-primary truncate">{cat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left 9 Columns — Featured & Library */}
        <div className="col-span-9 space-y-5">
          {/* Featured Resources (4 Cards) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary">Featured Resources</h3>
              <span className="section-link">View All</span>
            </div>
            {featured.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                {featured.map((f, i) => (
                    <div key={i} className="card overflow-hidden hover:border-purple/40 transition-all flex flex-col justify-between">
                    <div className={`p-4 bg-gradient-to-br from-primary/20 to-purple/20 flex flex-col items-center justify-center text-center h-28 relative`}>
                        <span className="text-3xl mb-1">{getFileIcon(f.mimeType)}</span>
                        <h4 className="text-xs font-extrabold text-white truncate w-full px-2">{f.name}</h4>
                    </div>
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                        <p className="text-[11px] font-bold text-text-primary truncate">{f.name}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[9px] text-text-muted font-mono">
                        <span>{getFormatSize(f.size)}</span>
                        <a href={f.webContentLink} target="_blank" rel="noopener noreferrer">
                            <FiDownload className="hover:text-purple cursor-pointer" size={13} />
                        </a>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="p-8 text-center bg-surface-elevated rounded-xl border border-border-subtle">
                    <p className="text-text-muted text-xs">No resources uploaded yet.</p>
                </div>
            )}
          </div>

          {/* Resource Library Table */}
          <div className="card overflow-hidden space-y-3">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">Resource Library</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted cursor-pointer hover:text-text-primary flex items-center gap-1">
                  All Types <FiChevronDown size={12} />
                </span>
                <span className="text-xs text-text-muted cursor-pointer hover:text-text-primary flex items-center gap-1">
                  Latest <FiChevronDown size={12} />
                </span>
                <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden">
                  <button className="px-2 py-1 bg-purple text-white"><FiList size={13} /></button>
                  <button className="px-2 py-1 text-text-muted hover:text-text-primary"><FiGrid size={13} /></button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-elevated/50 text-[10px] text-text-muted uppercase tracking-wider">
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Added On</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {isLoadingFiles ? (
                      <tr><td colSpan="5" className="py-8 text-center text-text-muted">Loading files from Google Drive...</td></tr>
                  ) : filteredFiles.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-text-muted">No files found. Add some resources!</td></tr>
                  ) : filteredFiles.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-elevated/40">
                      <td className="py-3 px-4 font-bold text-text-primary flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple/10 text-purple flex items-center justify-center text-xs">
                          {getFileIcon(row.mimeType)}
                        </div>
                        <div>
                          <a href={row.webContentLink} target="_blank" rel="noopener noreferrer" className="leading-tight hover:text-purple transition-colors truncate max-w-[200px] block">
                              {row.name}
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-surface-elevated text-text-secondary border border-border-subtle truncate max-w-[120px] inline-block">
                          {row.mimeType?.split('/')[1] || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-text-muted">{getFormatSize(row.size)}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-text-muted">{new Date(row.createdTime).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-text-muted">
                          <a href={row.webContentLink} target="_blank" rel="noopener noreferrer">
                              <FiDownload className="hover:text-purple cursor-pointer" size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border-subtle text-center">
              <button className="text-xs font-semibold text-purple hover:underline flex items-center justify-center gap-1 mx-auto">
                View More Resources <FiChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right 3 Columns — Stats & Contribute */}
        <div className="col-span-3 space-y-4">
          {/* My Resources Stats */}
          <div className="card p-4 space-y-3">
            <div className="section-header">
              <h3 className="section-title">Drive Storage</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated">
                <span className="flex items-center gap-2 text-text-secondary"><FiDatabase className="text-purple" /> Total Files</span>
                <span className="font-bold font-mono text-text-primary">{files.length}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated">
                <span className="flex items-center gap-2 text-text-secondary"><FiUpload className="text-warning" /> Uploaded</span>
                <span className="font-bold font-mono text-text-primary">{files.length}</span>
              </div>
            </div>
          </div>

          {/* Contribute & Earn Card */}
          <div className="card p-5 text-center space-y-3 bg-gradient-to-br from-primary/30 to-purple/30 border-purple/40">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-2xl shadow-glow-primary">
              🚀
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Upload & Access</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                Store all your study materials here and access them from anywhere.
              </p>
            </div>
            <button onClick={() => setIsUploadModalOpen(true)} className="w-full py-2.5 rounded-xl bg-white text-primary font-bold text-xs hover:bg-slate-100 transition-all shadow-lg">
              Upload Resource
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
              >
                <FiX size={20} />
              </button>

              <h2 className="text-lg font-bold text-text-primary mb-1">Upload Resource</h2>
              <p className="text-xs text-text-muted mb-5">Select a file to save to your Google Drive.</p>

              {/* Step-by-step setup checklist */}
              {(!googleAccessToken || !userProfile.resourceDriveFolderLink) && (
                <div className="space-y-2 mb-5">
                  <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Setup Required</p>
                  
                  {/* Step 1: Folder Link */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                    userProfile.resourceDriveFolderLink 
                      ? 'border-success/30 bg-success/5' 
                      : 'border-border-subtle bg-surface-elevated'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      userProfile.resourceDriveFolderLink ? 'bg-success text-white' : 'bg-surface border border-border-subtle text-text-muted'
                    }`}>
                      {userProfile.resourceDriveFolderLink ? <FiCheck size={12} /> : '1'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${
                        userProfile.resourceDriveFolderLink ? 'text-success' : 'text-text-primary'
                      }`}>Paste Google Drive Folder Link</p>
                      {!userProfile.resourceDriveFolderLink && (
                        <input
                          type="text"
                          placeholder="https://drive.google.com/drive/folders/..."
                          value={userProfile.resourceDriveFolderLink || ''}
                          onChange={(e) => setUserProfile({...userProfile, resourceDriveFolderLink: e.target.value})}
                          onBlur={saveFolderLink}
                          className="mt-1.5 w-full px-2 py-1.5 text-[11px] bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple"
                        />
                      )}
                    </div>
                  </div>

                  {/* Step 2: Sign in to Google */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                    googleAccessToken 
                      ? 'border-success/30 bg-success/5' 
                      : 'border-border-subtle bg-surface-elevated'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      googleAccessToken ? 'bg-success text-white' : 'bg-surface border border-border-subtle text-text-muted'
                    }`}>
                      {googleAccessToken ? <FiCheck size={12} /> : '2'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${
                        googleAccessToken ? 'text-success' : 'text-text-primary'
                      }`}>
                        {googleAccessToken ? 'Signed in to Google ✓' : 'Sign in with Google'}
                      </p>
                      {!googleAccessToken && (
                        <button
                          onClick={requestGoogleDriveAccess}
                          className="mt-1.5 px-3 py-1.5 bg-[#4285F4] hover:bg-[#357ae8] text-white text-[11px] font-bold rounded-lg flex items-center gap-2 transition-colors"
                        >
                          Sign in with Google
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload — shown only when both steps are done */}
              {googleAccessToken && userProfile.resourceDriveFolderLink && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border-subtle rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-elevated/50 transition-colors">
                    <FiUploadCloud size={32} className="text-purple mb-3" />
                    <p className="text-xs text-text-muted mb-3">Click to select a file</p>
                    <input 
                        type="file" 
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="text-xs text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple/10 file:text-purple hover:file:bg-purple/20"
                    />
                    {selectedFile && (
                        <p className="text-[11px] text-text-muted font-mono mt-3">📄 {selectedFile.name}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="w-full btn-primary bg-purple hover:bg-purple/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? 'Uploading...' : 'Upload to Drive'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
