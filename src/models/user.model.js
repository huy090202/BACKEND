'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // 1 người dùng có thể có nhiều xe máy
            User.hasMany(models.Motor, {
                foreignKey: 'user_id',
                as: 'motors',
            });

            // 1 người dùng có thể có nhiều đơn hàng
            User.hasMany(models.Order, {
                foreignKey: 'user_id',
                as: 'orders',
            });

            // 1 người dùng có thể có nhiều đơn bảo dưỡng
            User.hasMany(models.Maintenance, {
                foreignKey: 'user_id',
                as: 'maintenances',
            });

            // 1 người dùng có thể có nhiều lịch hẹn
            User.hasMany(models.Appointment, {
                foreignKey: 'user_id',
                as: 'appointments',
            });
        }
    };

    User.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gender: {
            type: DataTypes.ENUM,
            values: ['MALE', "FEMALE", 'OTHER'],
            defaultValue: 'OTHER'
        },
        address: {
            type: DataTypes.STRING,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        role: {
            type: DataTypes.ENUM,
            values: ['USER', 'STAFF', 'TECH', 'CASHIER', 'ADMIN'],
            defaultValue: 'USER',
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
    });

    return User;
};
