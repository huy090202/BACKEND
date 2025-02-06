const { Router } = require('express');
const router = Router();

const maintenanceController = require("../controllers/maintenance.controller");
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post("/create", [deserializeUser, restrictTo(["Quản trị viên"])], maintenanceController.createMaintenanceHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["Quản trị viên", "Kỹ thuật viên"])], maintenanceController.updateMaintenanceByIdHandler);
router.patch("/change-status/:id", [deserializeUser, restrictTo(["Quản trị viên", "Kỹ thuật viên"])], maintenanceController.changeMaintenanceStatusHandler);
router.delete("/delete/:id", deserializeUser, maintenanceController.deleteMaintenanceByIdHandler);
router.get("/get/:id", deserializeUser, maintenanceController.getMaintenanceByIdHandler);
router.get("/all", deserializeUser, maintenanceController.getAllMaintenancesHandler);
router.get("/get-all", [deserializeUser, restrictTo(["Kỹ thuật viên"])], maintenanceController.getAllMaintenancesByTechHandler);

// Public - tất cả đơn bảo dưỡng của 1 người dùng
router.get("/me", deserializeUser, maintenanceController.allMaintenancesHandler);
router.get("/history/:user_id", [deserializeUser, restrictTo(["Kỹ thuật viên"])], maintenanceController.allMaintenancesHistoryHandler);

module.exports = router;