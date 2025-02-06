const { Router } = require('express');
const router = Router();

const motorTempImageController = require('../controllers/motorTempImage.controller');
const { upload } = require('../middleware/uploadImages');

router.post("/create", upload.array("image_url"), motorTempImageController.createMotorTempImageHandler);
// router.put("/update/:id", upload.single("image_url"), motorTempImageController.updateMotorTempImageByIdHandler);
// router.delete("/delete/:id", motorTempImageController.deleteMotorTempImageByIdHandler);
// router.get("/get/:id", motorTempImageController.getMotorTempImageByIdHandler);
router.get("/all", motorTempImageController.getAllMotorTempImagesHandler);

module.exports = router;