'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // A user can have many motors
            User.hasMany(models.Motor, {
                foreignKey: 'user_id',
                as: 'motors',
            });

            // A user can have many orders
            User.hasMany(models.Order, {
                foreignKey: 'user_id',
                as: 'orders',
            });

            // A user can have many maintenances
            User.hasMany(models.Maintenance, {
                foreignKey: 'user_id',
                as: 'maintenances',
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
            values: ['USER', 'STAFF', 'ADMIN'],
            defaultValue: 'USER',
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
    });

    return User;
};
