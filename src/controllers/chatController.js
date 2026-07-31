const { ChatMessage, User } = require('../models');
const { Op } = require('sequelize');

exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const partnerId = req.params.partnerId;

        const messages = await ChatMessage.findAll({
            where: {
                [Op.or]: [
                    { sender_id: userId, receiver_id: partnerId },
                    { sender_id: partnerId, receiver_id: userId }
                ]
            },
            order: [['createdAt', 'ASC']],
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username', 'email'] },
                { model: User, as: 'receiver', attributes: ['id', 'username', 'email'] }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const partnerId = req.params.partnerId;

        await ChatMessage.update(
            { is_read: true },
            {
                where: {
                    sender_id: partnerId,
                    receiver_id: userId,
                    is_read: false
                }
            }
        );

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Error marking messages as read' });
    }
};

exports.getUnreadMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const messages = await ChatMessage.findAll({
            where: {
                receiver_id: userId,
                is_read: false
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching unread messages:', error);
        res.status(500).json({ message: 'Error fetching unread messages' });
    }
};
