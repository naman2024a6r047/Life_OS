const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CodingProfile = sequelize.define('CodingProfile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    github_username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    leetcode_username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    daily_coding_goal_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 2.0
    },
    total_hours_coded: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    portfolio_links: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    developer_info: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    timestamps: true
});

module.exports = CodingProfile;
