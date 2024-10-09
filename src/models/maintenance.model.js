'use strict';

const { Model } = require('sequelize');

const { MAINTENANCE_STATUS_CODE, MAINTENANCE_STATUS_KEYS } = require('../utils/maintenance');

module.exports = (sequelize, DataTypes) => {
    class Maintenance extends Model {
        static associate(models) {
            // 1 đơn bảo dưỡng thuộc về 1 người dùng
            Maintenance.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
            });

            // 1 đơn bảo dưỡng có nhiều chi tiết bảo dưỡng
            Maintenance.hasMany(models.MaintenanceDetail, {
                foreignKey: 'maintenance_id',
                as: 'maintenanceDetails',
            });
        }
    };

    Maintenance.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        maintenance_code: {
            type: DataTypes.STRING(6),
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.ENUM(...MAINTENANCE_STATUS_KEYS),
            defaultValue: MAINTENANCE_STATUS_CODE['RECEIVING'],
            allowNull: false,
        },
        total_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        maintenance_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'Maintenance',
        tableName: 'Maintenances',
    });

    return Maintenance;
}