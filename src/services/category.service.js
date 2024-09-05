const { omit } = require('lodash');
const db = require('../models/index');

// Create Category
const createCategory = async (data) => {
    const category = await db.Category.create(data);
    return omit(category.toJSON(), ['createdAt', 'updatedAt']);
};

// Find Category By Name
const findCategoryByName = async (name) => {
    const category = await db.Category.findOne({ where: { name } });
    return category;
};

// Find Categories
const findCategories = async ({ status, offset, limit }) => {
    const categories = await db.Category.findAndCountAll({
        where: status,
        offset,
        limit
    });
    return categories;
};

// Update Category Status
const updateCategory = async (id, status) => {
    return await db.Category.update({ active: status }, { where: { id } });
};

// Find Category By Id
const findCategoryById = async (id) => {
    const category = await db.Category.findOne({ where: { id } });
    return category;
};

// Delete Category By Id
const deleteCategoryById = async (id) => {
    return await db.Category.destroy({ where: { id } });
};

// Update Category By Id
const updateCategoryById = async (id, data) => {
    try {
        const category = await findCategoryById(id);
        if (!category) return null;

        await category.update(data);
        return category;
    } catch (e) {
        console.error('Error updating category:', e);
        throw new Error('Failed to update category');
    }
};

module.exports = {
    createCategory,
    findCategoryByName,
    findCategories,
    updateCategory,
    findCategoryById,
    deleteCategoryById,
    updateCategoryById
}