let notificationsStore = [
    {
        id: '1',
        category: 'Review Request',
        priority: 'Critical',
        title: 'Milestone Review Assigned: Tokio Rust Engine',
        body: 'Accountability partner @Alex requested peer review for Milestone 1 proof submission.',
        time: '10 Minutes Ago',
        read: false,
        actionable: true,
        type: 'review'
    },
    {
        id: '2',
        category: 'Discipline Warning',
        priority: 'High',
        title: 'Consecutive Miss Penalty Trigger Warning',
        body: 'Task "Discrete Mathematics Revision" is approaching 24h expiration window.',
        time: '1 Hour Ago',
        read: false,
        actionable: false,
        type: 'warning'
    },
    {
        id: '3',
        category: 'Friend Request',
        priority: 'Medium',
        title: 'Friend Request Received from @Sarah',
        body: 'Sarah invited you to join Gym Squad Accountability Group.',
        time: '3 Hours Ago',
        read: true,
        actionable: true,
        type: 'friend'
    }
];

const { PartnerIntervention, User } = require('../models');

exports.getNotifications = async (req, res) => {
    try {
        const interventions = await PartnerIntervention.findAll({
            where: { receiver_id: req.user.id },
            include: [{ model: User, as: 'sender', attributes: ['username'] }],
            order: [['createdAt', 'DESC']]
        });

        const dynamicNotifications = interventions.map(inv => ({
            id: inv.id,
            category: inv.item_title || 'Accountability Alert',
            priority: inv.type === 'punishment' || inv.item_type === 'Penalty' ? 'Critical' : 'High',
            title: inv.type === 'message' ? 'System/Partner Alert' : 'Partner Intervention',
            body: inv.message || `Your partner ${inv.sender?.username} sent you a ${inv.type}.`,
            time: inv.createdAt,
            read: inv.sender_read, 
            actionable: inv.status === 'pending',
            type: inv.item_type === 'Penalty' ? 'warning' : 'friend'
        }));

        res.status(200).json([...dynamicNotifications, ...notificationsStore]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Try updating DB notification
        const dbIntervention = await PartnerIntervention.findOne({ where: { id, receiver_id: req.user.id } });
        if (dbIntervention) {
            dbIntervention.sender_read = true;
            await dbIntervention.save();
            return res.status(200).json({ message: 'Marked read in DB' });
        }

        // Fallback to static store
        const item = notificationsStore.find(n => n.id === id);
        if (item) {
            item.read = true;
            return res.status(200).json(item);
        }
        res.status(404).json({ message: 'Notification not found' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        // Update all DB notifications
        await PartnerIntervention.update(
            { sender_read: true },
            { where: { receiver_id: req.user.id, sender_read: false } }
        );

        // Update static store
        notificationsStore.forEach(n => n.read = true);
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error marking all read' });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const { ApprovalRequest, Penalty, ChatMessage } = require('../models');

        // 1. Unread Interventions
        const interventionsCount = await PartnerIntervention.count({
            where: { receiver_id: req.user.id, sender_read: false }
        });

        // 2. Pending Reviews
        const reviewsCount = await ApprovalRequest.count({
            where: { reviewer_id: req.user.id, status: 'pending' }
        });

        // 3. Active Penalties
        const penaltiesCount = await Penalty.count({
            where: { user_id: req.user.id } // Active implies they haven't completed/restarted yet
        });

        // 4. Unread Chat Messages
        const chatCount = await ChatMessage.count({
            where: { receiver_id: req.user.id, is_read: false }
        });

        // We also check the static notificationsStore for any unread static items
        const staticUnread = notificationsStore.filter(n => !n.read).length;

        const total = interventionsCount + reviewsCount + penaltiesCount + chatCount + staticUnread;

        res.status(200).json({ count: total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching unread count' });
    }
};
