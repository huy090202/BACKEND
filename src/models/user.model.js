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
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            // Delete space before and after string
            set(value) {
                this.setDataValue('firstname', value.trim());
            },
            // Get value without space before and after string
            get() {
                const rawValue = this.getDataValue('firstname');
                return rawValue ? rawValue.trim() : null;
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('lastname', value.trim());
            },
            get() {
                const rawValue = this.getDataValue('lastname');
                return rawValue ? rawValue.trim() : null;
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            },
            set(value) {
                this.setDataValue('email', value.trim());
            },
            get() {
                const rawValue = this.getDataValue('email');
                return rawValue ? rawValue.trim() : null;
            }
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isNumeric: true
            },
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
        avtive: {
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
