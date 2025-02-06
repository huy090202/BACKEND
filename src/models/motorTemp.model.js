'use strict';

const { Model } = require('sequelize');

const { MOTOR_TYPE_CODE } = require('../utils/motorType')

module.exports = (sequelize, DataTypes) => {
    class MotorTemp extends Model {
        static associate(models) {
            // 1 xe máy tạm có nhiều hình ảnh
            MotorTemp.hasMany(models.MotorTempImage, {
                foreignKey: 'motorTemp_id',
                as: 'motorTempImages',
            });
        }
    };

    MotorTemp.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        // Email của người dùng khi tạo xe máy tạm
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Số điện thoại của người dùng khi tạo xe máy tạm
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
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
    }, {
        sequelize,
        modelName: 'MotorTemp',
        tableName: 'MotorTemps',
    });

    return MotorTemp;
}