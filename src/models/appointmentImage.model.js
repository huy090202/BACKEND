'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AppointmentImage extends Model {
        static associate(models) {
            // 1 hình ảnh lịch hẹn thuộc về 1 lịch hẹn
            AppointmentImage.belongsTo(models.Appointment, {
                foreignKey: 'appointment_id',
                as: 'appointment',
            });
        }
    };

    AppointmentImage.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        appointment_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'AppointmentImage',
        tableName: 'AppointmentImages',
    });

    return AppointmentImage;
}