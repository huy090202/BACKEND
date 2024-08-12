'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MotorcycleParts extends Model {
        static associate(models) {
            // A part belongs to a manufacturer
            MotorcycleParts.belongsTo(models.Manufacturer, {
                foreignKey: 'manufacturer_id',
                as: 'manufacturer',
            });

            // A part belongs to a category
            MotorcycleParts.belongsTo(models.Category, {
                foreignKey: 'category_id',
                as: 'category',
            });

            // A part can have many stocks
            MotorcycleParts.hasMany(models.Stock, {
                foreignKey: 'part_id',
                as: 'stocks',
            });

            // A part can have many images
            MotorcycleParts.hasMany(models.PartImage, {
                foreignKey: 'part_id',
                as: 'images',
            });

            // A part can have many order details
            MotorcycleParts.hasMany(models.OrderDetail, {
                foreignKey: 'part_id',
                as: 'orderDetails',
            });

            // A part can have many maintenance details
            MotorcycleParts.hasMany(models.MaintenanceDetail, {
                foreignKey: 'part_id',
                as: 'maintenanceDetails',
            });
        }
    };

    MotorcycleParts.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        part_name: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('part_name', value.trim());
            },
            get() {
                const rawValue = this.getDataValue('part_name');
                return rawValue ? rawValue.trim() : null;
            }
        },
        part_price: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        part_image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        manufacturer_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'MotorcycleParts',
        tableName: 'MotorcycleParts',
    });

    return MotorcycleParts;
}