const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Resource = sequelize.define('Resource', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    category_id: {
        type: DataTypes.UUID,
        allowNull: true  // null = no category (Uncategorized)
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    drive_file_id: {
        type: DataTypes.STRING,
        allowNull: true  // Google Drive file ID
    },
    drive_web_view_link: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    drive_web_content_link: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    mime_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    file_size: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Resources',
    timestamps: true
});

module.exports = Resource;
