'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
            // A category has many motorcycle parts
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
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('name', value.trim());
            },
            get() {
                const rawValue = this.getDataValue('name');
                return rawValue ? rawValue.trim() : null;
            }
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