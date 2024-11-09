'use strict';

const { Model } = require('sequelize');

const { MOTOR_TYPE_CODE } = require('../utils/motorType')

module.exports = (sequelize, DataTypes) => {
    class Motor extends Model {
        static associate(models) {
            // 1 xe máy thuộc về 1 người dùng
            Motor.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
            });

            // 1 xe máy có nhiều hình ảnh
            Motor.hasMany(models.MotorImage, {
                foreignKey: 'motor_id',
                as: 'motorImages',
            });

            // 1 xe máy có nhiều lịch hẹn
            Motor.hasMany(models.Appointment, {
                foreignKey: 'motor_id',
                as: 'appointments',
            });
        }
    };

    Motor.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        motor_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        motor_type: {
            type: DataTypes.ENUM(...Object.values(MOTOR_TYPE_CODE)),
            allowNull: false,
            defaultValue: MOTOR_TYPE_CODE['UNDERBONE'],
        },
        motor_color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Biển số xe
        license_plate: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Số máy
        engine_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Số khung
        chassis_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        motor_model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_part: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Motor',
        tableName: 'Motors',
    });

    return Motor;
}