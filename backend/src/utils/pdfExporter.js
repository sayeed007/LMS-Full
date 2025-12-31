const PDFDocument = require('pdfkit');
const { formatDateForCSV, formatTimeForCSV } = require('./csvExporter');

/**
 * PDF Export Utility
 * Generates formatted PDF reports with tables and statistics
 */

// Helper function to add header to PDF
const addPDFHeader = (doc, title, subtitle = null) => {
  doc
    .fontSize(20)
    .fillColor('#1e40af')
    .text(title, 50, 50, { align: 'left' });

  if (subtitle) {
    doc
      .fontSize(12)
      .fillColor('#6b7280')
      .text(subtitle, 50, 80, { align: 'left' });
  }

  doc
    .fontSize(10)
    .fillColor('#9ca3af')
    .text(`Generated: ${new Date().toLocaleString()}`, 50, subtitle ? 100 : 80, { align: 'left' });

  // Add line separator
  doc
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .moveTo(50, subtitle ? 120 : 100)
    .lineTo(545, subtitle ? 120 : 100)
    .stroke();

  return subtitle ? 140 : 120;
};

// Helper function to add footer with page numbers
const addPDFFooter = (doc) => {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(9)
      .fillColor('#9ca3af')
      .text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
  }
};

// Helper function to draw a table
const drawTable = (doc, headers, rows, startY, options = {}) => {
  const {
    headerBg = '#f3f4f6',
    headerText = '#1f2937',
    rowText = '#374151',
    borderColor = '#e5e7eb',
    columnWidths = null,
    fontSize = 9
  } = options;

  const tableTop = startY;
  const tableLeft = 50;
  const tableWidth = 495;
  const rowHeight = 25;

  // Calculate column widths
  const colWidths = columnWidths || headers.map(() => tableWidth / headers.length);

  // Draw header row
  let currentX = tableLeft;
  doc
    .fillColor(headerBg)
    .rect(tableLeft, tableTop, tableWidth, rowHeight)
    .fill();

  doc.fillColor(headerText).fontSize(fontSize + 1);
  headers.forEach((header, i) => {
    doc.text(
      header,
      currentX + 5,
      tableTop + 8,
      { width: colWidths[i] - 10, align: 'left' }
    );
    currentX += colWidths[i];
  });

  // Draw rows
  let currentY = tableTop + rowHeight;
  rows.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (currentY + rowHeight > doc.page.height - 100) {
      doc.addPage();
      currentY = 50;

      // Redraw header on new page
      currentX = tableLeft;
      doc
        .fillColor(headerBg)
        .rect(tableLeft, currentY, tableWidth, rowHeight)
        .fill();

      doc.fillColor(headerText).fontSize(fontSize + 1);
      headers.forEach((header, i) => {
        doc.text(
          header,
          currentX + 5,
          currentY + 8,
          { width: colWidths[i] - 10, align: 'left' }
        );
        currentX += colWidths[i];
      });
      currentY += rowHeight;
    }

    // Alternate row colors
    if (rowIndex % 2 === 0) {
      doc
        .fillColor('#f9fafb')
        .rect(tableLeft, currentY, tableWidth, rowHeight)
        .fill();
    }

    // Draw row data
    currentX = tableLeft;
    doc.fillColor(rowText).fontSize(fontSize);
    row.forEach((cell, i) => {
      const cellText = cell !== null && cell !== undefined ? String(cell) : '';
      doc.text(
        cellText,
        currentX + 5,
        currentY + 8,
        { width: colWidths[i] - 10, align: 'left' }
      );
      currentX += colWidths[i];
    });

    // Draw row border
    doc
      .strokeColor(borderColor)
      .lineWidth(0.5)
      .moveTo(tableLeft, currentY + rowHeight)
      .lineTo(tableLeft + tableWidth, currentY + rowHeight)
      .stroke();

    currentY += rowHeight;
  });

  return currentY + 10;
};

// Helper function to add statistics summary
const addStatsSummary = (doc, stats, startY) => {
  const statsPerRow = 4;
  const statWidth = 120;
  const statHeight = 60;
  const spacing = 10;
  let currentX = 50;
  let currentY = startY;

  Object.entries(stats).forEach(([key, value], index) => {
    if (index > 0 && index % statsPerRow === 0) {
      currentX = 50;
      currentY += statHeight + spacing;
    }

    // Draw stat card
    doc
      .fillColor('#f3f4f6')
      .rect(currentX, currentY, statWidth, statHeight)
      .fill();

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .rect(currentX, currentY, statWidth, statHeight)
      .stroke();

    // Stat label
    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(
        key.replace(/([A-Z])/g, ' $1').trim().toUpperCase(),
        currentX + 10,
        currentY + 10,
        { width: statWidth - 20, align: 'left' }
      );

    // Stat value
    doc
      .fontSize(20)
      .fillColor('#1e40af')
      .text(
        String(value),
        currentX + 10,
        currentY + 28,
        { width: statWidth - 20, align: 'left' }
      );

    currentX += statWidth + spacing;
  });

  return currentY + statHeight + 20;
};

/**
 * Generate My Report PDF
 */
const generateMyReportPDF = (reportData, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="my-report-${Date.now()}.pdf"`);

  doc.pipe(res);

  // Add header
  let yPosition = addPDFHeader(doc, 'My Learning Report', 'Personal Dashboard');

  // Add statistics summary
  if (reportData.stats) {
    yPosition = addStatsSummary(doc, reportData.stats, yPosition);
  }

  // Add courses table
  if (reportData.courses && reportData.courses.length > 0) {
    doc
      .fontSize(14)
      .fillColor('#1f2937')
      .text('Course Progress', 50, yPosition);
    yPosition += 30;

    const headers = ['Course', 'Status', 'Completion', 'Time Spent', 'Enroll Date'];
    const rows = reportData.courses.map(course => [
      course.courseName || 'N/A',
      course.status || 'N/A',
      `${course.completionPercentage || 0}%`,
      formatTimeForCSV(course.timeSpent),
      formatDateForCSV(course.enrollDate)
    ]);

    const columnWidths = [150, 80, 70, 90, 105];
    yPosition = drawTable(doc, headers, rows, yPosition, { columnWidths });
  }

  addPDFFooter(doc);
  doc.end();
};

/**
 * Generate Individual Learner Report PDF
 */
const generateIndividualLearnerPDF = (reportData, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="learner-${reportData.learner?._id}-report-${Date.now()}.pdf"`);

  doc.pipe(res);

  // Add header
  const learnerName = reportData.learner?.name || 'Unknown Learner';
  let yPosition = addPDFHeader(doc, 'Individual Learner Report', learnerName);

  // Add learner info
  if (reportData.learner) {
    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .text(`Email: ${reportData.learner.email}`, 50, yPosition);
    yPosition += 30;
  }

  // Add statistics
  if (reportData.stats) {
    yPosition = addStatsSummary(doc, reportData.stats, yPosition);
  }

  // Add courses table
  if (reportData.courses && reportData.courses.length > 0) {
    doc
      .fontSize(14)
      .fillColor('#1f2937')
      .text('Enrolled Courses', 50, yPosition);
    yPosition += 30;

    const headers = ['Course', 'Status', 'Completion', 'Time Spent', 'Completed'];
    const rows = reportData.courses.map(course => [
      course.courseName || 'N/A',
      course.status || 'N/A',
      `${course.completionPercentage || 0}%`,
      formatTimeForCSV(course.timeSpent),
      formatDateForCSV(course.completedDate)
    ]);

    const columnWidths = [150, 80, 70, 90, 105];
    yPosition = drawTable(doc, headers, rows, yPosition, { columnWidths });
  }

  addPDFFooter(doc);
  doc.end();
};

/**
 * Generate Individual Course Report PDF
 */
const generateIndividualCoursePDF = (reportData, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const courseName = reportData.course?.title || 'Course Report';
  const fileName = courseName.replace(/[^a-z0-9]/gi, '-').toLowerCase();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="course-${fileName}-${Date.now()}.pdf"`);

  doc.pipe(res);

  // Add header
  let yPosition = addPDFHeader(doc, 'Individual Course Report', courseName);

  // Add statistics
  if (reportData.stats) {
    yPosition = addStatsSummary(doc, reportData.stats, yPosition);
  }

  // Add learners table
  if (reportData.users && reportData.users.length > 0) {
    doc
      .fontSize(14)
      .fillColor('#1f2937')
      .text('Enrolled Learners', 50, yPosition);
    yPosition += 30;

    const headers = ['Learner', 'Email', 'Status', 'Completion', 'Time Spent'];
    const rows = reportData.users.map(user => [
      user.name || 'N/A',
      user.email || 'N/A',
      user.status || 'N/A',
      `${user.completionPercentage || 0}%`,
      formatTimeForCSV(user.timeSpent)
    ]);

    const columnWidths = [120, 140, 80, 75, 80];
    yPosition = drawTable(doc, headers, rows, yPosition, { columnWidths });
  }

  addPDFFooter(doc);
  doc.end();
};

/**
 * Generate Multiple Learners Report PDF
 */
const generateMultipleLearnersPDF = (reportData, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="multiple-learners-report-${Date.now()}.pdf"`);

  doc.pipe(res);

  // Add header
  let yPosition = addPDFHeader(doc, 'Multiple Learners Report', 'Comprehensive Learner Analytics');

  // Add statistics
  if (reportData.summaryStats) {
    yPosition = addStatsSummary(doc, reportData.summaryStats, yPosition);
  }

  // Add learners table
  if (reportData.learners && reportData.learners.length > 0) {
    doc
      .fontSize(14)
      .fillColor('#1f2937')
      .text('Learner Overview', 50, yPosition);
    yPosition += 30;

    const headers = ['Learner', 'Email', 'Courses', 'Completed', 'In Progress'];
    const rows = reportData.learners.map(learner => [
      learner.name || 'N/A',
      learner.email || 'N/A',
      String(learner.coursesEnrolled || 0),
      String(learner.completed || 0),
      String(learner.inProgress || 0)
    ]);

    const columnWidths = [130, 150, 70, 75, 70];
    yPosition = drawTable(doc, headers, rows, yPosition, { columnWidths });
  }

  addPDFFooter(doc);
  doc.end();
};

/**
 * Generate Multiple Courses Report PDF
 */
const generateMultipleCoursesPDF = (reportData, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="multiple-courses-report-${Date.now()}.pdf"`);

  doc.pipe(res);

  // Add header
  let yPosition = addPDFHeader(doc, 'Multiple Courses Report', 'Comprehensive Course Analytics');

  // Add statistics
  if (reportData.stats) {
    yPosition = addStatsSummary(doc, reportData.stats, yPosition);
  }

  // Add courses table
  if (reportData.courses && reportData.courses.length > 0) {
    doc
      .fontSize(14)
      .fillColor('#1f2937')
      .text('Course Overview', 50, yPosition);
    yPosition += 30;

    const headers = ['Course', 'Learners', 'Yet to Start', 'In Progress', 'Completed'];
    const rows = reportData.courses.map(course => [
      course.name || 'N/A',
      String(course.totalLearners || 0),
      String(course.yetToStart || 0),
      String(course.inProgress || 0),
      String(course.completed || 0)
    ]);

    const columnWidths = [200, 74, 74, 74, 73];
    yPosition = drawTable(doc, headers, rows, yPosition, { columnWidths });
  }

  addPDFFooter(doc);
  doc.end();
};

/**
 * Generate Articles Report PDF
 */
const generateArticlesReportPDF = (reportData, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="articles-report-${Date.now()}.pdf"`);

  doc.pipe(res);

  // Add header
  let yPosition = addPDFHeader(doc, 'Articles Report', 'Article Analytics & Engagement');

  // Add statistics
  if (reportData.stats) {
    yPosition = addStatsSummary(doc, reportData.stats, yPosition);
  }

  // Add articles table
  if (reportData.articles && reportData.articles.length > 0) {
    doc
      .fontSize(14)
      .fillColor('#1f2937')
      .text('Article Overview', 50, yPosition);
    yPosition += 30;

    const headers = ['Article', 'Views', 'Comments', 'Rating', 'Yes/No'];
    const rows = reportData.articles.map(article => [
      article.name || 'N/A',
      String(article.totalViewer || 0),
      String(article.comments || 0),
      article.rating ? article.rating.toFixed(1) : '0.0',
      `${article.yesRating || 0}/${article.noRating || 0}`
    ]);

    const columnWidths = [220, 70, 70, 65, 70];
    yPosition = drawTable(doc, headers, rows, yPosition, { columnWidths });
  }

  addPDFFooter(doc);
  doc.end();
};

module.exports = {
  generateMyReportPDF,
  generateIndividualLearnerPDF,
  generateIndividualCoursePDF,
  generateMultipleLearnersPDF,
  generateMultipleCoursesPDF,
  generateArticlesReportPDF
};
