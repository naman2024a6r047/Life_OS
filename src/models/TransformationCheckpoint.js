const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TransformationCheckpoint = sequelize.define('TransformationCheckpoint', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    checkpoint_number: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    weight_kg: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    body_fat_pct: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true
    },
    waist_cm: {
        type: DataTypes.DECIMAL(5, 1),
        allowNull: true
    },
    chest_cm: {
        type: DataTypes.DECIMAL(5, 1),
        allowNull: true
    },
    arms_cm: {
        type: DataTypes.DECIMAL(5, 1),
        allowNull: true
    },
    muscle_mass_kg: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    bmi: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true
    },
    body_water_pct: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true
    },
    visceral_fat: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true
    },
    measurements: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    health_metrics: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    photo_front_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    photo_left_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    photo_right_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    photo_back_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = TransformationCheckpoint;
