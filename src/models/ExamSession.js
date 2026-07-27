const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExamSession = sequelize.define('ExamSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    exam_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false
    },
    exam_type: {
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
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    total_study_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    completion_percentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    daily_study_target_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 4.0
    }
}, {
    timestamps: true
});

module.exports = ExamSession;
