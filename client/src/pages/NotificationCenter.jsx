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
              icon: <FiMessageSquare className="text-white" size={18} />,
              iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
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
                icon: <FiInfo className="text-white" size={18} />,
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
              icon: <FiAlertTriangle className="text-white" size={18} />,
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
              icon: <FiCheckCircle className="text-white" size={18} />,
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
              icon: <FiActivity className="text-white" size={18} />,
              iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
              link: '/friends'
            });
          });
        }

        // Sort all notifications by date (newest first)
        notifs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotifications(notifs);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNotifications();
  }, []);

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
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pl-2">{title}</h3>
        <div className="space-y-3">
          {items.map((n, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={n.id} 
              className="relative group p-5 rounded-2xl bg-slate-900/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-xl overflow-hidden"
            >
              {/* Subtle hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="flex items-start gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${n.iconBg}`}>
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <h3 className="text-base font-bold text-white truncate">{n.title}</h3>
                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
                      {dayjs(n.date).fromNow()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{n.message}</p>
                  <Link to={n.link} className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group/link">
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
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex items-center gap-4 mb-10 bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <FiBell size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Notification Center</h1>
          <p className="text-slate-400 font-medium mt-1">Stay updated with accountability alerts and partner activity.</p>
        </div>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium animate-pulse">Gathering your notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 text-center flex flex-col items-center justify-center rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl"
          >
            <div className="w-24 h-24 rounded-full bg-slate-800/80 flex items-center justify-center mb-6 border border-slate-700">
              <FiCheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">You're all caught up!</h2>
            <p className="text-slate-400 max-w-sm">No new alerts, partner inquiries, or activity to show at this moment.</p>
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
