const { Router } = require('express');
const router = Router();

const motorImageController = require('../controllers/motorImage.controller');
const deserializeUser = require('../middleware/deserializeUser');
const { upload } = require('../middleware/uploadImages');

router.post("/create", deserializeUser, upload.single("image_url"), motorImageController.createMotorImageHandler);
router.put("/update/:id", deserializeUser, upload.single("image_url"), motorImageController.updateMotorImageByIdHandler);
router.delete("/delete/:id", deserializeUser, motorImageController.deleteMotorImageByIdHandler);
router.get("/get/:id", deserializeUser, motorImageController.getMotorImageByIdHandler);
router.get("/all", deserializeUser, motorImageController.getAllMotorImagesHandler);

module.exports = router;