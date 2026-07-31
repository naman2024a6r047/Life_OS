import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiCheckCircle, FiXCircle, FiStar, FiSearch, FiFilter,
  FiExternalLink, FiClock, FiShield, FiZap, FiAward, FiAlertCircle,
  FiInfo, FiChevronRight, FiHeart, FiCheck, FiThumbsUp, FiMessageSquare,
  FiCheckSquare
} from 'react-icons/fi';

export default function ReviewDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('to-do');
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [reviewsToDo, setReviewsToDo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({
    understanding: 5,
    consistency: 5,
    quality: 5,
    overall: 5,
  });
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sidebarHistory, setSidebarHistory] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      const [historyRes, pendingRes] = await Promise.all([
        axios.get('/api/reviews/history'),
        axios.get('/api/reviews/pending')
      ]);
      setSidebarHistory(historyRes.data || []);
      setPendingCount((pendingRes.data || []).length);
    } catch (err) {
      console.error('Error fetching sidebar data:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      if (activeTab === 'to-do') endpoint = '/api/reviews/pending';
      else if (activeTab === 'my-reviews') endpoint = '/api/reviews/mine';
      else if (activeTab === 'history') endpoint = '/api/reviews/history';
      else {
        setReviewsToDo([]);
        return;
      }
      
      const res = await axios.get(endpoint);
      const data = res.data || [];
      setReviewsToDo(data);
      if (data.length > 0) setSelectedReviewId(data[0].id);
      else setSelectedReviewId(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const streak = user?.current_streak ?? 0;
  const totalXP = (user?.xp || 0) + ((user?.level || 1) - 1) * 100 || 1825;
  const level = user?.level || 13;

  const selectedReview = reviewsToDo.find(r => r.id === selectedReviewId) || reviewsToDo[0];

  const formattedHistory = sidebarHistory.map(r => ({
    title: r.Milestone?.title || 'Unknown Milestone',
    status: r.status === 'approved' ? 'Approved' : 'Needs Work',
    author: r.requester?.username || 'Unknown',
    time: new Date(r.createdAt).toLocaleDateString()
  }));

  const recentlyReviewed = formattedHistory.slice(0, 3);
  const reviewHistoryList = formattedHistory;

  const impactGiven = sidebarHistory.filter(r => new Date(r.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
  const impactLeveledUp = sidebarHistory.filter(r => r.status === 'approved').length;

  const handleStarClick = (category, rating) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const renderStars = (category, currentRating) => (
    <div className="flex gap-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map(star => (
        <FiStar
          key={star}
          size={14}
          onClick={() => handleStarClick(category, star)}
          className={star <= currentRating ? 'text-purple fill-purple' : 'text-text-muted'}
        />
      ))}
    </div>
  );

  const handleEvaluate = async (isApproved) => {
    if (!selectedReview) return;
    try {
      setSubmitting(true);
      await axios.post(`/api/reviews/evaluate/${selectedReview?.id}`, {
        is_approved: isApproved,
        rating_understanding: ratings.understanding,
        rating_consistency: ratings.consistency,
        rating_quality: ratings.quality,
        rating_overall: ratings.overall,
        comment: feedback
      });
      alert(`Milestone ${isApproved ? 'Approved' : 'Rejected'}!`);
      fetchReviews();
      fetchSidebarData();
      setFeedback('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
            <FiCheckCircle size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Peer Review</h1>
            <p className="text-xs text-text-muted">Get feedback. Improve. Level up together.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{streak}</p>
              <p className="text-[9px] text-text-muted">Day Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{totalXP}</p>
              <p className="text-[9px] text-text-muted">Total XP</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💎</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">Level {level}</p>
              <p className="text-[9px] text-text-muted">Pro Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🛡️</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">3</p>
              <p className="text-[9px] text-text-muted">Grace Tokens</p>
            </div>
          </div>
          <button className="btn-primary text-xs bg-purple hover:bg-purple/80 flex items-center gap-1.5">
            <FiInfo size={14} /> Review Guidelines
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'my-reviews', label: 'My Reviews' },
          { id: 'to-do', label: 'Reviews to Do', badge: pendingCount > 0 ? pendingCount : null },
          { id: 'history', label: 'Review History' },
          { id: 'friends', label: "Friends' Reviews" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === tab.id ? 'text-purple border-b-2 border-purple font-semibold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Reviews to Do Search & List */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-text-primary capitalize">{activeTab.replace('-', ' ')} ({reviewsToDo.length})</h3>
              <FiFilter className="text-text-muted text-xs cursor-pointer hover:text-text-primary" />
            </div>
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-elevated text-xs text-text-primary placeholder-text-muted border border-border-subtle focus:border-purple focus:outline-none"
              />
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {loading ? (
                <div className="text-center text-text-muted text-xs p-4">Loading requests...</div>
              ) : reviewsToDo.length === 0 ? (
                <div className="text-center text-text-muted text-xs p-4 border border-dashed border-border-subtle rounded-xl">No reviews found here.</div>
              ) : (
                reviewsToDo.map(r => {
                  const isSelected = r.id === selectedReviewId;
                  const authorName = r.requester?.username || 'Unknown User';
                  const title = r.Milestone?.title || 'Unknown Milestone';
                  const date = new Date(activeTab === 'history' ? r.updatedAt : r.createdAt).toLocaleDateString();
                  
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReviewId(r.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected ? 'border-purple bg-purple/10' : 'border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs flex-shrink-0 mt-0.5 ${r.status === 'approved' ? 'bg-success/10 text-success' : r.status === 'rejected' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                            {r.status === 'approved' ? '✓' : r.status === 'rejected' ? '✗' : '🎯'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary truncate">{title}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">
                              {activeTab === 'my-reviews' ? `Reviewer: ${r.reviewer?.username || '-'}` : `Friend: ${authorName}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                           <span className="text-[9px] text-text-muted font-medium block mb-1">{date}</span>
                           {activeTab !== 'to-do' && (
                             <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${r.status === 'approved' ? 'bg-success/20 text-success' : r.status === 'rejected' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                               {r.status}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recently Reviewed */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Recently Reviewed</h3>
              <span className="section-link">View All</span>
            </div>
            <div className="space-y-2.5">
              {recentlyReviewed.length === 0 ? (
                <div className="text-center text-text-muted text-[10px] py-4 border border-dashed border-border-subtle rounded-xl">No recent reviews</div>
              ) : (
                recentlyReviewed.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center text-xs text-text-primary font-bold">
                        {item.author[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-text-primary leading-tight">{item.title}</p>
                        <p className="text-[9px] text-text-muted">By {item.author}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={item.status === 'Approved' ? 'badge-success text-[8px]' : 'badge-warning text-[8px]'}>
                        {item.status}
                      </span>
                      <p className="text-[8px] text-text-muted mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Why Peer Review Promo Card */}
          <div className="card p-4 bg-gradient-to-br from-purple/10 to-surface">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple">💡</span>
              <h3 className="text-xs font-bold text-text-primary">Why Peer Review?</h3>
            </div>
            <ul className="space-y-1.5 text-[11px] text-text-secondary">
              <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-purple" /> Get different perspectives</li>
              <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-purple" /> Improve accountability</li>
              <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-purple" /> Build a growth mindset</li>
              <li className="flex items-center gap-1.5"><FiCheck size={12} className="text-purple" /> Level up together!</li>
            </ul>
          </div>
        </div>

        {/* Center Column (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Review Detail */}
          {/* Active Review Detail */}
          <div className="card border-0 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="p-6 relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white shrink-0">
                    <FiCheckCircle size={24} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-purple/10 text-purple text-[10px] font-bold uppercase tracking-wide border border-purple/20">Milestone Review</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[10px] font-bold uppercase tracking-wide border border-amber-400/20">Pending Action</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{selectedReview?.Milestone?.title || 'No review selected'}</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      Submitted by <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-bold">{selectedReview?.requester?.username || '-'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Description & Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                    <FiInfo size={12} /> Milestone Description
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedReview?.Milestone?.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-1.5">
                    <FiMessageSquare size={12} /> {selectedReview?.requester?.username || 'Peer'}'s Reflection
                  </h4>
                  <p className="text-sm text-indigo-200/90 leading-relaxed italic">
                    "{selectedReview?.reflection || 'No reflection provided.'}"
                  </p>
                </div>
              </div>

              {/* Tasks List */}
              {selectedReview?.Milestone?.tasks && selectedReview.Milestone.tasks.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5 pl-1">
                    <FiCheckSquare size={12} /> Completed Tasks
                  </h4>
                  <div className="grid gap-2">
                    {selectedReview.Milestone.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 transition-colors hover:bg-slate-800/50">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <FiCheck size={14} />
                        </div>
                        <span className="text-sm font-medium text-slate-200 line-through opacity-70">{task.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted Work Link */}
              {selectedReview?.evidence_url && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Submitted Evidence</p>
                    <a href={selectedReview?.evidence_url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 font-mono flex items-center gap-2 truncate transition-colors">
                      <FiExternalLink size={14} className="shrink-0" /> {selectedReview?.evidence_url}
                    </a>
                  </div>
                  <a href={selectedReview?.evidence_url} target="_blank" rel="noreferrer" className="shrink-0 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                    Open Link <FiChevronRight size={14} />
                  </a>
                </div>
              )}

              {/* Reviewer Feedback (If completed) */}
              {selectedReview?.Review && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5">
                    <FiStar size={12} /> Evaluation Complete
                  </h4>
                  <div className="mb-4">
                    <p className="text-sm text-emerald-100/90 leading-relaxed">
                      "{selectedReview?.Review.comment}"
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/50 text-emerald-400 text-[10px] font-bold border border-emerald-500/10">Quality: {selectedReview?.Review.rating_quality}/5</span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/50 text-emerald-400 text-[10px] font-bold border border-emerald-500/10">Consistency: {selectedReview?.Review.rating_consistency}/5</span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/50 text-emerald-400 text-[10px] font-bold border border-emerald-500/10">Overall: {selectedReview?.Review.rating_overall}/5</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Submit Your Review Form */}
          {activeTab === 'to-do' ? (
            <div className="card p-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Submit Your Review</h3>
                <p className="text-[10px] text-text-muted">Rate across 4 dimensions</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'understanding', label: 'Understanding', sub: 'Did they grasp the core concepts?' },
                  { key: 'consistency', label: 'Consistency', sub: 'Was the effort consistent?' },
                  { key: 'quality', label: 'Quality', sub: 'How complete and robust is the work?' },
                  { key: 'overall', label: 'Overall', sub: 'General impression and creativity' },
                ].map(dim => (
                  <div key={dim.key} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary">{dim.label}</span>
                      {renderStars(dim.key, ratings[dim.key])}
                    </div>
                    <p className="text-[9px] text-text-muted">{dim.sub}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Overall Feedback</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Write your detailed feedback..."
                  className="w-full p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder-text-muted focus:border-purple focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button 
                  onClick={() => handleEvaluate(false)}
                  disabled={submitting || !selectedReview}
                  className="py-2 rounded-xl border border-danger/40 text-danger hover:bg-danger/10 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? '...' : 'Request Changes'}
                </button>
                <button 
                  onClick={() => handleEvaluate(true)}
                  disabled={submitting || !selectedReview}
                  className="py-2 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1 shadow-glow-success disabled:opacity-50"
                >
                  <FiCheck size={14} /> {submitting ? '...' : 'Approve Milestone'}
                </button>
              </div>
            </div>
          ) : selectedReview ? (
             <div className={`card p-4 space-y-2 border ${selectedReview.status === 'approved' ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30'}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${selectedReview.status === 'approved' ? 'text-success' : 'text-danger'}`}>
                    {selectedReview.status === 'approved' ? <FiCheckCircle /> : <FiXCircle />} 
                    Review {selectedReview.status === 'approved' ? 'Approved' : 'Rejected'}
                </h3>
                <p className="text-xs text-text-secondary">This review was evaluated on {new Date(selectedReview.updatedAt).toLocaleDateString()}.</p>
             </div>
          ) : (
             <div className="card p-4 space-y-2 bg-surface border border-border-subtle">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2"><FiInfo /> Select a Review</h3>
                <p className="text-xs text-text-secondary">Select a review from the list to see details.</p>
             </div>
          )}

          {/* Review History */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Review History</h3>
              <span className="section-link">View All</span>
            </div>
            <div className="space-y-2">
              {reviewHistoryList.length === 0 ? (
                <div className="text-center text-text-muted text-[10px] py-4 border border-dashed border-border-subtle rounded-xl">No review history</div>
              ) : (
                reviewHistoryList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-elevated text-xs font-bold flex items-center justify-center text-text-primary">
                        {item.author[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-text-primary leading-tight">{item.title}</p>
                        <p className="text-[9px] text-text-muted">By {item.author}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={item.status === 'Approved' ? 'badge-success text-[8px]' : 'badge-warning text-[8px]'}>
                        {item.status}
                      </span>
                      <p className="text-[8px] text-text-muted mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Review Impact Card */}
          <div className="card p-4">
            <h3 className="section-title mb-3">Review Impact</h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Reviews given this month</p>
                <p className="text-lg font-bold font-mono text-purple mt-0.5">{impactGiven}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Helped friends level up</p>
                <p className="text-lg font-bold font-mono text-success mt-0.5">{impactLeveledUp}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
