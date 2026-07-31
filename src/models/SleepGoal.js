const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SleepGoal = sequelize.define('SleepGoal', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    daily_goal_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 480 // 8 hours
    },
    preferred_bed_time: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '23:00'
    },
    preferred_wake_time: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '07:00'
    },
    bed_reminder_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    wake_reminder_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'SleepGoals',
    timestamps: true
});

module.exports = SleepGoal;
