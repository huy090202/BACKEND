const { Router } = require('express');
const router = Router();

const motorController = require("../controllers/motor.controller");
const deserializeUser = require('../middleware/deserializeUser');

router.post("/create", deserializeUser, motorController.createMotorHandler);
router.put("/update/:id", deserializeUser, motorController.updateMotorByIdHandler);
router.delete("/delete/:id", deserializeUser, motorController.deleteMotorByIdHandler);
router.get("/get/:id", deserializeUser, motorController.getMotorByIdHandler);
router.get("/all", deserializeUser, motorController.getAllMotorsHandler);

module.exports = router;