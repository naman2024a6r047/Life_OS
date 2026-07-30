import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiBell, FiMessageSquare, FiAlertTriangle, FiCheckCircle, FiActivity, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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
          feedRes
        ] = await Promise.allSettled([
          axios.get('/api/friends/interventions'),
          axios.get('/api/penalties/active'),
          axios.get('/api/reviews/pending'),
          axios.get('/api/friends/feed')
        ]);

        const notifs = [];

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
                icon: <FiMessageSquare className="text-info" />,
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
              message: `You were penalized for missing tasks. Consequence: ${pen.punishment}`,
              date: pen.createdAt,
              icon: <FiAlertTriangle className="text-danger" />,
              link: '/penalties' // Will redirect to the dedicated penalty page
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
              icon: <FiCheckCircle className="text-warning" />,
              link: '/friends'
            });
          });
        }

        // 4. Partner Activity Feed (Limit to recent 10 to avoid clutter)
        if (feedRes.status === 'fulfilled' && feedRes.value.data) {
          const recentFeed = feedRes.value.data.slice(0, 10);
          recentFeed.forEach(act => {
            notifs.push({
              id: `feed-${act.id}`,
              type: 'feed',
              title: 'Partner Activity',
              message: `${act.User?.username || 'A partner'} ${act.action || act.type}.`,
              date: act.createdAt,
              icon: <FiActivity className="text-primary" />,
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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <FiBell size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notification Center</h1>
          <p className="text-sm text-text-muted">All your alerts, chats, and activity in one place.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-text-muted text-sm animate-pulse">Gathering your notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="card p-10 text-center flex flex-col items-center justify-center">
          <FiBell size={40} className="text-text-muted mb-4 opacity-50" />
          <h2 className="text-lg font-bold text-text-primary">You're all caught up!</h2>
          <p className="text-sm text-text-muted mt-2">No new alerts, inquiries, or activity to show.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={n.id} 
              className="card p-4 flex items-start gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center flex-shrink-0 mt-1">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-text-primary truncate">{n.title}</h3>
                  <span className="text-[10px] text-text-muted whitespace-nowrap">{dayjs(n.date).fromNow()}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-3">{n.message}</p>
                <Link to={n.link} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary-light transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg">
                  View Details <FiArrowRight size={10} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
