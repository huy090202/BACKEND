'use strict';

const { Model } = require('sequelize');
const { APPOINTMENT_STATUS_KEYS, APPOINTMENT_STATUS_CODE } = require('../utils/appointment');

module.exports = (sequelize, DataTypes) => {
    class Appointment extends Model {
        static associate(models) {
            // 1 lịch hẹn thuộc về 1 người dùng
            Appointment.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
            });

            // 1 lịch hẹn thuộc về 1 chiếc xe
            Appointment.belongsTo(models.Motor, {
                foreignKey: 'motor_id',
                as: 'motor',
            });
        }
    };

    Appointment.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        appointment_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM(...APPOINTMENT_STATUS_KEYS),
            defaultValue: APPOINTMENT_STATUS_CODE['PENDING'],
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        motor_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Appointment',
        tableName: 'Appointments',
    });

    return Appointment;
};