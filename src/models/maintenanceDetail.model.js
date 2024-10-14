'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MaintenanceDetail extends Model {
        static associate(models) {
            // 1 chi tiết bảo dưỡng thuộc về 1 đơn bảo dưỡng
            MaintenanceDetail.belongsTo(models.Maintenance, {
                foreignKey: 'maintenance_id',
                as: 'maintenance',
            });

            // 1 chi tiết bảo dưỡng thuộc về 1 linh kiện xe máy
            MaintenanceDetail.belongsTo(models.MotorcycleParts, {
                foreignKey: 'part_id',
                as: 'part',
            });
        }
    };

    MaintenanceDetail.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Giá linh kiện xe máy theo số lượng
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        // Phần trăm mòn của linh kiện xe máy
        wear_percentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        maintenance_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        part_id: {
            type: DataTypes.UUID,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'MaintenanceDetail',
        tableName: 'MaintenanceDetails',
    });

    return MaintenanceDetail;
};