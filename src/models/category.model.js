'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
            // 1 danh mục có nhiều linh kiện xe máy
            Category.hasMany(models.MotorcycleParts, {
                foreignKey: 'category_id',
                as: 'motorcycleParts',
            });
        }
    };

    Category.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    }, {
        sequelize,
        modelName: 'Category',
        tableName: 'Categories',
    });

    return Category;
}