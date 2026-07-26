const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Challenge = sequelize.define('Challenge', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    visibility: {
        type: DataTypes.ENUM('public', 'private', 'friends'),
        defaultValue: 'public'
    },
    difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard', 'iron'),
        defaultValue: 'medium'
    },
    penalty_mode: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'easy'
    },
    penalty_rule: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#6366F1'
    },
    icon: {
        type: DataTypes.STRING,
        defaultValue: 'target'
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'paused', 'failed'),
        defaultValue: 'active'
    }
}, {
    timestamps: true
});

module.exports = Challenge;
