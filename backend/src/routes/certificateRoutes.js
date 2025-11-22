const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  generateCourseCertificate,
  getCertificate,
  getMyCertificates,
  getCourseCertificates,
  revokeCertificate,
  downloadCertificate,
  checkCertificateAvailability
} = require('../controllers/certificateController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         certificateId:
 *           type: string
 *           description: Unique certificate identifier
 *         student:
 *           type: string
 *           description: Student ID
 *         course:
 *           type: string
 *           description: Course ID
 *         enrollment:
 *           type: string
 *           description: Enrollment ID
 *         completionDate:
 *           type: string
 *           format: date-time
 *         finalScore:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         instructorName:
 *           type: string
 *         courseName:
 *           type: string
 *         studentName:
 *           type: string
 *         isRevoked:
 *           type: boolean
 *         revokedAt:
 *           type: string
 *           format: date-time
 *         revokeReason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/certificates/generate/{enrollmentId}:
 *   get:
 *     summary: Generate and download certificate for completed course
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Certificate PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Course not completed
 *       403:
 *         description: Access denied
 *       404:
 *         description: Enrollment not found
 */

/**
 * @swagger
 * /api/v1/certificates/{certificateId}:
 *   get:
 *     summary: Get certificate details (for verification)
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     certificate:
 *                       $ref: '#/components/schemas/Certificate'
 *       404:
 *         description: Certificate not found
 */

/**
 * @swagger
 * /api/v1/certificates/student/my-certificates:
 *   get:
 *     summary: Get all certificates for logged-in student
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of certificates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certificate'
 */

/**
 * @swagger
 * /api/v1/certificates/course/{courseId}:
 *   get:
 *     summary: Get all certificates for a course (instructor/admin)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of certificates
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/v1/certificates/{certificateId}/revoke:
 *   patch:
 *     summary: Revoke a certificate (admin only)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Course completion invalidated due to plagiarism"
 *     responses:
 *       200:
 *         description: Certificate revoked successfully
 *       400:
 *         description: Certificate already revoked
 *       404:
 *         description: Certificate not found
 */

/**
 * @swagger
 * /api/v1/certificates/{certificateId}/download:
 *   get:
 *     summary: Download certificate PDF
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Certificate revoked
 *       404:
 *         description: Certificate not found
 */

/**
 * @swagger
 * /api/v1/certificates/check/{enrollmentId}:
 *   get:
 *     summary: Check if certificate is available for enrollment
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isAvailable:
 *                       type: boolean
 *                     certificateExists:
 *                       type: boolean
 *                     certificateId:
 *                       type: string
 *                     progress:
 *                       type: number
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 */

// Public routes
router.get('/:certificateId', getCertificate);
router.get('/:certificateId/download', downloadCertificate);

// Protected routes
router.use(protect);

router.get('/generate/:enrollmentId', generateCourseCertificate);
router.get('/student/my-certificates', getMyCertificates);
router.get('/check/:enrollmentId', checkCertificateAvailability);
router.get('/course/:courseId', getCourseCertificates);

// Admin only
router.patch('/:certificateId/revoke', restrictTo('super_admin', 'org_admin'), revokeCertificate);

module.exports = router;
