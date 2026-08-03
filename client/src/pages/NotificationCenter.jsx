import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiMessageSquare, FiAlertTriangle, FiCheckCircle, FiActivity, FiArrowRight, FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        setLoading(true);
        // Fetch all possible notification sources
        const [
          inquiriesRes,
          penaltiesRes,
          reviewsRes,
          feedRes,
          chatRes
        ] = await Promise.allSettled([
          axios.get('/api/friends/interventions'),
          axios.get('/api/penalties/active'),
          axios.get('/api/reviews/pending'),
          axios.get('/api/friends/feed'),
          axios.get('/api/chat/unread')
        ]);

        const notifs = [];

        // 0. Chat Messages
        if (chatRes.status === 'fulfilled' && chatRes.value.data) {
          // Group by sender to avoid spamming the notification feed
          const unreadMsgs = chatRes.value.data;
          const groupedBySender = {};
          
          unreadMsgs.forEach(msg => {
            const senderId = msg.sender?.id || msg.sender_id;
            if (!groupedBySender[senderId]) {
              groupedBySender[senderId] = {
                count: 0,
                senderName: msg.sender?.username || 'A friend',
                latestMsg: msg.content,
                date: msg.createdAt,
                id: msg.id
              };
            }
            groupedBySender[senderId].count += 1;
            // Assuming they are sorted DESC from backend, the first one encountered is the latest
          });

          Object.values(groupedBySender).forEach(group => {
            notifs.push({
              id: `chat-${group.id}`,
              type: 'chat',
              title: group.count > 1 ? `New Messages (${group.count})` : 'New Message',
              message: `${group.senderName}: "${group.latestMsg}"`,
              date: group.date,
              icon: <FiMessageSquare className="text-text-primary" size={18} />,
              iconBg: 'bg-gradient-to-br from-primary/20 to-primary/5',
              link: '/friends'
            });
          });
        }

        // 1. Inquiries / Chat
        if (inquiriesRes.status === 'fulfilled' && inquiriesRes.value.data) {
          inquiriesRes.value.data.forEach(inq => {
            if (inq.status === 'pending') {
              notifs.push({
                id: `inq-${inq.id}`,
                type: 'inquiry',
                title: 'New Partner Inquiry',
                message: `${inq.sender?.username || 'A partner'} asked about your progress: "${inq.message || 'Why did you miss your task?'}"`,
                date: inq.createdAt,
                icon: <FiInfo className="text-text-primary" size={18} />,
                iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-500',
                link: '/friends'
              });
            }
          });
        }

        // 2. Penalty Alerts
        if (penaltiesRes.status === 'fulfilled' && penaltiesRes.value.data) {
          penaltiesRes.value.data.forEach(pen => {
            notifs.push({
              id: `pen-${pen.id}`,
              type: 'penalty',
              title: 'Penalty Applied!',
              message: `You were penalized for missing tasks. Consequence: ${pen.description || pen.penalty_type || 'Accountability strike applied.'}`,
              date: pen.createdAt,
              icon: <FiAlertTriangle className="text-text-primary" size={18} />,
              iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
              link: '/penalties'
            });
          });
        }

        // 3. Pending Reviews
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.data) {
          reviewsRes.value.data.forEach(rev => {
            notifs.push({
              id: `rev-${rev.id}`,
              type: 'review',
              title: 'Peer Review Requested',
              message: `${rev.requester?.username || 'A partner'} submitted evidence for a milestone. They need your approval.`,
              date: rev.createdAt,
              icon: <FiCheckCircle className="text-text-primary" size={18} />,
              iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
              link: '/friends'
            });
          });
        }

        // 4. Partner Activity Feed (Limit to recent 10 to avoid clutter)
        if (feedRes.status === 'fulfilled' && feedRes.value.data) {
          const recentFeed = feedRes.value.data.slice(0, 10);
          recentFeed.forEach(act => {
            const actionFormatted = (act.action_type || act.type || 'was active').replace(/_/g, ' ');
            notifs.push({
              id: `feed-${act.id}`,
              type: 'feed',
              title: 'Partner Activity',
              message: `${act.User?.username || 'A partner'} ${actionFormatted}.`,
              date: act.createdAt,
              icon: <FiActivity className="text-text-primary" size={18} />,
              iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
              link: '/friends'
            });
          });
        }

        // Sort all notifications by date (newest first)
        notifs.sort((a, b) => new Date(b.date) - new Date(a.date));

        const clearedAtStr = localStorage.getItem('notificationsClearedAt');
        const clearedAt = clearedAtStr ? new Date(clearedAtStr) : new Date(0);
        
        const filteredNotifs = notifs.filter(n => new Date(n.date) > clearedAt);
        setNotifications(filteredNotifs);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNotifications();
  }, []);

  const handleClearInbox = async () => {
    if (!window.confirm("Are you sure you want to clear your inbox? This will hide all current notifications.")) return;
    
    try {
      await axios.post('/api/notifications/read-all');
      localStorage.setItem('notificationsClearedAt', new Date().toISOString());
      setNotifications([]);
      // Force a tiny reload to update sidebar badges without a full page refresh if possible, but simplest is to just reload
      window.location.reload();
    } catch (err) {
      console.error('Failed to clear inbox', err);
    }
  };

  const groupNotifications = (notifs) => {
    const today = [];
    const yesterday = [];
    const older = [];

    notifs.forEach(n => {
      const date = dayjs(n.date);
      if (date.isToday()) {
        today.push(n);
      } else if (date.isYesterday()) {
        yesterday.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupNotifications(notifications);

  const NotificationGroup = ({ title, items }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 pl-2">{title}</h3>
        <div className="space-y-3">
          {items.map((n, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={n.id} 
              className="relative group p-5 rounded-2xl bg-background/40 border border-border-subtle/50 hover:bg-surface-elevated/60 hover:border-primary/50 transition-all duration-300 backdrop-blur-xl overflow-hidden"
            >
              {/* Subtle hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20/0 via-indigo-500/5 to-primary/5/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 relative z-10">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${n.iconBg}`}>
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 mb-2">
                    <h3 className="text-sm sm:text-base font-bold text-text-primary leading-tight break-words pr-2">{n.title}</h3>
                    <span className="text-[10px] sm:text-xs font-medium text-text-muted whitespace-nowrap bg-surface-elevated/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-border-subtle/50 self-start sm:self-auto mt-1 sm:mt-0">
                      {dayjs(n.date).fromNow()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed mb-3 sm:mb-4">{n.message}</p>
                  <Link to={n.link} className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold text-primary hover:text-primary transition-colors group/link">
                    View Details 
                    <FiArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen relative">
      {/* Dynamic Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-background/60 p-6 rounded-3xl border border-border-subtle/80 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-text-primary shadow-lg shadow-primary/30">
            <FiBell size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Notification Center</h1>
            <p className="text-text-muted font-medium mt-1">Stay updated with accountability alerts and partner activity.</p>
          </div>
        </div>
        
        {notifications.length > 0 && (
          <button 
            onClick={handleClearInbox}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-rose-500/10 text-text-primary hover:text-rose-400 border border-border-subtle hover:border-rose-500/30 transition-all font-bold text-sm flex items-center gap-2"
          >
            Clear Inbox
          </button>
        )}
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-muted font-medium animate-pulse">Gathering your notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 text-center flex flex-col items-center justify-center rounded-3xl bg-background/40 border border-border-subtle backdrop-blur-xl"
          >
            <div className="w-24 h-24 rounded-full bg-surface-elevated/80 flex items-center justify-center mb-6 border border-border-subtle">
              <FiCheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-text-primary mb-2">You're all caught up!</h2>
            <p className="text-text-muted max-w-sm">No new alerts, partner inquiries, or activity to show at this moment.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <NotificationGroup title="Today" items={today} />
            <NotificationGroup title="Yesterday" items={yesterday} />
            <NotificationGroup title="Older" items={older} />
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
