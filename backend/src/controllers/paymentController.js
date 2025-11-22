const SSLCommerzPayment = require('sslcommerz-lts');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const emailService = require('../services/emailService');

// SSLCommerz configuration
const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.NODE_ENV === 'production'; // true for live, false for sandbox

/**
 * @desc    Initiate payment for course enrollment
 * @route   POST /api/v1/payments/initiate
 * @access  Private (Student)
 */
exports.initiatePayment = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if course is free
    if (!course.pricing || course.pricing.price === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'This course is free. No payment required.'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        status: 'error',
        message: 'Already enrolled in this course'
      });
    }

    // Get user details
    const user = await User.findById(userId);

    // Generate unique transaction ID
    const tran_id = `TXN-${Date.now()}-${userId}`;

    // Prepare payment data
    const data = {
      total_amount: course.pricing.price,
      currency: course.pricing.currency || 'BDT',
      tran_id: tran_id,
      success_url: `${process.env.BACKEND_URL}/api/v1/payments/success`,
      fail_url: `${process.env.BACKEND_URL}/api/v1/payments/fail`,
      cancel_url: `${process.env.BACKEND_URL}/api/v1/payments/cancel`,
      ipn_url: `${process.env.BACKEND_URL}/api/v1/payments/ipn`,
      shipping_method: 'NO',
      product_name: course.title,
      product_category: 'Online Course',
      product_profile: 'digital-goods',
      cus_name: user.name,
      cus_email: user.email,
      cus_add1: user.address || 'N/A',
      cus_city: user.city || 'Dhaka',
      cus_state: user.state || 'Dhaka',
      cus_postcode: user.postcode || '1000',
      cus_country: user.country || 'Bangladesh',
      cus_phone: user.phone || '01700000000',
      value_a: courseId.toString(), // Store courseId for callback
      value_b: userId.toString(),    // Store userId for callback
      value_c: '',
      value_d: ''
    };

    // Initialize SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    // Initiate payment
    const apiResponse = await sslcz.init(data);

    if (apiResponse.status === 'SUCCESS') {
      res.status(200).json({
        status: 'success',
        message: 'Payment session initiated',
        data: {
          gatewayUrl: apiResponse.GatewayPageURL,
          transactionId: tran_id,
          sessionKey: apiResponse.sessionkey
        }
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to initiate payment',
        error: apiResponse
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Payment initiation failed',
      error: error.message
    });
  }
};

/**
 * @desc    Handle successful payment
 * @route   POST /api/v1/payments/success
 * @access  Public (SSLCommerz callback)
 */
exports.paymentSuccess = async (req, res) => {
  try {
    const {
      tran_id,
      val_id,
      amount,
      card_type,
      store_amount,
      card_no,
      bank_tran_id,
      status,
      tran_date,
      currency,
      card_issuer,
      card_brand,
      card_issuer_country,
      value_a: courseId,
      value_b: userId
    } = req.body;

    // Validate payment with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validationResponse = await sslcz.validate({ val_id });

    if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
      // Create enrollment
      const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
        enrolledAt: new Date(),
        status: 'active',
        payment: {
          amount: parseFloat(amount),
          currency: currency,
          paymentMethod: card_type || 'card',
          transactionId: tran_id,
          paidAt: new Date(tran_date)
        },
        enrollmentSource: 'self'
      });

      // Update course enrollment count
      await Course.findByIdAndUpdate(courseId, {
        $inc: { 'statistics.totalEnrollments': 1 }
      });

      // Send payment confirmation and enrollment emails
      try {
        const user = await User.findById(userId);
        const course = await Course.findById(courseId).populate('instructor', 'name email');

        if (user && course) {
          // Send payment confirmation email
          await emailService.sendPaymentConfirmation(user, {
            _id: enrollment._id,
            transactionId: tran_id,
            amount: amount,
            currency: currency,
            createdAt: new Date(tran_date)
          }, course);

          // Send enrollment confirmation email
          await emailService.sendEnrollmentConfirmation(user, course);
        }
      } catch (emailError) {
        console.error('Failed to send payment/enrollment emails:', emailError);
        // Don't fail the request if email fails
      }

      // Redirect to success page
      res.redirect(`${process.env.FRONTEND_URL}/payment/success?enrollment=${enrollment._id}&course=${courseId}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=validation_failed`);
    }
  } catch (error) {
    console.error('Payment success handling error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=server_error`);
  }
};

/**
 * @desc    Handle failed payment
 * @route   POST /api/v1/payments/fail
 * @access  Public (SSLCommerz callback)
 */
exports.paymentFail = async (req, res) => {
  try {
    const { tran_id, value_a: courseId } = req.body;

    console.log('Payment failed for transaction:', tran_id);

    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?transaction=${tran_id}&course=${courseId}`);
  } catch (error) {
    console.error('Payment fail handling error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=unknown`);
  }
};

/**
 * @desc    Handle cancelled payment
 * @route   POST /api/v1/payments/cancel
 * @access  Public (SSLCommerz callback)
 */
exports.paymentCancel = async (req, res) => {
  try {
    const { tran_id, value_a: courseId } = req.body;

    console.log('Payment cancelled for transaction:', tran_id);

    res.redirect(`${process.env.FRONTEND_URL}/payment/cancelled?transaction=${tran_id}&course=${courseId}`);
  } catch (error) {
    console.error('Payment cancel handling error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancelled?reason=unknown`);
  }
};

/**
 * @desc    Handle IPN (Instant Payment Notification)
 * @route   POST /api/v1/payments/ipn
 * @access  Public (SSLCommerz IPN)
 */
exports.paymentIPN = async (req, res) => {
  try {
    const { tran_id, status, value_a: courseId, value_b: userId } = req.body;

    console.log('IPN received for transaction:', tran_id, 'Status:', status);

    // You can add additional processing here if needed
    // For example, sending notifications, updating analytics, etc.

    res.status(200).json({
      status: 'success',
      message: 'IPN received'
    });
  } catch (error) {
    console.error('IPN handling error:', error);
    res.status(500).json({
      status: 'error',
      message: 'IPN processing failed'
    });
  }
};

/**
 * @desc    Verify payment status
 * @route   GET /api/v1/payments/verify/:transactionId
 * @access  Private
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find enrollment with this transaction ID
    const enrollment = await Enrollment.findOne({
      'payment.transactionId': transactionId
    }).populate('course', 'title thumbnail')
      .populate('user', 'name email');

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment transaction not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        enrollment,
        paymentDetails: enrollment.payment
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's payment history
 * @route   GET /api/v1/payments/history
 * @access  Private
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get enrollments with payment information
    const enrollments = await Enrollment.find({
      user: userId,
      'payment.transactionId': { $exists: true }
    })
      .populate('course', 'title thumbnail instructor')
      .sort({ 'payment.paidAt': -1 })
      .skip(skip)
      .limit(limit);

    const total = await Enrollment.countDocuments({
      user: userId,
      'payment.transactionId': { $exists: true }
    });

    res.status(200).json({
      status: 'success',
      data: {
        payments: enrollments.map(e => ({
          enrollmentId: e._id,
          course: e.course,
          payment: e.payment,
          enrolledAt: e.enrolledAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

/**
 * @desc    Refund payment (Admin only)
 * @route   POST /api/v1/payments/refund/:enrollmentId
 * @access  Private (Admin)
 */
exports.refundPayment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { reason } = req.body;

    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment not found'
      });
    }

    if (!enrollment.payment || !enrollment.payment.transactionId) {
      return res.status(400).json({
        status: 'error',
        message: 'No payment found for this enrollment'
      });
    }

    // Initialize SSLCommerz for refund
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    const refundData = {
      bank_tran_id: enrollment.payment.transactionId,
      refund_amount: enrollment.payment.amount,
      refund_remarks: reason || 'Refund requested by admin',
      refe_id: `REF-${Date.now()}`
    };

    // Initiate refund
    const refundResponse = await sslcz.initiateRefund(refundData);

    if (refundResponse.status === 'success') {
      // Update enrollment status
      enrollment.status = 'dropped';
      enrollment.payment.refunded = true;
      enrollment.payment.refundedAt = new Date();
      enrollment.payment.refundReason = reason;
      await enrollment.save();

      res.status(200).json({
        status: 'success',
        message: 'Refund initiated successfully',
        data: refundResponse
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Refund failed',
        error: refundResponse
      });
    }
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Refund processing failed',
      error: error.message
    });
  }
};
