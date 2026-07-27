const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Penalty = sequelize.define('Penalty', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    challenge_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    severity: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        allowNull: false,
        defaultValue: 'Medium',
    },
    penalty_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    xp_deducted: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('Active', 'Acknowledged'),
        defaultValue: 'Active',
    }
}, {
    tableName: 'penalties',
    timestamps: true,
});

module.exports = Penalty;
