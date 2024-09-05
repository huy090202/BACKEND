const categoryService = require("../services/category.service");

// Create Category
const createCategoryHandler = async (req, res) => {
    const { name, description, active } = req.body;
    if (!name) {
        return res.status(400).json({
            status: false,
            message: "Required fields must not be empty",
            data: {}
        })
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Active must be true or false"
        })
    }

    const existedCategory = await categoryService.findCategoryByName(name);
    if (existedCategory) {
        return res.status(400).json({
            status: false,
            message: "Category name already existed",
            data: {}
        })
    }

    const category = await categoryService.createCategory(req.body);
    return res.status(201).json({
        status: true,
        message: "Category created successfully",
        data: category
    })
};

// Update Category By Id
const updateCategoryByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        })
    }

    const { name, description, active } = req.body;
    if (!name) {
        return res.status(400).json({
            status: false,
            message: "Required fields must not be empty",
            data: {}
        })
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Active must be true or false"
        })
    }

    const existedCategory = await categoryService.findCategoryById(id);
    if (!existedCategory) {
        return res.status(404).json({
            status: false,
            message: `Category '${id}' does not existed`
        })
    }

    const category = await categoryService.updateCategoryById(id, req.body);
    return res.status(200).json({
        status: true,
        message: "Category was updated successfully",
        data: category
    })
};

// Change Category Status
const changeCategoryStatusHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        })
    }

    const existedCategory = await categoryService.findCategoryById(id);
    if (!existedCategory) {
        return res.status(404).json({
            status: false,
            message: `Category '${id}' does not existed`,
            data: {}
        })
    }

    const { active } = req.body;
    let activeVar = true;
    if (active === 'false' || active === false) activeVar = false;
    await categoryService.updateCategory(id, activeVar);

    return res.status(200).json({
        status: true,
        message: activeVar ? "Category was active successfully" : "Category was inactive successfully",
        data: {}
    })
};

// Delete Category By Id
const deleteCategoryByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        })
    }

    const category = await categoryService.deleteCategoryById(id);
    if (!category) {
        return res.status(404).json({
            status: false,
            message: `Category '${id}' does not existed`,
            data: {}
        })
    }

    return res.status(200).json({
        status: true,
        message: "Category was deleted successfully",
        data: {}
    })

};

// Get Category By Id
const getCategoryByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        })
    }

    const category = await categoryService.findCategoryById(id);
    if (!category) {
        return res.status(404).json({
            status: false,
            message: `Category '${id}' does not existed`,
        })
    }

    return res.status(200).json({
        status: true,
        message: "Success",
        data: category
    })
};

// Get All Categories
const getAllCategoriesHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let categories = [];
    if (active === 'true' || active === true)
        categories = await categoryService.findCategories({ status: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        categories = await categoryService.findCategories({ status: { active: false }, offset, limit: parseInt(limit) });
    else categories = await categoryService.findCategories({ status: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "Success",
        data: categories.rows,
        total: categories.count,
        page: parseInt(page),
        limit: parseInt(limit)
    })
};

// Public - Get Categories Active = true
const getCategoriesHandler = async (req, res) => {
    let categories = [];
    categories = await categoryService.findCategories({ status: { active: true } });
    return res.status(200).json({
        status: true,
        message: "Success",
        data: categories.rows,
        total: categories.count,
    })
};

module.exports = {
    createCategoryHandler,
    updateCategoryByIdHandler,
    changeCategoryStatusHandler,
    deleteCategoryByIdHandler,
    getCategoryByIdHandler,
    getAllCategoriesHandler,
    getCategoriesHandler
}