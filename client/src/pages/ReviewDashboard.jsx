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
  const [selectedReviewId, setSelectedReviewId] = useState('r1');
  const [ratings, setRatings] = useState({
    quality: 5,
    completeness: 5,
    consistency: 5,
    creativity: 5,
  });
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const streak = user?.current_streak || 32;
  const totalXP = (user?.xp || 0) + ((user?.level || 1) - 1) * 100 || 1825;
  const level = user?.level || 13;

  const reviewsToDo = [
    {
      id: 'r1',
      title: 'Build a To-Do App with React',
      milestone: 'Milestone 4 • Day 37-40',
      author: 'Arjun Verma',
      dueDate: 'Due in 1 day',
      dueFull: '12 May 2026',
      icon: '</>',
      description: 'Integrate backend API with React app, implement CRUD operations for tasks, add authentication and deploy.',
      repoUrl: 'https://github.com/arjunverma/todo-app',
      notes: 'I have connected the frontend with Node.js backend API. Users can signup/login, create tasks, update and delete their tasks. Please review the code quality, UI/UX and overall functionality.',
      activity: [
        { label: 'Milestone Started', day: 'Day 31', date: '10 Apr 2026', color: 'purple' },
        { label: 'Progress Update', day: 'Day 34', date: '13 Apr 2026', color: 'info' },
        { label: 'Work Submitted', day: 'Day 40', date: '10 May 2026', color: 'success' },
      ],
      evidence: [
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=300&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&auto=format&fit=crop&q=60',
      ]
    },
    {
      id: 'r2',
      title: 'Quantitative Aptitude Practice',
      milestone: 'Milestone 2 • Day 11-20',
      author: 'Priya Sharma',
      dueDate: 'Due in 2 days',
      icon: '📖',
    },
    {
      id: 'r3',
      title: 'Push Pull Legs Routine',
      milestone: 'Milestone 3 • Week 3',
      author: 'Rohit Singh',
      dueDate: 'Due in 3 days',
      icon: '🏋️',
    }
  ];

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
              <h3 className="text-xs font-bold text-text-primary">Reviews to Do (3)</h3>
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
              {reviewsToDo.map(r => {
                const isSelected = r.id === selectedReviewId;
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
                        {r.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">{r.title}</p>
                        <p className="text-[10px] text-text-muted">{r.milestone}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-text-secondary">By {r.author}</span>
                          <span className="badge-danger text-[8px] px-1.5 py-0">{r.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  {selectedReview.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge-purple text-[9px]">Milestone Review</span>
                    <span className="badge-info text-[9px]">In Progress</span>
                  </div>
                  <h2 className="text-base font-bold text-text-primary mt-1">{selectedReview.title}</h2>
                  <p className="text-xs text-text-muted">
                    {selectedReview.milestone} • By <span className="text-text-primary font-medium">{selectedReview.author}</span> • Due: {selectedReview.dueFull}
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
            <div className="p-3 rounded-xl bg-surface-elevated flex items-center justify-between">
              <div>
                <p className="text-[10px] text-text-muted">Submitted Work</p>
                <a href={selectedReview.repoUrl} target="_blank" rel="noreferrer" className="text-xs text-info font-mono hover:underline flex items-center gap-1">
                  {selectedReview.repoUrl} <FiExternalLink size={11} />
                </a>
              </div>
              <a href={selectedReview.repoUrl} target="_blank" rel="noreferrer" className="btn-outline text-xs px-3 py-1.5">
                View Submission
              </a>
            </div>

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

            {/* Arjun's Notes */}
            <div>
              <h4 className="text-xs font-bold text-text-primary mb-1.5">{selectedReview.author.split(' ')[0]}'s Notes</h4>
              <div className="p-3 rounded-xl bg-surface-elevated/70 border-l-2 border-purple text-xs text-text-secondary italic">
                "{selectedReview.notes}"
              </div>
            </div>

            {/* Milestone Activity Timeline */}
            <div>
              <h4 className="text-xs font-bold text-text-primary mb-2">Milestone Activity</h4>
              <div className="space-y-2">
                {selectedReview.activity?.map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${act.color}`} />
                      <span className="font-semibold text-text-primary">{act.label}</span>
                      <span className="text-text-muted text-[10px]">{act.day}</span>
                    </div>
                    <span className="text-text-muted font-mono text-[10px]">{act.date}</span>
                  </div>
                ))}
              </div>
            </div>
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
              <button className="py-2 rounded-xl border border-danger/40 text-danger hover:bg-danger/10 text-xs font-semibold transition-all">
                Request Changes
              </button>
              <button className="py-2 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1 shadow-glow-success">
                <FiCheck size={14} /> Approve Milestone
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
