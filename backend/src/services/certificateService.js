const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Certificate Service
 * Handles PDF certificate generation for course completions
 */

/**
 * Generate a certificate PDF for course completion
 * @param {Object} data - Certificate data
 * @param {string} data.studentName - Name of the student
 * @param {string} data.courseName - Name of the course
 * @param {Date} data.completionDate - Date of course completion
 * @param {string} data.instructorName - Name of the instructor
 * @param {number} data.score - Final score (optional)
 * @param {string} data.certificateId - Unique certificate ID
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generateCertificate = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      // Buffer to store PDF
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Get page dimensions
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // Add decorative border
      doc
        .lineWidth(3)
        .strokeColor('#2563eb') // Blue color
        .rect(30, 30, pageWidth - 60, pageHeight - 60)
        .stroke();

      // Add inner border
      doc
        .lineWidth(1)
        .strokeColor('#60a5fa') // Light blue
        .rect(40, 40, pageWidth - 80, pageHeight - 80)
        .stroke();

      // Add decorative corner elements
      const cornerSize = 50;
      doc
        .strokeColor('#2563eb')
        .lineWidth(2);

      // Top-left corner
      doc.moveTo(50, 50).lineTo(50 + cornerSize, 50).stroke();
      doc.moveTo(50, 50).lineTo(50, 50 + cornerSize).stroke();

      // Top-right corner
      doc.moveTo(pageWidth - 50, 50).lineTo(pageWidth - 50 - cornerSize, 50).stroke();
      doc.moveTo(pageWidth - 50, 50).lineTo(pageWidth - 50, 50 + cornerSize).stroke();

      // Bottom-left corner
      doc.moveTo(50, pageHeight - 50).lineTo(50 + cornerSize, pageHeight - 50).stroke();
      doc.moveTo(50, pageHeight - 50).lineTo(50, pageHeight - 50 - cornerSize).stroke();

      // Bottom-right corner
      doc.moveTo(pageWidth - 50, pageHeight - 50).lineTo(pageWidth - 50 - cornerSize, pageHeight - 50).stroke();
      doc.moveTo(pageWidth - 50, pageHeight - 50).lineTo(pageWidth - 50, pageHeight - 50 - cornerSize).stroke();

      // Add logo or header (if you have a logo file, you can add it here)
      // doc.image('path/to/logo.png', centerX - 50, 70, { width: 100 });

      let yPosition = 100;

      // Add "CERTIFICATE" title
      doc
        .fontSize(40)
        .fillColor('#1e3a8a') // Dark blue
        .font('Helvetica-Bold')
        .text('CERTIFICATE', 0, yPosition, {
          align: 'center',
          width: pageWidth
        });

      yPosition += 50;

      // Add "OF ACHIEVEMENT" subtitle
      doc
        .fontSize(20)
        .fillColor('#4b5563') // Gray
        .font('Helvetica')
        .text('OF ACHIEVEMENT', 0, yPosition, {
          align: 'center',
          width: pageWidth
        });

      yPosition += 50;

      // Add "This is to certify that" text
      doc
        .fontSize(14)
        .fillColor('#6b7280')
        .font('Helvetica')
        .text('This is to certify that', 0, yPosition, {
          align: 'center',
          width: pageWidth
        });

      yPosition += 35;

      // Add student name (larger and bold)
      doc
        .fontSize(32)
        .fillColor('#1f2937') // Dark gray
        .font('Helvetica-Bold')
        .text(data.studentName, 0, yPosition, {
          align: 'center',
          width: pageWidth
        });

      yPosition += 45;

      // Add underline below name
      const nameUnderlineWidth = 300;
      doc
        .strokeColor('#2563eb')
        .lineWidth(1)
        .moveTo(centerX - nameUnderlineWidth / 2, yPosition)
        .lineTo(centerX + nameUnderlineWidth / 2, yPosition)
        .stroke();

      yPosition += 30;

      // Add completion text
      doc
        .fontSize(14)
        .fillColor('#6b7280')
        .font('Helvetica')
        .text('has successfully completed the course', 0, yPosition, {
          align: 'center',
          width: pageWidth
        });

      yPosition += 35;

      // Add course name (bold)
      doc
        .fontSize(24)
        .fillColor('#1e3a8a')
        .font('Helvetica-Bold')
        .text(data.courseName, 100, yPosition, {
          align: 'center',
          width: pageWidth - 200
        });

      yPosition += 60;

      // Add completion date and score (if provided) on the same line
      const leftColumnX = 150;
      const rightColumnX = pageWidth - 250;

      // Completion Date
      doc
        .fontSize(12)
        .fillColor('#6b7280')
        .font('Helvetica')
        .text('Date of Completion', leftColumnX, yPosition, {
          width: 200,
          align: 'center'
        });

      doc
        .fontSize(14)
        .fillColor('#1f2937')
        .font('Helvetica-Bold')
        .text(formatDate(data.completionDate), leftColumnX, yPosition + 20, {
          width: 200,
          align: 'center'
        });

      // Certificate ID
      doc
        .fontSize(12)
        .fillColor('#6b7280')
        .font('Helvetica')
        .text('Certificate ID', rightColumnX, yPosition, {
          width: 200,
          align: 'center'
        });

      doc
        .fontSize(14)
        .fillColor('#1f2937')
        .font('Helvetica-Bold')
        .text(data.certificateId, rightColumnX, yPosition + 20, {
          width: 200,
          align: 'center'
        });

      // If score is provided, add it in the middle
      if (data.score !== undefined && data.score !== null) {
        const middleX = centerX - 100;
        doc
          .fontSize(12)
          .fillColor('#6b7280')
          .font('Helvetica')
          .text('Final Score', middleX, yPosition, {
            width: 200,
            align: 'center'
          });

        doc
          .fontSize(14)
          .fillColor('#1f2937')
          .font('Helvetica-Bold')
          .text(`${data.score}%`, middleX, yPosition + 20, {
            width: 200,
            align: 'center'
          });
      }

      yPosition += 80;

      // Add instructor signature line
      if (data.instructorName) {
        const signatureY = pageHeight - 140;
        const signatureLineWidth = 200;

        doc
          .strokeColor('#2563eb')
          .lineWidth(1)
          .moveTo(centerX - signatureLineWidth / 2, signatureY)
          .lineTo(centerX + signatureLineWidth / 2, signatureY)
          .stroke();

        doc
          .fontSize(14)
          .fillColor('#1f2937')
          .font('Helvetica-Bold')
          .text(data.instructorName, 0, signatureY + 10, {
            align: 'center',
            width: pageWidth
          });

        doc
          .fontSize(11)
          .fillColor('#6b7280')
          .font('Helvetica')
          .text('Course Instructor', 0, signatureY + 30, {
            align: 'center',
            width: pageWidth
          });
      }

      // Add footer text
      const footerY = pageHeight - 70;
      doc
        .fontSize(10)
        .fillColor('#9ca3af')
        .font('Helvetica')
        .text('This certificate is awarded in recognition of successful course completion.', 0, footerY, {
          align: 'center',
          width: pageWidth
        });

      doc
        .fontSize(8)
        .text('Verify this certificate at: [Your LMS URL]/certificates/verify/' + data.certificateId, 0, footerY + 15, {
          align: 'center',
          width: pageWidth
        });

      // Finalize the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Format date to readable string
 * @param {Date} date
 * @returns {string} Formatted date
 */
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Generate a unique certificate ID
 * @returns {string} Certificate ID
 */
exports.generateCertificateId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `CERT-${timestamp}-${randomStr}`.toUpperCase();
};

/**
 * Save certificate to storage (optional - for future use)
 * This can be extended to save to cloud storage like S3 or Cloudinary
 * @param {Buffer} pdfBuffer
 * @param {string} certificateId
 * @returns {Promise<string>} File path or URL
 */
exports.saveCertificate = async (pdfBuffer, certificateId) => {
  // For now, we'll just return the buffer
  // In production, you might want to upload to S3, Cloudinary, etc.
  // const uploadsDir = path.join(__dirname, '../../uploads/certificates');
  // if (!fs.existsSync(uploadsDir)) {
  //   fs.mkdirSync(uploadsDir, { recursive: true });
  // }
  // const filePath = path.join(uploadsDir, `${certificateId}.pdf`);
  // fs.writeFileSync(filePath, pdfBuffer);
  // return filePath;

  return null; // Return null for now, PDF is sent directly to client
};
