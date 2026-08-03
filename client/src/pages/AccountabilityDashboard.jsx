import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  FiUsers, FiPlus, FiSearch, FiMessageSquare, FiShield,
  FiActivity, FiCheckCircle, FiSettings, FiUserPlus, FiTarget,
  FiZap, FiAward, FiAlertTriangle, FiEye, FiEyeOff
} from 'react-icons/fi';

dayjs.extend(relativeTime);

export default function AccountabilityDashboard() {
  const { user, fetchUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('feed'); // feed, partners, reviews, settings
  const [loading, setLoading] = useState(true);

  // Data states
  const [feed, setFeed] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [privacy, setPrivacy] = useState(user?.privacy_settings || {
    show_goals: true, show_tasks: true, show_workouts: true, show_analytics: true, show_achievements: true
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'feed') {
        const res = await axios.get('/api/friends/feed');
        setFeed(res.data || []);
      } else if (activeTab === 'partners') {
        const [fRes, reqRes] = await Promise.all([
          axios.get('/api/friends'),
          axios.get('/api/friends/pending')
        ]);
        setFriends(fRes.data || []);
        setPendingRequests(reqRes.data || []);
      } else if (activeTab === 'reviews') {
        const res = await axios.get('/api/reviews/pending');
        setPendingReviews(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(`/api/friends/search?q=${e.target.value}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      await axios.post('/api/friends/request', { friend_id: friendId });
      alert('Request sent!');
      handleSearchUsers({ target: { value: searchQuery } });
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const acceptRequest = async (id) => {
    try {
      await axios.post(`/api/friends/accept/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert('Error accepting request');
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.post(`/api/friends/reject/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert('Error rejecting request');
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await axios.put('/api/friends/privacy', privacy);
      alert('Privacy settings updated successfully!');
      if (fetchUser) fetchUser(); // Update context if available
    } catch (err) {
      alert('Error updating privacy settings');
    }
  };

  const handleReviewAction = async (reviewId, isApproved) => {
    try {
      await axios.post(`/api/reviews/evaluate/${reviewId}`, {
        is_approved: isApproved,
        rating_understanding: 5,
        rating_consistency: 5,
        rating_quality: 5,
        rating_overall: 5,
        comment: isApproved ? 'Great job!' : 'Needs some changes.'
      });
      alert(`Milestone ${isApproved ? 'Approved' : 'Rejected'}!`);
      fetchDashboardData();
    } catch (err) {
      alert('Error submitting evaluation.');
    }
  };

  const TABS = [
    { id: 'feed', label: 'Activity Feed', icon: <FiActivity /> },
    { id: 'partners', label: 'Partners', icon: <FiUsers /> },
    { id: 'reviews', label: 'Peer Reviews', icon: <FiCheckCircle /> },
    { id: 'settings', label: 'Privacy Settings', icon: <FiSettings /> }
  ];

  return (
    <div className="w-full p-4 md:p-8 relative overflow-hidden text-text-primary">
      <div className="ambient-glow top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10"></div>
      
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="card rounded-2xl border border-primary/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20/30 to-cyan-500/30 border-2 border-primary/40 flex items-center justify-center text-primary">
                <FiShield size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Accountability Hub</h1>
                <p className="text-sm text-text-muted mt-1">Grow together, stay disciplined, and track progress.</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-primary text-background shadow-lg shadow-primary/30' 
                    : 'bg-surface/5 text-text-muted hover:bg-surface/10 hover:text-text-primary'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-text-muted">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* MAIN CONTENT AREA */}
            <div className="md:col-span-8 space-y-6">
              
              {/* FEED TAB */}
              {activeTab === 'feed' && (
                <div className="card p-6 rounded-2xl border border-border-subtle">
                  <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                    <FiActivity className="text-primary" /> Recent Partner Activity
                  </h2>
                  {feed.length > 0 ? (
                    <div className="space-y-4">
                      {feed.map((log, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-background/50 border border-border-subtle rounded-xl transition hover:bg-background/80">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20/20 to-primary/5/20 border border-primary/30 flex items-center justify-center text-primary font-bold shrink-0">
                            {log.User?.username ? log.User.username[0].toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-text-primary">
                              <span className="font-bold text-text-primary">{log.User?.username}</span> {log.action || log.type}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                              <span>{dayjs(log.createdAt).fromNow()}</span>
                              {log.xp_earned > 0 && <span className="text-success font-bold">+{log.xp_earned} XP</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-text-muted bg-background/30 rounded-xl border border-border-subtle border-dashed">
                      <FiActivity className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>No recent activity from your partners.</p>
                    </div>
                  )}
                </div>
              )}

              {/* PARTNERS TAB */}
              {activeTab === 'partners' && (
                <div className="space-y-6">
                  {pendingRequests.length > 0 && (
                    <div className="card p-6 rounded-2xl border border-amber-500/20">
                      <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                        <FiUserPlus /> Pending Requests ({pendingRequests.length})
                      </h2>
                      <div className="grid gap-3">
                        {pendingRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between p-4 bg-background border border-amber-500/10 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                                {req.requester?.username[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-text-primary">{req.requester?.username}</p>
                                <p className="text-xs text-text-muted">Level {req.requester?.level}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => acceptRequest(req.id)} className="px-3 py-1.5 bg-success hover:bg-success/80 text-text-primary text-xs font-bold rounded-lg transition">Accept</button>
                              <button onClick={() => rejectRequest(req.id)} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold rounded-lg transition">Decline</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="card p-6 rounded-2xl border border-border-subtle">
                    <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                      <FiUsers className="text-cyan-400" /> My Accountability Partners
                    </h2>
                    {friends.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {friends.map(friend => (
                          <div key={friend.id} className="p-5 bg-background/50 border border-border-subtle rounded-xl hover:border-cyan-500/50 transition group">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-lg font-bold">
                                {friend.username[0].toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-bold text-text-primary text-lg group-hover:text-cyan-400 transition">{friend.username}</h3>
                                <p className="text-xs text-text-muted">Level {friend.level}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link to={`/friends/${friend.id}`} className="flex-1 py-2 text-center bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20 transition">
                                View Telemetry
                              </Link>
                              <Link to={`/friends/${friend.id}`} className="py-2 px-3 bg-surface/5 hover:bg-surface/10 text-text-primary rounded-lg border border-border-subtle transition">
                                <FiMessageSquare />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-text-muted">You have no partners yet. Search below to add one!</div>
                    )}
                  </div>

                  {/* Add New Partner */}
                  <div className="card p-6 rounded-2xl border border-border-subtle">
                    <h3 className="text-sm font-bold text-text-primary mb-4">Find New Partners</h3>
                    <div className="relative mb-4">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={handleSearchUsers}
                        placeholder="Search by username..."
                        className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted transition outline-none"
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        {searchResults.map(u => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-surface-elevated/50 rounded-lg border border-border-subtle">
                            <span className="text-sm font-bold text-text-primary">{u.username}</span>
                            {u.relationshipStatus === 'accepted' ? (
                              <span className="text-xs text-success font-bold px-2 py-1 bg-emerald-400/10 rounded">Partner</span>
                            ) : u.relationshipStatus === 'pending' ? (
                              <span className="text-xs text-amber-400 font-bold px-2 py-1 bg-amber-400/10 rounded">Pending</span>
                            ) : (
                              <button onClick={() => sendFriendRequest(u.id)} className="px-3 py-1.5 bg-primary hover:bg-primary text-background text-xs font-bold rounded-md">Add</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="card p-6 rounded-2xl border border-border-subtle">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      <FiCheckCircle className="text-success" /> Peer Reviews ({pendingReviews.length})
                    </h2>
                    <Link to="/reviews" className="text-xs font-bold text-primary hover:text-primary">Advanced Dashboard →</Link>
                  </div>
                  {pendingReviews.length > 0 ? (
                    <div className="space-y-4">
                      {pendingReviews.map(review => (
                        <div key={review.id} className="p-5 bg-background border border-border-subtle rounded-xl">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs text-success font-bold mb-1">Milestone Submission</p>
                              <h3 className="text-lg font-bold text-text-primary">{review.Milestone?.title || 'Unknown Milestone'}</h3>
                              <p className="text-sm text-text-muted mt-1">Submitted by <span className="font-bold text-text-primary">{review.requester?.username}</span></p>
                            </div>
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded uppercase">Pending</span>
                          </div>
                          {review.reflection && (
                            <div className="p-3 bg-surface/5 border-l-2 border-primary rounded-r-lg text-sm text-text-primary italic mb-4">
                              "{review.reflection}"
                            </div>
                          )}
                          {review.evidence_url && (
                            <a href={review.evidence_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition mb-4">
                              <FiEye /> View Attached Proof
                            </a>
                          )}
                          <div className="flex gap-2 pt-4 border-t border-border-subtle">
                            <button onClick={() => handleReviewAction(review.id, true)} className="flex-1 py-2 bg-success hover:bg-success/80 text-text-primary text-sm font-bold rounded-lg transition">Approve</button>
                            <button onClick={() => handleReviewAction(review.id, false)} className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 text-sm font-bold rounded-lg transition">Reject / Request Changes</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-text-muted bg-background/30 rounded-xl border border-border-subtle border-dashed">
                      <FiCheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-500/50" />
                      <p>You have no pending reviews. Great job!</p>
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="card p-6 rounded-2xl border border-border-subtle">
                  <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                    <FiSettings className="text-text-muted" /> Privacy Controls
                  </h2>
                  <p className="text-sm text-text-muted mb-6">Control what your accountability partners can see when they view your telemetry dashboard.</p>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'show_goals', label: 'Share Active Goals & Milestones', desc: 'Allows partners to see your current challenges and tasks.' },
                      { key: 'show_tasks', label: 'Share Task Completion & Misses', desc: 'Allows partners to see if you skipped tasks and your completion rate.' },
                      { key: 'show_workouts', label: 'Share Workout Plans', desc: 'Allows partners to view your fitness regimens.' },
                      { key: 'show_analytics', label: 'Share Activity & Focus Logs', desc: 'Allows partners to see your study time and activity feed.' },
                      { key: 'show_achievements', label: 'Share RPG Skills & Badges', desc: 'Allows partners to see your level ups and achievements.' }
                    ].map(setting => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-background/50 border border-border-subtle rounded-xl">
                        <div>
                          <h4 className="font-bold text-text-primary text-sm">{setting.label}</h4>
                          <p className="text-xs text-text-muted mt-0.5">{setting.desc}</p>
                        </div>
                        <button 
                          onClick={() => setPrivacy(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                          className={`w-12 h-6 rounded-full transition-colors relative ${privacy[setting.key] ? 'bg-success' : 'bg-surface'}`}
                        >
                          <div className={`w-4 h-4 bg-surface rounded-full absolute top-1 transition-transform ${privacy[setting.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border-subtle">
                    <button onClick={handleSavePrivacy} className="px-6 py-2.5 bg-primary hover:bg-primary text-background font-bold rounded-xl transition shadow-lg shadow-primary/30">
                      Save Privacy Settings
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR WIDGETS */}
            <div className="md:col-span-4 space-y-6">
              {/* Quick Stats Widget */}
              <div className="card p-5 rounded-2xl border border-border-subtle">
                <h3 className="text-sm font-bold text-text-primary mb-4">My Accountability Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background/80 p-3 rounded-xl border border-border-subtle/50">
                    <p className="text-[10px] uppercase text-text-muted font-bold">Partners</p>
                    <p className="text-2xl font-black text-text-primary">{friends.length}</p>
                  </div>
                  <div className="bg-background/80 p-3 rounded-xl border border-border-subtle/50">
                    <p className="text-[10px] uppercase text-text-muted font-bold">Pending Reviews</p>
                    <p className="text-2xl font-black text-amber-400">{pendingReviews.length}</p>
                  </div>
                  <div className="col-span-2 bg-gradient-to-r from-primary/20/10 to-primary/5/10 p-3 rounded-xl border border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] uppercase text-primary font-bold">Discipline Score</p>
                        <p className="text-xl font-black text-text-primary">{user?.discipline_score || 50}<span className="text-xs text-text-muted">/100</span></p>
                      </div>
                      <FiTarget className="text-primary/50 w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivation Widget */}
              <div className="card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
                <div className="flex gap-3 mb-2">
                  <FiAward className="text-success w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold text-success">Why Accountability?</h3>
                </div>
                <p className="text-xs text-text-primary leading-relaxed">
                  Sharing your goals increases your chance of success by up to <strong className="text-text-primary">65%</strong>. Having a specific accountability appointment with a partner increases it to <strong className="text-text-primary">95%</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
