const cron = require('node-cron');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const emailService = require('./emailService');

/**
 * Initialize the reminder service
 * Schedules the cron job to run checkReminders daily
 */
const initialize = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily course reminder check...');
    try {
      await checkReminders();
      console.log('✅ Daily course reminder check completed.');
    } catch (error) {
      console.error('❌ Error during daily reminder check:', error);
    }
  });

  console.log('📅 Reminder Service initialized (Schedule: Daily at 00:00)');
};

/**
 * Main function to check and send reminders
 */
const checkReminders = async () => {
  // 1. Find all courses that have active reminders configured
  const courses = await Course.find({
    'settings.reminders': { 
      $elemMatch: { 
        active: true, 
        via: 'email' // Currently only supporting email
      } 
    }
  }).select('title settings.reminders');

  console.log(`Found ${courses.length} courses with active reminders.`);

  for (const course of courses) {
    const activeReminders = course.settings.reminders.filter(r => r.active && r.via === 'email');

    for (const reminder of activeReminders) {
      await processReminder(course, reminder);
    }
  }
};

/**
 * Process a specific reminder rule for a course
 * @param {Object} course 
 * @param {Object} reminder 
 */
const processReminder = async (course, reminder) => {
  if (reminder.type.startsWith('expiry_')) {
    await processExpiryReminder(course, reminder);
  }
  // Other types like 'enrollment' or 'completion' are usually event-driven
  // and might be handled by event listeners, not this cron job.
};

/**
 * Handle expiry-based reminders (e.g. 3 days before expiry)
 */
const processExpiryReminder = async (course, reminder) => {
  let daysBefore = 0;
  
  // Parse the type to get days (active_3days -> 3)
  if (reminder.type === 'expiry_3days') daysBefore = 3;
  else if (reminder.type === 'expiry_1day') daysBefore = 1;
  else return; // Unknown expiry type

  // Calculate the target date window
  // We want to find enrollments where accessExpiresAt is between [Target Start, Target End]
  // Target: Now + daysBefore
  const now = new Date();
  const targetDateStart = new Date(now);
  targetDateStart.setDate(now.getDate() + daysBefore);
  targetDateStart.setHours(0, 0, 0, 0);

  const targetDateEnd = new Date(targetDateStart);
  targetDateEnd.setHours(23, 59, 59, 999);

  // Find enrollments expiring on that specific day
  const enrollments = await Enrollment.find({
    course: course._id,
    status: 'active',
    accessExpiresAt: {
      $gte: targetDateStart,
      $lte: targetDateEnd
    }
  }).populate('user', 'name email');

  if (enrollments.length > 0) {
    console.log(`[${course.title}] Found ${enrollments.length} students expiring in ${daysBefore} days.`);
    
    for (const enrollment of enrollments) {
      if (!enrollment.user || !enrollment.user.email) continue;

      try {
        await emailService.sendCourseReminderEmail(
          enrollment.user,
          course,
          reminder.message || "Your course access is expiring soon.",
          `${daysBefore} Days Until Expiry`
        );
      } catch (err) {
        console.error(`Failed to send reminder to ${enrollment.user.email}:`, err.message);
      }
    }
  }
};

module.exports = {
  initialize,
  checkReminders // Exported for testing/manual triggering if needed
};
