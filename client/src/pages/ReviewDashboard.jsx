import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiCheckCircle, FiXCircle, FiStar, FiSearch, FiFilter,
  FiExternalLink, FiClock, FiShield, FiZap, FiAward, FiAlertCircle,
  FiInfo, FiChevronRight, FiHeart, FiCheck, FiThumbsUp, FiMessageSquare
} from 'react-icons/fi';

export default function ReviewDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('to-do');
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [reviewsToDo, setReviewsToDo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({
    quality: 5,
    completeness: 5,
    consistency: 5,
    creativity: 5,
  });
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/reviews/pending');
      const data = res.data || [];
      setReviewsToDo(data);
      if (data.length > 0) setSelectedReviewId(data[0].id);
    } catch (err) {
      console.error('Error fetching pending reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const streak = user?.current_streak || 32;
  const totalXP = (user?.xp || 0) + ((user?.level || 1) - 1) * 100 || 1825;
  const level = user?.level || 13;

  const selectedReview = reviewsToDo.find(r => r.id === selectedReviewId) || reviewsToDo[0];

  const recentlyReviewed = [
    { title: 'DSA Practice – Arrays', status: 'Approved', author: 'Arjun Verma', time: '2 days ago' },
    { title: 'Complete Python Course', status: 'Needs Work', author: 'Priya Sharma', time: '5 days ago' },
    { title: 'Morning Consistency Habit', status: 'Approved', author: 'Rohit Singh', time: '1 week ago' },
  ];

  const reviewHistory = [
    { title: 'Build Portfolio Website', status: 'Approved', author: 'Arjun Verma', time: '1 week ago' },
    { title: 'Learn Data Structures', status: 'Needs Work', author: 'Priya Sharma', time: '2 weeks ago' },
    { title: '5K Running Challenge', status: 'Approved', author: 'Rohit Singh', time: '3 weeks ago' },
  ];

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
      await axios.post(`/api/reviews/evaluate/${selectedReview.id}`, {
        is_approved: isApproved,
        rating_understanding: ratings.quality,
        rating_consistency: ratings.consistency,
        rating_quality: ratings.completeness,
        rating_overall: ratings.creativity,
        comment: feedback
      });
      alert(`Milestone ${isApproved ? 'Approved' : 'Rejected'}!`);
      fetchPendingReviews();
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
          { id: 'to-do', label: 'Reviews to Do', badge: 3 },
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
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column (3 cols) */}
        <div className="col-span-3 space-y-4">
          {/* Reviews to Do Search & List */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-text-primary">Reviews to Do ({reviewsToDo.length})</h3>
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
            <div className="space-y-2">
              {loading ? (
                <div className="text-center text-text-muted text-xs p-4">Loading requests...</div>
              ) : reviewsToDo.length === 0 ? (
                <div className="text-center text-text-muted text-xs p-4 border border-dashed border-border-subtle rounded-xl">No pending reviews. You're all caught up!</div>
              ) : (
                reviewsToDo.map(r => {
                  const isSelected = r.id === selectedReviewId;
                  const authorName = r.requester?.username || 'Unknown User';
                  const title = r.Milestone?.title || 'Unknown Milestone';
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReviewId(r.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected ? 'border-purple bg-purple/10' : 'border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-warning/10 text-warning flex items-center justify-center font-mono text-xs flex-shrink-0 mt-0.5">
                          🎯
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary truncate">{title}</p>
                          <p className="text-[10px] text-text-muted">By {authorName}</p>
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
              {recentlyReviewed.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center text-xs text-text-primary font-bold">
                      {item.author[0]}
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
              ))}
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
        <div className="col-span-6 space-y-4">
          {/* Active Review Detail */}
          <div className="card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-mono font-bold">
                  🎯
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge-purple text-[9px]">Milestone Review</span>
                    <span className="badge-info text-[9px]">In Progress</span>
                  </div>
                  <h2 className="text-base font-bold text-text-primary mt-1">{selectedReview?.Milestone?.title || 'No review selected'}</h2>
                  <p className="text-xs text-text-muted">
                    By <span className="text-text-primary font-medium">{selectedReview?.requester?.username || '-'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-text-primary mb-1">Milestone Description</h4>
              <p className="text-xs text-text-secondary">{selectedReview.description}</p>
            </div>

            {/* Submitted Work Link */}
            {selectedReview?.evidence_url && (
              <div className="p-3 rounded-xl bg-surface-elevated flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-text-muted">Submitted Work</p>
                  <a href={selectedReview.evidence_url} target="_blank" rel="noreferrer" className="text-xs text-info font-mono hover:underline flex items-center gap-1">
                    {selectedReview.evidence_url} <FiExternalLink size={11} />
                  </a>
                </div>
                <a href={selectedReview.evidence_url} target="_blank" rel="noreferrer" className="btn-outline text-xs px-3 py-1.5">
                  View Submission
                </a>
              </div>
            )}

            {/* Progress Evidence */}
            <div>
              <h4 className="text-xs font-bold text-text-primary mb-2">Progress Evidence</h4>
              <div className="grid grid-cols-4 gap-2">
                {selectedReview.evidence?.slice(0, 3).map((img, i) => (
                  <div key={i} className="h-20 rounded-lg overflow-hidden border border-border-subtle relative group">
                    <img src={img} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ))}
                <div className="h-20 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center text-xs font-bold text-text-muted">
                  +3 More
                </div>
              </div>
            </div>

            {/* Peer Notes */}
            {selectedReview?.reflection && (
              <div>
                <h4 className="text-xs font-bold text-text-primary mb-1.5">{selectedReview?.requester?.username || 'Peer'}'s Reflection</h4>
                <div className="p-3 rounded-xl bg-surface-elevated/70 border-l-2 border-purple text-xs text-text-secondary italic">
                  "{selectedReview.reflection}"
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column (3 cols) */}
        <div className="col-span-3 space-y-4">
          {/* Submit Your Review Form */}
          <div className="card p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Submit Your Review</h3>
              <p className="text-[10px] text-text-muted">Rate across 4 dimensions</p>
            </div>

            {/* 4 Rating Dimensions */}
            <div className="space-y-3">
              {[
                { key: 'quality', label: 'Quality', sub: 'How good is the quality?' },
                { key: 'completeness', label: 'Completeness', sub: 'How complete is the work?' },
                { key: 'consistency', label: 'Consistency', sub: 'Is the work consistent?' },
                { key: 'creativity', label: 'Creativity', sub: 'How creative is the approach?' },
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

            {/* Feedback Input */}
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Overall Feedback</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Write your detailed feedback..."
                className="w-full p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder-text-muted focus:border-purple focus:outline-none resize-none"
              />
              <span className="text-[9px] text-text-muted text-right block mt-0.5">0/1000</span>
            </div>

            {/* Buttons */}
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

          {/* Review History */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Review History</h3>
              <span className="section-link">View All</span>
            </div>
            <div className="space-y-2">
              {reviewHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-elevated text-xs font-bold flex items-center justify-center text-text-primary">
                      {item.author[0]}
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
              ))}
            </div>
          </div>

          {/* Review Impact Card */}
          <div className="card p-4">
            <h3 className="section-title mb-3">Review Impact</h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Reviews given this month</p>
                <p className="text-lg font-bold font-mono text-purple mt-0.5">12</p>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Helped friends level up</p>
                <p className="text-lg font-bold font-mono text-success mt-0.5">8</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
