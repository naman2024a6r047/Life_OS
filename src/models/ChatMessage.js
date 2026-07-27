const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sender_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    receiver_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = ChatMessage;
