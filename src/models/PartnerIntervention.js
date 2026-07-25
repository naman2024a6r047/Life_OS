const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PartnerIntervention = sequelize.define('PartnerIntervention', {
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
    item_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    item_title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('inquiry', 'punishment', 'cheer', 'message', 'reminder'),
        defaultValue: 'inquiry'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    punishment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'explained', 'completed', 'dismissed'),
        defaultValue: 'pending'
    },
    user_response: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sender_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = PartnerIntervention;
