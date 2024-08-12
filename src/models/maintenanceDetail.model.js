'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MaintenanceDetail extends Model {
        static associate(models) {
            // A maintenance detail belongs to a maintenance
            MaintenanceDetail.belongsTo(models.Maintenance, {
                foreignKey: 'maintenance_id',
                as: 'maintenance',
            });

            // A maintenance detail belongs to a motorcycle parts
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
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        part_cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        total_part_cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        labor_cost: {
            type: DataTypes.DECIMAL(10, 2),
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