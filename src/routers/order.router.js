const { Router } = require('express');
const router = Router();

const orderController = require('../controllers/order.controller');
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post('/create', deserializeUser, orderController.createOrderHandler);
router.post('/callback', orderController.callbackOrderHandler);
router.delete('/delete/:code', deserializeUser, orderController.deleteOrderHandler);
router.get('/tracking', deserializeUser, orderController.trackingOrderHandler);
// router.patch("/:id/change-status", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], orderController.changeOrderStatusHandler);
// router.patch("/change-payment-status/:orderCode", orderController.changePaymentStatusHandler);
// router.get("/get-all", deserializeUser, orderController.getAllOrdersHandler);

// ADMIN
// router.get("/all", [deserializeUser, restrictTo(["Nhân viên", "Kỹ thuật viên", "Thu ngân", "Quản trị viên"])], orderController.allOrdersHandler);

module.exports = router;