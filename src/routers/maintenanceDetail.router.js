const { Router } = require('express');
const router = Router();

const maintenanceDetailController = require("../controllers/maintenanceDetail.controller");
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post("/create", [deserializeUser, restrictTo(["Kỹ thuật viên"])], maintenanceDetailController.createMaintenanceDetailHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["Kỹ thuật viên"])], maintenanceDetailController.updateMaintenanceDetailByIdHandler);
router.delete("/delete/:id", [deserializeUser, restrictTo(["Kỹ thuật viên"])], maintenanceDetailController.deleteMaintenanceDetailByIdHandler);
router.get("/get/:id", deserializeUser, maintenanceDetailController.getMaintenanceDetailByIdHandler);
router.get("/all", deserializeUser, maintenanceDetailController.getAllMaintenanceDetailsHandler);

module.exports = router;