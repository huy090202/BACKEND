const { Router } = require('express');
const router = Router();

const orderController = require('../controllers/order.controller');
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post('/create', deserializeUser, orderController.createOrderHandler);
router.post('/callback', orderController.callbackOrderHandler);
router.get('/check/:app_trans_id', orderController.checkStatusPaymentHandler);
router.delete('/delete/:code', deserializeUser, orderController.deleteOrderHandler);
router.get('/tracking', deserializeUser, orderController.trackingOrderHandler);
router.patch("/:id/order-status", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], orderController.changeOrderStatusHandler);
router.patch("/:orderCode/payment-status", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], orderController.changePaymentStatusHandler);
router.get("/all", [deserializeUser, restrictTo(["Nhân viên", "Kỹ thuật viên", "Thu ngân", "Quản trị viên"])], orderController.allOrdersHandler);

// Public
router.get("/get-all", deserializeUser, orderController.getAllOrdersHandler);

module.exports = router;