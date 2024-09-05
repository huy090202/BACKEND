const { Router } = require('express');
const router = Router();

const categoryController = require("../controllers/category.controller");
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post("/create", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], categoryController.createCategoryHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], categoryController.updateCategoryByIdHandler);
router.patch("/change-status/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], categoryController.changeCategoryStatusHandler);
router.delete("/delete/:id", [deserializeUser, restrictTo(["ADMIN"])], categoryController.deleteCategoryByIdHandler);
router.get("/get/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], categoryController.getCategoryByIdHandler);
router.get("/get-all", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], categoryController.getAllCategoriesHandler);

// Public
router.get("/get", categoryController.getCategoriesHandler)

module.exports = router;