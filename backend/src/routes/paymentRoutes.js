const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/initiate', protect, paymentController.initiatePayment);
router.get('/verify/:transactionId', protect, paymentController.verifyPayment);
router.get('/history', protect, paymentController.getPaymentHistory);

// Admin only routes
router.post('/refund/:enrollmentId', protect, restrictTo('admin', 'super_admin'), paymentController.refundPayment);

// Public routes (SSLCommerz callbacks - no authentication required)
router.post('/success', paymentController.paymentSuccess);
router.post('/fail', paymentController.paymentFail);
router.post('/cancel', paymentController.paymentCancel);
router.post('/ipn', paymentController.paymentIPN);

module.exports = router;
