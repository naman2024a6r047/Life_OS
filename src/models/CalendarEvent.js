const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CalendarEvent = sequelize.define('CalendarEvent', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    block_type: {
        type: DataTypes.STRING,
        defaultValue: 'deep_work'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    time: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#4F46E5'
    }
});

module.exports = CalendarEvent;
