const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    current_streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    longest_streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    discipline_score: {
        type: DataTypes.INTEGER,
        defaultValue: 50
    },
    is_onboarded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    avatar_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    privacy_settings: {
        type: DataTypes.JSON,
        defaultValue: { 
            show_goals: true, 
            show_tasks: true, 
            show_workouts: true, 
            show_analytics: true, 
            show_achievements: true 
        }
    },
    google_refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    google_drive_folder_link: {
        type: DataTypes.STRING,
        allowNull: true
    },
<<<<<<< HEAD
    is_in_exam_mode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
=======
    resource_drive_folder_link: {
        type: DataTypes.STRING,
        allowNull: true
>>>>>>> 967e9d650e66339fafbd8efee6709b1e51f9ff39
    }
}, {
    timestamps: true
});

module.exports = User;
