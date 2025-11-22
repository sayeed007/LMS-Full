const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const emailService = require('../services/emailService');

/**
 * @desc    Get all assignments for a course
 * @route   GET /api/v1/courses/:courseId/assignments
 * @access  Private (Enrolled students, instructors, admins)
 */
exports.getAssignmentsByCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  // Check if user has access to the course
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Build query based on user role
  let query = { course: courseId };

  // Students only see published and active assignments
  if (req.user.role === 'student') {
    query.isPublished = true;
    query.isActive = true;
  }

  const assignments = await Assignment.find(query)
    .populate('instructor', 'name email avatar')
    .populate('course', 'title')
    .sort({ dueDate: 1 });

  // For students, include their submission status
  if (req.user.role === 'student') {
    const assignmentsWithStatus = assignments.map(assignment => {
      const studentSubmission = assignment.submissions.find(
        s => s.student.toString() === req.user.id
      );

      return {
        ...assignment.toObject(),
        mySubmission: studentSubmission || null,
        hasSubmitted: !!studentSubmission,
        canSubmit: !studentSubmission || assignment.maxAttempts > assignment.submissions.filter(
          s => s.student.toString() === req.user.id
        ).length
      };
    });

    return res.status(200).json({
      status: 'success',
      results: assignmentsWithStatus.length,
      data: assignmentsWithStatus
    });
  }

  res.status(200).json({
    status: 'success',
    results: assignments.length,
    data: assignments
  });
});

/**
 * @desc    Get assignment by ID
 * @route   GET /api/v1/assignments/:id
 * @access  Private
 */
exports.getAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('instructor', 'name email avatar')
    .populate('course', 'title')
    .populate('submissions.student', 'name email avatar');

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  // For students, only show their own submission
  if (req.user.role === 'student') {
    const studentSubmission = assignment.submissions.find(
      s => s.student._id.toString() === req.user.id
    );

    const assignmentData = assignment.toObject();
    delete assignmentData.submissions; // Remove all submissions

    return res.status(200).json({
      status: 'success',
      data: {
        ...assignmentData,
        mySubmission: studentSubmission || null,
        hasSubmitted: !!studentSubmission,
        canSubmit: !studentSubmission || assignment.maxAttempts > assignment.submissions.filter(
          s => s.student._id.toString() === req.user.id
        ).length
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: assignment
  });
});

/**
 * @desc    Submit assignment
 * @route   POST /api/v1/assignments/:id/submit
 * @access  Private (Student)
 */
exports.submitAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  // Check if student is enrolled in the course
  const enrollment = await Enrollment.findOne({
    course: assignment.course,
    user: req.user.id,
    status: 'active'
  });

  if (!enrollment) {
    return next(new AppError('You must be enrolled in this course to submit assignments', 403));
  }

  // Prepare submission data based on submission type
  const submissionData = {
    submissionType: assignment.submissionType
  };

  if (assignment.submissionType === 'text') {
    if (!req.body.content) {
      return next(new AppError('Text content is required for this assignment', 400));
    }
    submissionData.content = req.body.content;
  } else if (assignment.submissionType === 'file') {
    if (!req.body.files || req.body.files.length === 0) {
      return next(new AppError('At least one file is required for this assignment', 400));
    }
    submissionData.files = req.body.files;
  } else if (assignment.submissionType === 'url') {
    if (!req.body.url) {
      return next(new AppError('URL is required for this assignment', 400));
    }
    submissionData.url = req.body.url;
  } else if (assignment.submissionType === 'code') {
    if (!req.body.content) {
      return next(new AppError('Code content is required for this assignment', 400));
    }
    submissionData.content = req.body.content;
  }

  try {
    // Use the model's submitAssignment method
    await assignment.submitAssignment(req.user.id, submissionData);

    // Populate the student field for the response
    await assignment.populate('submissions.student', 'name email avatar');

    // Get the newly created submission
    const newSubmission = assignment.submissions[assignment.submissions.length - 1];

    // Send email notification to instructor
    try {
      const course = await Course.findById(assignment.course);
      const instructor = await assignment.populate('instructor', 'name email');

      if (instructor.instructor && instructor.instructor.email) {
        await emailService.sendAssignmentSubmittedEmail(
          instructor.instructor,
          { name: req.user.name, email: req.user.email, _id: req.user.id },
          { title: assignment.title, dueDate: assignment.dueDate },
          { _id: course._id, title: course.title }
        );
      }
    } catch (emailError) {
      console.error('Failed to send assignment submission email:', emailError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Assignment submitted successfully',
      data: {
        submission: newSubmission,
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          dueDate: assignment.dueDate,
          maxScore: assignment.maxScore
        }
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

/**
 * @desc    Grade assignment submission
 * @route   PATCH /api/v1/assignments/:id/submissions/:submissionId/grade
 * @access  Private (Instructor)
 */
exports.gradeSubmission = catchAsync(async (req, res, next) => {
  const { id, submissionId } = req.params;
  const { score, feedback } = req.body;

  const assignment = await Assignment.findById(id)
    .populate('course', 'title instructor')
    .populate('instructor', 'name email');

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  // Check if user is the instructor or admin
  const isInstructor = assignment.instructor._id.toString() === req.user.id;
  const isAdmin = ['org_admin', 'super_admin'].includes(req.user.role);

  if (!isInstructor && !isAdmin) {
    return next(new AppError('Only the course instructor can grade submissions', 403));
  }

  // Validate score
  if (score < 0 || score > assignment.maxScore) {
    return next(new AppError(`Score must be between 0 and ${assignment.maxScore}`, 400));
  }

  try {
    // Use the model's gradeSubmission method
    await assignment.gradeSubmission(
      submissionId,
      {
        score,
        maxScore: assignment.maxScore,
        feedback: feedback || ''
      },
      req.user.id
    );

    // Populate for response
    await assignment.populate('submissions.student', 'name email');

    // Get the graded submission
    const gradedSubmission = assignment.submissions.id(submissionId);

    // Send email notification to student
    try {
      const student = gradedSubmission.student;
      if (student && student.email) {
        await emailService.sendGradeNotificationEmail(
          student,
          { title: assignment.title, passingScore: assignment.passingScore, maxScore: assignment.maxScore },
          gradedSubmission.grade,
          { _id: assignment.course._id, title: assignment.course.title }
        );
      }
    } catch (emailError) {
      console.error('Failed to send grade notification email:', emailError);
    }

    res.status(200).json({
      status: 'success',
      message: 'Submission graded successfully',
      data: {
        submission: gradedSubmission,
        stats: assignment.getSubmissionStats()
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

/**
 * @desc    Get all submissions for an assignment (instructor view)
 * @route   GET /api/v1/assignments/:id/submissions
 * @access  Private (Instructor, Admin)
 */
exports.getAssignmentSubmissions = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'title instructor')
    .populate('instructor', 'name email')
    .populate('submissions.student', 'name email avatar')
    .populate('submissions.grade.gradedBy', 'name email');

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  // Check if user is the instructor or admin
  const isInstructor = assignment.instructor._id.toString() === req.user.id;
  const isAdmin = ['org_admin', 'super_admin'].includes(req.user.role);

  if (!isInstructor && !isAdmin) {
    return next(new AppError('Only the course instructor can view all submissions', 403));
  }

  // Get enrolled students to show who hasn't submitted
  const enrollments = await Enrollment.find({
    course: assignment.course._id,
    status: 'active'
  }).populate('user', 'name email avatar');

  const enrolledStudents = enrollments.map(e => e.user);

  // Find students who haven't submitted
  const submittedStudentIds = assignment.submissions.map(s => s.student._id.toString());
  const notSubmitted = enrolledStudents.filter(
    student => !submittedStudentIds.includes(student._id.toString())
  );

  res.status(200).json({
    status: 'success',
    data: {
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        dueDate: assignment.dueDate,
        maxScore: assignment.maxScore,
        passingScore: assignment.passingScore
      },
      submissions: assignment.submissions,
      notSubmitted: notSubmitted,
      stats: assignment.getSubmissionStats(),
      summary: {
        totalStudents: enrolledStudents.length,
        submitted: assignment.submissions.length,
        notSubmitted: notSubmitted.length,
        graded: assignment.submissions.filter(s => s.grade && s.grade.score !== undefined).length,
        pending: assignment.submissions.filter(s => !s.grade || s.grade.score === undefined).length
      }
    }
  });
});

/**
 * @desc    Get student's own submission
 * @route   GET /api/v1/assignments/:id/my-submission
 * @access  Private (Student)
 */
exports.getMySubmission = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  const submission = assignment.submissions.find(
    s => s.student.toString() === req.user.id
  );

  if (!submission) {
    return res.status(200).json({
      status: 'success',
      data: {
        hasSubmitted: false,
        submission: null,
        canSubmit: true,
        attemptsRemaining: assignment.maxAttempts
      }
    });
  }

  // Populate student data
  await assignment.populate('submissions.student', 'name email avatar');
  await assignment.populate('submissions.grade.gradedBy', 'name email');

  const studentSubmission = assignment.submissions.find(
    s => s.student._id.toString() === req.user.id
  );

  const studentSubmissions = assignment.submissions.filter(
    s => s.student._id.toString() === req.user.id
  );

  res.status(200).json({
    status: 'success',
    data: {
      hasSubmitted: true,
      submission: studentSubmission,
      canSubmit: studentSubmissions.length < assignment.maxAttempts,
      attemptsUsed: studentSubmissions.length,
      attemptsRemaining: assignment.maxAttempts - studentSubmissions.length,
      isGraded: !!(studentSubmission.grade && studentSubmission.grade.score !== undefined),
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        dueDate: assignment.dueDate,
        maxScore: assignment.maxScore,
        passingScore: assignment.passingScore
      }
    }
  });
});
