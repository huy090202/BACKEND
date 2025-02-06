'use strict';

const { Model } = require('sequelize');
const { APPOINTMENT_STATUS_CODE } = require('../utils/appointment');

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

            // 1 lịch hẹn có thể có nhiều hình ảnh
            Appointment.hasMany(models.AppointmentImage, {
                foreignKey: 'appointment_id',
                as: 'images',
            });

            // 1 lịch hẹn tương ứng với 1 đơn bảo dưỡng
            Appointment.hasOne(models.Maintenance, {
                foreignKey: 'appointment_id',
                as: 'maintenance',
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
        // Ngày hẹn
        appointment_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        // Thời gian hẹn đến thời gian kết thúc hẹn là khoản thời gian để hoàn thành bảo dưỡng
        // Thời gian hẹn
        appointment_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        // Nội dung hẹn
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Hình ảnh tình trạng xe đính kèm
        image_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM(...Object.values(APPOINTMENT_STATUS_CODE)),
            defaultValue: APPOINTMENT_STATUS_CODE['PENDING'],
        },
        // Ngày đặt lịch hẹn
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