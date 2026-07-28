const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ResourceCategory = sequelize.define('ResourceCategory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        defaultValue: '📁'
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#8B5CF6'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ResourceCategories',
    timestamps: true
});

module.exports = ResourceCategory;
