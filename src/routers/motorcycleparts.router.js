const { Router } = require('express');
const router = Router();

const motorcyclepartsController = require("../controllers/motorcycleparts.controller");
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');
const { upload } = require('../middleware/uploadImages');

router.post("/create", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], upload.single("part_image"), motorcyclepartsController.createMotorcyclepartsHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], upload.single("part_image"), motorcyclepartsController.updateMotorcyclepartsByIdHandler);
router.patch("/change-status/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], motorcyclepartsController.changeMotorcyclepartsStatusHandler);
router.delete("/delete/:id", [deserializeUser, restrictTo(["ADMIN"])], motorcyclepartsController.deleteMotorcyclepartsByIdHandler);
router.get("/get/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], motorcyclepartsController.getMotorcyclepartsByIdHandler);
router.get("/get-all", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], motorcyclepartsController.getAllMotorcyclepartsHandler);

// Public
router.get("/get", motorcyclepartsController.getMotorcyclepartsHandler)

module.exports = router;