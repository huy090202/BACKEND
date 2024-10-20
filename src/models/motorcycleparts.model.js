'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MotorcycleParts extends Model {
        static associate(models) {
            // 1 linh kiện xe máy thuộc về 1 nhà sản xuất
            MotorcycleParts.belongsTo(models.Manufacturer, {
                foreignKey: 'manufacturer_id',
                as: 'manufacturer',
            });

            // 1 linh kiện xe máy thuộc về 1 danh mục
            MotorcycleParts.belongsTo(models.Category, {
                foreignKey: 'category_id',
                as: 'category',
            });

            // 1 linh kiện xe máy có nhiều số lượng trong kho
            MotorcycleParts.hasMany(models.Stock, {
                foreignKey: 'part_id',
                as: 'stocks',
            });

            // 1 linh kiện xe máy có nhiều hình ảnh
            MotorcycleParts.hasMany(models.PartImage, {
                foreignKey: 'part_id',
                as: 'images',
            });

            // 1 linh kiện xe máy có nhiều chi tiết bảo dưỡng
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
            defaultValue: DataTypes.UUIDV4,
        },
        part_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        part_price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Tuổi thọ trung bình của linh kiện
        average_life: {
            type: DataTypes.INTEGER,
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
            allowNull: false,
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