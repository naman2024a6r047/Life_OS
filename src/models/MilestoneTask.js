const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MilestoneTask = sequelize.define('MilestoneTask', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    milestone_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    priority: {
        type: DataTypes.ENUM('P1', 'P2', 'P3'),
        defaultValue: 'P1'
    },
    energy_level: {
        type: DataTypes.ENUM('high', 'medium', 'low'),
        defaultValue: 'high'
    },
    estimated_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 45
    },
    hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    actual_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = MilestoneTask;
