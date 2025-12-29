const Enrollment = require('../../../src/models/Enrollment');

const seedEnrollments = async (courses, lessons, users) => {
  // Get students for enrollment
  const students = users.filter(user => user.role === 'student');
  const publishedCourses = courses.filter(course => course.isPublished);

  const enrollments = [];
  const enrollmentTracker = new Set(); // To prevent duplicates

  // Create realistic enrollment scenarios
  for (const student of students) {
    // Each student enrolls in 2-4 courses
    const numberOfCourses = Math.floor(Math.random() * 3) + 2;
    const selectedCourses = shuffleArray([...publishedCourses]).slice(0, numberOfCourses);

    for (const course of selectedCourses) {
      // Create unique key to prevent duplicates
      const enrollmentKey = `${student._id}-${course._id}`;
      if (enrollmentTracker.has(enrollmentKey)) {
        continue; // Skip if already enrolled
      }
      enrollmentTracker.add(enrollmentKey);
      const courseLessons = lessons.filter(lesson =>
        lesson.course.toString() === course._id.toString() && lesson.isPublished
      );

      // Create enrollment with varying progress levels
      const enrollmentDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Last 60 days
      const progressPercentage = Math.random() * 100;

      // Determine completion status based on progress
      let status = 'active';
      if (progressPercentage >= 100) {
        status = 'completed';
      } else if (progressPercentage < 10 && Math.random() > 0.7) {
        status = 'suspended';
      }

      // Calculate which lessons should be completed based on progress
      const completedLessonCount = Math.floor((progressPercentage / 100) * courseLessons.length);
      const completedLessons = courseLessons.slice(0, completedLessonCount);

      // Generate lesson progress
      const lessonProgress = courseLessons.map((lesson, index) => {
        const isCompleted = index < completedLessonCount;
        const timeSpent = isCompleted
          ? Math.floor(Math.random() * ((lesson.duration || 30) * 60)) + ((lesson.duration || 30) * 30) // 30-90 seconds per minute
          : Math.floor(Math.random() * ((lesson.duration || 30) * 30)); // Partial time for incomplete

        return {
          lesson: lesson._id,
          completed: isCompleted,
          timeSpent: timeSpent,
          lastAccessed: isCompleted
            ? new Date(enrollmentDate.getTime() + Math.random() * Date.now() - enrollmentDate.getTime())
            : Math.random() > 0.5 ? new Date(enrollmentDate.getTime() + Math.random() * Date.now() - enrollmentDate.getTime()) : null,
          attempts: isCompleted ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2),
          notes: generateRandomNotes(lesson.title, isCompleted)
        };
      });

      // Calculate total time spent
      const totalTimeSpent = lessonProgress.reduce((total, progress) => total + progress.timeSpent, 0);

      // Determine if student should have a certificate
      const hasCertificate = status === 'completed' && course.settings?.certificate;

      const enrollment = {
        user: student._id,
        course: course._id,
        enrolledAt: enrollmentDate,
        status: status,
        progress: {
          completedLessons: completedLessons.map(lesson => lesson._id),
          totalLessons: courseLessons.length,
          completionPercentage: Math.round(progressPercentage),
          timeSpent: totalTimeSpent,
          lastActivity: status === 'suspended'
            ? new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) // 1-14 days ago
            : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)   // 1-7 days ago
        },
        lessonProgress: lessonProgress,
        quizAttempts: [], // Will be populated by quiz attempts if needed
        assignments: [], // Will be populated by assignment submissions if needed
        certificate: hasCertificate ? {
          issued: true,
          issuedAt: new Date(enrollmentDate.getTime() + Math.random() * (Date.now() - enrollmentDate.getTime())),
          certificateId: `CERT-${student._id.toString().slice(-6)}-${course._id.toString().slice(-6)}-${Date.now().toString().slice(-6)}`
        } : {
          issued: false
        },
        rating: status === 'completed' ? {
          value: Math.floor(Math.random() * 2) + 4, // 4-5 stars for completed courses
          review: generateRandomReview(course.title, true),
          reviewDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        } : null,
        paymentStatus: 'completed', // Assume all payments are completed for seeding
        enrollmentType: 'individual',
        completedAt: status === 'completed'
          ? new Date(enrollmentDate.getTime() + Math.random() * (Date.now() - enrollmentDate.getTime()))
          : null
      };

      enrollments.push(enrollment);
    }
  }

  // Add some additional scenarios

  // Student who dropped out early
  const dropoutStudent = students[0];
  const dropoutCourse = publishedCourses[0];
  const dropoutKey = `${dropoutStudent._id}-${dropoutCourse._id}`;

  // Only add if not already enrolled
  if (!enrollmentTracker.has(dropoutKey)) {
    enrollmentTracker.add(dropoutKey);
    const dropoutLessons = lessons.filter(lesson =>
      lesson.course.toString() === dropoutCourse._id.toString()
    );

    enrollments.push({
    user: dropoutStudent._id,
    course: dropoutCourse._id,
    enrolledAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    status: 'dropped',
    progress: {
      completedLessons: [dropoutLessons[0]._id],
      totalLessons: dropoutLessons.length,
      completionPercentage: Math.round((1 / dropoutLessons.length) * 100),
      timeSpent: 1800, // 30 minutes
      lastActivity: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
    },
    lessonProgress: [{
      lesson: dropoutLessons[0]._id,
      completed: true,
      timeSpent: 1800,
      lastAccessed: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      attempts: 1
    }],
    paymentStatus: 'completed',
    enrollmentType: 'individual'
  });
  }

  // High achiever with multiple completed courses
  const achiever = students[1];
  for (let i = 0; i < Math.min(3, publishedCourses.length); i++) {
    const achieverCourse = publishedCourses[i];
    const achieverKey = `${achiever._id}-${achieverCourse._id}`;

    // Only add if not already enrolled
    if (!enrollmentTracker.has(achieverKey)) {
      enrollmentTracker.add(achieverKey);
      const achieverLessons = lessons.filter(lesson =>
        lesson.course.toString() === achieverCourse._id.toString()
      );

      enrollments.push({
      user: achiever._id,
      course: achieverCourse._id,
      enrolledAt: new Date(Date.now() - (90 - i * 30) * 24 * 60 * 60 * 1000),
      status: 'completed',
      progress: {
        completedLessons: achieverLessons.map(lesson => lesson._id),
        totalLessons: achieverLessons.length,
        completionPercentage: 100,
        timeSpent: achieverLessons.reduce((total, lesson) => total + (lesson.duration || 30) * 60, 0),
        lastActivity: new Date(Date.now() - (60 - i * 20) * 24 * 60 * 60 * 1000)
      },
      lessonProgress: achieverLessons.map(lesson => ({
        lesson: lesson._id,
        completed: true,
        timeSpent: (lesson.duration || 30) * 60 + Math.floor(Math.random() * 600), // Extra time for thorough learning
        lastAccessed: new Date(Date.now() - (60 - i * 20) * 24 * 60 * 60 * 1000),
        attempts: 1,
        notes: `Excellent content on ${lesson.title}. Very helpful for understanding the concepts.`
      })),
      certificate: {
        issued: true,
        issuedAt: new Date(Date.now() - (50 - i * 15) * 24 * 60 * 60 * 1000),
        certificateId: `CERT-${achiever._id.toString().slice(-6)}-${achieverCourse._id.toString().slice(-6)}-${Date.now().toString().slice(-6)}`
      },
      rating: {
        value: 5,
        review: generateRandomReview(achieverCourse.title, true),
        reviewDate: new Date(Date.now() - (45 - i * 15) * 24 * 60 * 60 * 1000)
      },
      paymentStatus: 'completed',
      enrollmentType: 'individual',
      completedAt: new Date(Date.now() - (50 - i * 15) * 24 * 60 * 60 * 1000)
    });
    }
  }

  const createdEnrollments = await Enrollment.insertMany(enrollments);

  // Update course enrollment stats
  const Course = require('../../../src/models/Course');
  for (const course of courses) {
    const courseEnrollments = createdEnrollments.filter(enrollment =>
      enrollment.course.toString() === course._id.toString()
    );

    const totalEnrollments = courseEnrollments.length;
    const completedEnrollments = courseEnrollments.filter(e => e.status === 'completed').length;
    const avgRating = courseEnrollments
      .filter(e => e.rating?.value)
      .reduce((sum, e, _, arr) => sum + e.rating.value / arr.length, 0);

    await Course.findByIdAndUpdate(course._id, {
      'stats.totalEnrollments': totalEnrollments,
      'stats.totalCompletions': completedEnrollments,
      'stats.averageRating': avgRating || 0,
      'rating.count': courseEnrollments.filter(e => e.rating).length,
      'rating.average': avgRating || 0
    });
  }

  return createdEnrollments;
};

// Helper functions
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateRandomNotes(lessonTitle, isCompleted) {
  if (!isCompleted || Math.random() > 0.3) return ''; // 30% chance of having notes

  const noteTemplates = [
    `Great explanation of ${lessonTitle}. Need to practice more.`,
    `Key takeaways from ${lessonTitle}: [Important concepts covered]`,
    `Questions about ${lessonTitle} - will revisit this section.`,
    `Excellent examples in ${lessonTitle}. Very clear instructions.`,
    `${lessonTitle} - completed successfully. Moving to next lesson.`,
    `Found ${lessonTitle} challenging but rewarding. Good progression.`,
    `${lessonTitle} concepts are now clear. Ready for practical application.`
  ];

  return noteTemplates[Math.floor(Math.random() * noteTemplates.length)];
}

function generateRandomReview(courseTitle, isPositive) {
  const positiveReviews = [
    `Excellent course! ${courseTitle} exceeded my expectations. The instructor explained complex concepts clearly and the practical examples were very helpful.`,
    `I really enjoyed ${courseTitle}. The content was well-structured and I learned a lot. Would definitely recommend to others.`,
    `${courseTitle} is a fantastic course. Great balance of theory and practice. The assignments helped reinforce the learning.`,
    `Outstanding content in ${courseTitle}. The instructor's expertise shows throughout the course. Very satisfied with my learning experience.`,
    `${courseTitle} provided exactly what I was looking for. Clear explanations, good pacing, and practical skills I can apply immediately.`,
    `Highly recommend ${courseTitle}! Well-organized content and excellent teaching style. Money well spent.`,
    `${courseTitle} is comprehensive and engaging. Learned valuable skills that I'm already using in my work.`
  ];

  const neutralReviews = [
    `${courseTitle} was okay. Some sections were better than others. Overall a decent learning experience.`,
    `${courseTitle} covered the basics well. Could use more advanced topics but good for beginners.`,
    `Completed ${courseTitle}. Content was as expected, nothing particularly outstanding but solid fundamentals.`
  ];

  if (isPositive && Math.random() > 0.2) {
    return positiveReviews[Math.floor(Math.random() * positiveReviews.length)];
  } else {
    return neutralReviews[Math.floor(Math.random() * neutralReviews.length)];
  }
}

module.exports = { seedEnrollments };