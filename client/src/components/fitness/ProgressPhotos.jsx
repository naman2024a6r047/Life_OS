import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiClock, FiChevronRight, FiTrendingUp, FiCalendar, FiUploadCloud, FiPlus, FiAward, FiX } from 'react-icons/fi';
import { extractFolderId, uploadPhotoToDrive, fetchPhotosFromDrive } from '../../utils/googleDriveApi';
import DriveImage from './DriveImage';

export default function ProgressPhotos({ googleAccessToken, googleDriveFolderLink }) {
  const [photoHistory, setPhotoHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [imageName, setImageName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [latestPhotos, setLatestPhotos] = useState([null, null, null, null]);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [oldestDate, setOldestDate] = useState(new Date().toISOString());

  const loadPhotoHistory = async () => {
    if (!googleAccessToken) {
      alert("Please sign in to Google Drive in the Settings tab first.");
      return;
    }
    const folderId = extractFolderId(googleDriveFolderLink);
    if (!folderId) {
      alert("Please paste a valid Google Drive Folder Link in the Settings tab first.");
      return;
    }

    setIsLoadingHistory(true);
    try {
      const files = await fetchPhotosFromDrive(folderId, googleAccessToken);
      
      const grouped = {};
      files.forEach(file => {
        let dateStr = file.createdTime.split('T')[0];
        let viewName = 'Unknown';
        
        const match = file.name.match(/^([a-z]+)_(\d{4}-\d{2}-\d{2})/i);
        if (match) {
          viewName = match[1];
          dateStr = match[2];
        } else if (file.name.includes('_')) {
          viewName = file.name.split('_')[0];
        }

        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push({ ...file, viewName });
      });

      const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
      setPhotoHistory(sortedDates.map(date => ({ date, photos: grouped[date] })));
      setTotalPhotos(files.length);
      if (sortedDates.length > 0) {
        setOldestDate(sortedDates[sortedDates.length - 1]);
        
        // Extract the latest 4 photos for the main view
        const latest = [null, null, null, null];
        const views = ['front', 'right', 'back', 'left'];
        let filled = 0;
        
        for (const date of sortedDates) {
          for (const photo of grouped[date]) {
            const vIndex = views.indexOf(photo.viewName.toLowerCase());
            if (vIndex !== -1 && !latest[vIndex]) {
              latest[vIndex] = photo;
              filled++;
            }
          }
          if (filled === 4) break;
        }
        setLatestPhotos(latest);
      }
    } catch (err) {
      console.error('Failed to load photo history', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (googleAccessToken && googleDriveFolderLink) {
      loadPhotoHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleAccessToken, googleDriveFolderLink]);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const executeUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setIsUploading(true);
    try {
      const folderId = extractFolderId(googleDriveFolderLink);
      
      if (!googleAccessToken) {
        alert("Please sign in to Google Drive in the Settings tab to save your photos online!");
      } else if (!folderId) {
        alert("Please paste a valid Google Drive Folder Link in the Settings tab!");
      } else {
        const dateStr = new Date().toISOString().split('T')[0];
        const ext = selectedFile.name.split('.').pop() || 'jpg';
        const finalName = imageName.trim() !== '' ? `${imageName}_${dateStr}.${ext}` : `front_${dateStr}.${ext}`;
        
        await uploadPhotoToDrive(selectedFile, folderId, googleAccessToken, finalName);
        setUploadModalOpen(false);
        setImageName('');
        setSelectedFile(null);
        // Reload history to show the new photo
        loadPhotoHistory();
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload photo to Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card p-6 bg-[#0B0C15] border border-border-subtle rounded-3xl mt-6 lg:col-span-12">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple/10 flex items-center justify-center border border-purple/20 text-purple">
            <FiCamera size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Progress Photos</h3>
            <p className="text-sm text-text-muted">Track your transformation over time</p>
          </div>
        </div>
        <button 
          onClick={() => { setHistoryModalOpen(true); loadPhotoHistory(); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#141520] border border-purple/30 rounded-xl text-sm font-bold text-purple hover:bg-purple/10 transition-colors"
        >
          <FiClock size={16} /> Previous Photos <FiChevronRight size={16} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['Front', 'Right', 'Back', 'Left'].map((label, idx) => (
          <div 
            key={idx} 
            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1A1C29] border border-border-subtle flex flex-col items-center justify-center group"
          >
            {latestPhotos[idx] ? (
              <DriveImage 
                fileId={latestPhotos[idx].id} 
                thumbnailLink={latestPhotos[idx].thumbnailLink} 
                accessToken={googleAccessToken} 
                alt={label} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="text-text-muted/30 mb-4 group-hover:text-purple/40 transition-colors">
                <FiCamera size={48} />
              </div>
            )}
            
            {idx === 0 && latestPhotos[idx] && (
              <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-purple/20 border border-purple/50 text-purple flex items-center justify-center backdrop-blur-md">
                <FiAward size={16} />
              </div>
            )}
            
            <div className="absolute bottom-0 w-full bg-[#141520]/90 backdrop-blur-md py-3 text-center border-t border-border-subtle">
              <span className="block text-sm font-bold text-white mb-1">{label}</span>
              <span className="block text-[11px] text-text-muted">{latestPhotos[idx] ? 'Recent' : 'No Photo'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 py-6 border border-border-subtle rounded-2xl mb-6 bg-[#141520]">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 border-r border-border-subtle px-4 text-center sm:text-left">
          <FiTrendingUp className="text-purple" size={24} />
          <div>
            <p className="text-xs text-text-muted mb-1">Total Photos</p>
            <p className="text-lg font-bold text-white">{totalPhotos}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 border-r border-border-subtle px-4 text-center sm:text-left">
          <FiCalendar className="text-info" size={24} />
          <div>
            <p className="text-xs text-text-muted mb-1">Since</p>
            <p className="text-lg font-bold text-white">
              {totalPhotos > 0 ? new Date(oldestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 text-center sm:text-left">
          <FiTrendingUp className="text-success" size={24} />
          <div>
            <p className="text-xs text-text-muted mb-1">Progress</p>
            <p className="text-lg font-bold text-success">{totalPhotos > 0 ? '+18%' : '0%'}</p>
          </div>
        </div>
      </div>

      {/* Upload Drag/Drop Box */}
      <div 
        onClick={() => setUploadModalOpen(true)}
        className="border border-dashed border-purple/30 rounded-2xl py-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-purple/5 transition-colors mb-4 bg-[#141520]"
      >
        <FiUploadCloud size={40} className="text-purple mb-4" />
        <p className="text-base font-bold text-purple mb-2">Upload New Photos</p>
        <p className="text-xs text-text-muted">PNG, JPG up to 10MB</p>
      </div>

      <button 
        onClick={() => setUploadModalOpen(true)}
        className="w-full py-4 rounded-xl bg-purple text-white font-bold hover:bg-purple-accent transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple/20"
      >
        <FiPlus size={18} /> Add New Photos
      </button>

      {/* History Modal */}
      <AnimatePresence>
        {historyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card p-6 md:p-8 max-w-4xl w-full max-h-[90vh] flex flex-col bg-[#0B0C15] border border-border-subtle rounded-3xl">
              <div className="flex items-center justify-between border-b border-border-subtle pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center border border-purple/20 text-purple">
                    <FiClock size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Previous Photos</h3>
                    <p className="text-sm text-text-muted">All your progress photos organized by date</p>
                  </div>
                </div>
                <button onClick={() => setHistoryModalOpen(false)} className="w-10 h-10 rounded-full bg-[#1A1C29] flex items-center justify-center text-text-muted hover:text-white transition-colors">
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                {isLoadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                    <div className="w-10 h-10 border-4 border-purple border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-bold">Loading from Google Drive...</p>
                  </div>
                ) : photoHistory.length === 0 ? (
                  <div className="text-center py-20 text-text-muted">
                    <FiCamera size={64} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-bold">No history found</p>
                    <p className="text-sm mt-2">Upload some photos to see them here.</p>
                  </div>
                ) : (
                  photoHistory.map((group, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <FiCalendar className="text-text-muted" size={16} />
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          {new Date(group.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} 
                          <span className="text-text-muted font-normal ml-3 text-xs">({group.photos.length} Photos)</span>
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {group.photos.map((photo, pIdx) => (
                          <a key={pIdx} href={photo.webContentLink || photo.webViewLink} target="_blank" rel="noreferrer" className="block relative aspect-[4/3] rounded-xl overflow-hidden bg-[#1A1C29] border border-border-subtle group hover:border-purple/50 transition-colors">
                            <DriveImage 
                              fileId={photo.id} 
                              thumbnailLink={photo.thumbnailLink} 
                              accessToken={googleAccessToken} 
                              alt={photo.name} 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur text-center py-1 group-hover:bg-purple/80 transition-colors">
                              <p className="text-[10px] text-white font-bold uppercase">{photo.viewName}</p>
                            </div>
                          </a>
                        ))}
                        <div className="block relative aspect-[4/3] rounded-xl bg-[#141520] border border-border-subtle flex flex-col items-center justify-center text-purple cursor-pointer hover:bg-purple/5 transition-colors">
                           <span className="text-sm font-bold mb-1">View All</span>
                           <FiChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 flex justify-center">
                <button className="flex items-center gap-2 px-6 py-3 bg-[#141520] border border-purple/30 rounded-xl text-sm font-bold text-purple hover:bg-purple/10 transition-colors">
                  <FiCalendar size={16} /> View All Photos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card p-6 md:p-8 max-w-2xl w-full flex flex-col bg-[#0B0C15] border border-border-subtle rounded-3xl">
              <div className="flex items-center justify-between border-b border-border-subtle pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center border border-purple/20 text-purple">
                    <FiUploadCloud size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Upload New Photos</h3>
                    <p className="text-sm text-text-muted">Add new progress photos to track your transformation</p>
                  </div>
                </div>
                <button onClick={() => setUploadModalOpen(false)} className="w-10 h-10 rounded-full bg-[#1A1C29] flex items-center justify-center text-text-muted hover:text-white transition-colors">
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Image Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter image name (e.g. front, right, back, left)" 
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    className="w-full bg-[#141520] border border-purple/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple/50"
                  />
                  <p className="text-xs text-text-muted mt-2">Give your photos a name to help you identify them later.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                      <FiCalendar size={18} />
                    </div>
                    <input 
                      type="text" 
                      readOnly
                      value={new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      className="w-full bg-[#141520] border border-border-subtle rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none"
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      <span className="text-xs font-bold text-purple bg-purple/10 px-3 py-1 rounded-lg">Today</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-2">Date is set automatically to today.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Upload Photos</label>
                  <label className="border border-dashed border-purple/30 rounded-2xl py-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-purple/5 transition-colors bg-[#141520] relative">
                    <FiUploadCloud size={40} className={selectedFile ? "text-success mb-4" : "text-purple mb-4"} />
                    <p className="text-base text-white mb-2">
                      {selectedFile ? selectedFile.name : "Drag and drop your photos here"}
                      {!selectedFile && <br/>}
                      {!selectedFile && "or click to browse"}
                    </p>
                    <p className="text-sm text-text-muted">{selectedFile ? 'Ready to upload' : 'PNG, JPG up to 10MB each'}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <button 
                  onClick={executeUpload}
                  disabled={isUploading || !selectedFile || imageName.trim() === ''}
                  className={`w-full py-4 rounded-xl bg-purple text-white font-bold transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-purple/20 ${isUploading || !selectedFile || imageName.trim() === '' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-accent'}`}
                >
                  <FiUploadCloud size={20} /> {isUploading ? 'Uploading...' : 'Upload Photos'}
                </button>
                <p className="text-center text-xs text-text-muted flex items-center justify-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Your photos are private and secure
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
