const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { generateCertificate, generateCertificateId } = require('../services/certificateService');

/**
 * @desc    Generate and download certificate for completed course
 * @route   GET /api/v1/certificates/generate/:enrollmentId
 * @access  Private (student who completed the course)
 */
exports.generateCourseCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    // Find enrollment with populated data
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student', 'name email')
      .populate('course', 'title instructor');

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment not found'
      });
    }

    // Check if user is the student
    if (enrollment.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only generate certificates for your own enrollments'
      });
    }

    // Check if course is completed
    if (!enrollment.completedAt || enrollment.progress < 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Course must be 100% completed to generate certificate'
      });
    }

    // Get instructor details
    const instructor = await User.findById(enrollment.course.instructor).select('name');
    if (!instructor) {
      return res.status(404).json({
        status: 'error',
        message: 'Instructor not found'
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      student: enrollment.student._id,
      course: enrollment.course._id
    });

    // If certificate doesn't exist, create one
    if (!certificate) {
      const certificateId = generateCertificateId();

      certificate = await Certificate.create({
        certificateId,
        student: enrollment.student._id,
        course: enrollment.course._id,
        enrollment: enrollment._id,
        completionDate: enrollment.completedAt,
        finalScore: enrollment.finalScore || null,
        instructorName: instructor.name,
        courseName: enrollment.course.title,
        studentName: enrollment.student.name
      });
    }

    // Check if certificate is revoked
    if (certificate.isRevoked) {
      return res.status(403).json({
        status: 'error',
        message: 'This certificate has been revoked',
        revokeReason: certificate.revokeReason
      });
    }

    // Generate PDF
    const pdfBuffer = await generateCertificate({
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      completionDate: certificate.completionDate,
      instructorName: certificate.instructorName,
      score: certificate.finalScore,
      certificateId: certificate.certificateId
    });

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate-${certificate.certificateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generating certificate',
      error: error.message
    });
  }
};

/**
 * @desc    Get certificate by ID (for verification)
 * @route   GET /api/v1/certificates/:certificateId
 * @access  Public
 */
exports.getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('student', 'name email')
      .populate('course', 'title')
      .select('-__v');

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        certificate: {
          certificateId: certificate.certificateId,
          studentName: certificate.studentName,
          courseName: certificate.courseName,
          completionDate: certificate.completionDate,
          finalScore: certificate.finalScore,
          instructorName: certificate.instructorName,
          isRevoked: certificate.isRevoked,
          revokedAt: certificate.revokedAt,
          revokeReason: certificate.revokeReason,
          issuedAt: certificate.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching certificate',
      error: error.message
    });
  }
};

/**
 * @desc    Get all certificates for a student
 * @route   GET /api/v1/certificates/student/my-certificates
 * @access  Private
 */
exports.getMyCertificates = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Certificate.countDocuments({
      student: req.user._id,
      isRevoked: false
    });

    const certificates = await Certificate.find({
      student: req.user._id,
      isRevoked: false
    })
      .populate('course', 'title thumbnail')
      .select('-__v')
      .sort('-completionDate')
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: certificates.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: certificates
    });
  } catch (error) {
    console.error('Get my certificates error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching certificates',
      error: error.message
    });
  }
};

/**
 * @desc    Get all certificates for a course (instructor/admin)
 * @route   GET /api/v1/certificates/course/:courseId
 * @access  Private (instructor/admin)
 */
exports.getCourseCertificates = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check permissions (instructor of course or admin)
    if (
      req.user.role !== 'super_admin' &&
      req.user.role !== 'org_admin' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view certificates for this course'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Certificate.countDocuments({ course: courseId });

    const certificates = await Certificate.find({ course: courseId })
      .populate('student', 'name email')
      .select('-__v')
      .sort('-completionDate')
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: certificates.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: certificates
    });
  } catch (error) {
    console.error('Get course certificates error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching course certificates',
      error: error.message
    });
  }
};

/**
 * @desc    Revoke a certificate (admin only)
 * @route   PATCH /api/v1/certificates/:certificateId/revoke
 * @access  Private (admin only)
 */
exports.revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found'
      });
    }

    if (certificate.isRevoked) {
      return res.status(400).json({
        status: 'error',
        message: 'Certificate is already revoked'
      });
    }

    certificate.isRevoked = true;
    certificate.revokedAt = Date.now();
    certificate.revokedBy = req.user._id;
    certificate.revokeReason = reason || 'No reason provided';

    await certificate.save();

    res.status(200).json({
      status: 'success',
      message: 'Certificate revoked successfully',
      data: {
        certificate
      }
    });
  } catch (error) {
    console.error('Revoke certificate error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error revoking certificate',
      error: error.message
    });
  }
};

/**
 * @desc    Download certificate PDF by certificate ID
 * @route   GET /api/v1/certificates/:certificateId/download
 * @access  Public (anyone with the certificate ID can download)
 */
exports.downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found'
      });
    }

    if (certificate.isRevoked) {
      return res.status(403).json({
        status: 'error',
        message: 'This certificate has been revoked and cannot be downloaded'
      });
    }

    // Generate PDF
    const pdfBuffer = await generateCertificate({
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      completionDate: certificate.completionDate,
      instructorName: certificate.instructorName,
      score: certificate.finalScore,
      certificateId: certificate.certificateId
    });

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate-${certificate.certificateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error downloading certificate',
      error: error.message
    });
  }
};

/**
 * @desc    Check if certificate is available for enrollment
 * @route   GET /api/v1/certificates/check/:enrollmentId
 * @access  Private
 */
exports.checkCertificateAvailability = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment not found'
      });
    }

    // Check if user is the student
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const isAvailable = enrollment.completedAt && enrollment.progress === 100;

    // Check if certificate exists
    const certificate = await Certificate.findOne({
      student: enrollment.student,
      course: enrollment.course
    });

    res.status(200).json({
      status: 'success',
      data: {
        isAvailable,
        certificateExists: !!certificate,
        certificateId: certificate?.certificateId || null,
        progress: enrollment.progress,
        completedAt: enrollment.completedAt
      }
    });
  } catch (error) {
    console.error('Check certificate availability error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking certificate availability',
      error: error.message
    });
  }
};
