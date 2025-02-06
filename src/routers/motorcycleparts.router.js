const { Router } = require('express');
const router = Router();

const motorcyclepartsController = require("../controllers/motorcycleparts.controller");
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');
const { upload } = require('../middleware/uploadImages');

router.post("/create", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], upload.single("part_image"), motorcyclepartsController.createMotorcyclepartsHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], upload.single("part_image"), motorcyclepartsController.updateMotorcyclepartsByIdHandler);
router.patch("/change-status/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], motorcyclepartsController.changeMotorcyclepartsStatusHandler);
router.delete("/delete/:id", [deserializeUser, restrictTo(["Quản trị viên"])], motorcyclepartsController.deleteMotorcyclepartsByIdHandler);
router.get("/get/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], motorcyclepartsController.getMotorcyclepartsByIdHandler);
router.get("/get-all", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], motorcyclepartsController.getAllMotorcyclepartsHandler);

// Public
router.get("/get", motorcyclepartsController.getMotorcyclepartsHandler)
router.get("/all-by-category", motorcyclepartsController.allMotorcyclepartsByCategoryHandler)

module.exports = router;