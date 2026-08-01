const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SleepEntry = sequelize.define('SleepEntry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    bed_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    wake_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    sleep_quality: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 }
    },
    sleep_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, max: 100 }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    goal_met: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'SleepEntries',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'date']
        }
    ]
});

module.exports = SleepEntry;
