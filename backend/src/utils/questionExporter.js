/**
 * Question Export/Import Utilities
 *
 * Supports multiple formats: JSON, CSV, QTI (IMS Question & Test Interoperability)
 */

const { generateCSV, parseCSV } = require('./csvParser');

/**
 * Export questions to JSON format
 * @param {Array} questions - Array of question documents
 * @param {Object} options - Export options
 * @returns {Object} JSON export data
 */
const exportToJSON = (questions, options = {}) => {
  const {
    includeMetadata = true,
    includeIds = true,
    pretty = true
  } = options;

  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    questionCount: questions.length,
    questions: questions.map(q => formatQuestionForExport(q, { includeMetadata, includeIds }))
  };

  return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
};

/**
 * Import questions from JSON format
 * @param {String|Object} jsonData - JSON string or parsed object
 * @returns {Array} Array of question objects
 */
const importFromJSON = (jsonData) => {
  let data;

  if (typeof jsonData === 'string') {
    try {
      data = JSON.parse(jsonData);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  } else {
    data = jsonData;
  }

  // Handle different JSON structures
  if (Array.isArray(data)) {
    // Direct array of questions
    return data.map(q => sanitizeImportedQuestion(q));
  } else if (data.questions && Array.isArray(data.questions)) {
    // Wrapped in questions array
    return data.questions.map(q => sanitizeImportedQuestion(q));
  } else {
    throw new Error('Invalid JSON structure. Expected array of questions or object with questions array.');
  }
};

/**
 * Export questions to CSV format
 * @param {Array} questions - Array of question documents
 * @param {Object} options - Export options
 * @returns {String} CSV content
 */
const exportToCSV = (questions, options = {}) => {
  return generateCSV(questions, options);
};

/**
 * Import questions from CSV format
 * @param {String} csvContent - CSV file content
 * @returns {Array} Array of question objects
 */
const importFromCSV = (csvContent) => {
  const questions = parseCSV(csvContent);
  return questions.map(q => sanitizeImportedQuestion(q));
};

/**
 * Export questions to QTI format (IMS QTI 2.1)
 * @param {Array} questions - Array of question documents
 * @param {Object} options - Export options
 * @returns {String} QTI XML content
 */
const exportToQTI = (questions, options = {}) => {
  const {
    assessmentTitle = 'Question Bank Export',
    assessmentIdentifier = `qb_${Date.now()}`
  } = options;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2">\n';
  xml += `  <assessment ident="${escapeXML(assessmentIdentifier)}" title="${escapeXML(assessmentTitle)}">\n`;
  xml += '    <section>\n';

  questions.forEach((question, index) => {
    xml += questionToQTI(question, index + 1);
  });

  xml += '    </section>\n';
  xml += '  </assessment>\n';
  xml += '</questestinterop>\n';

  return xml;
};

/**
 * Convert single question to QTI format
 * @param {Object} question - Question object
 * @param {Number} index - Question index
 * @returns {String} QTI XML for question
 */
const questionToQTI = (question, index) => {
  const qid = question._id || `q${index}`;
  let xml = `      <item ident="${escapeXML(qid)}" title="Question ${index}">\n`;

  // Metadata
  xml += '        <itemmetadata>\n';
  xml += `          <qtimetadata>\n`;
  xml += `            <qtimetadatafield>\n`;
  xml += `              <fieldlabel>qmd_itemtype</fieldlabel>\n`;
  xml += `              <fieldentry>${escapeXML(question.type)}</fieldentry>\n`;
  xml += `            </qtimetadatafield>\n`;
  xml += `            <qtimetadatafield>\n`;
  xml += `              <fieldlabel>qmd_difficulty</fieldlabel>\n`;
  xml += `              <fieldentry>${escapeXML(question.difficulty || 'medium')}</fieldentry>\n`;
  xml += `            </qtimetadatafield>\n`;
  xml += `            <qtimetadatafield>\n`;
  xml += `              <fieldlabel>qmd_points</fieldlabel>\n`;
  xml += `              <fieldentry>${question.points || 1}</fieldentry>\n`;
  xml += `            </qtimetadatafield>\n`;
  xml += `          </qtimetadata>\n`;
  xml += '        </itemmetadata>\n';

  // Presentation (question text and choices)
  xml += '        <presentation>\n';
  xml += `          <material>\n`;
  xml += `            <mattext texttype="text/html"><![CDATA[${question.text || ''}]]></mattext>\n`;
  xml += `          </material>\n`;

  if (question.type === 'single-choice' || question.type === 'multiple-choice') {
    xml += `          <response_lid ident="response1" rcardinality="${question.type === 'multiple-choice' ? 'Multiple' : 'Single'}">\n`;
    xml += '            <render_choice>\n';

    (question.choices || []).forEach((choice, choiceIndex) => {
      const choiceId = choice._id || `choice${choiceIndex}`;
      xml += `              <response_label ident="${escapeXML(choiceId)}">\n`;
      xml += `                <material>\n`;
      xml += `                  <mattext texttype="text/html"><![CDATA[${choice.text || ''}]]></mattext>\n`;
      xml += `                </material>\n`;
      xml += `              </response_label>\n`;
    });

    xml += '            </render_choice>\n';
    xml += '          </response_lid>\n';
  }

  xml += '        </presentation>\n';

  // Response processing (correct answers)
  xml += '        <resprocessing>\n';
  xml += '          <outcomes>\n';
  xml += `            <decvar maxvalue="${question.points || 1}" minvalue="0" varname="SCORE" vartype="Decimal"/>\n`;
  xml += '          </outcomes>\n';

  if (question.choices && question.choices.length > 0) {
    const correctChoices = question.choices.filter(c => c.isCorrect);

    correctChoices.forEach(choice => {
      const choiceId = choice._id || choice.text;
      xml += '          <respcondition continue="No">\n';
      xml += '            <conditionvar>\n';
      xml += `              <varequal respident="response1">${escapeXML(choiceId)}</varequal>\n`;
      xml += '            </conditionvar>\n';
      xml += `            <setvar action="Set" varname="SCORE">${question.points || 1}</setvar>\n`;
      xml += '          </respcondition>\n';
    });
  }

  xml += '        </resprocessing>\n';

  // Feedback (explanation)
  if (question.explanation) {
    xml += '        <itemfeedback ident="general">\n';
    xml += '          <material>\n';
    xml += `            <mattext texttype="text/html"><![CDATA[${question.explanation}]]></mattext>\n`;
    xml += '          </material>\n';
    xml += '        </itemfeedback>\n';
  }

  xml += '      </item>\n';

  return xml;
};

/**
 * Format question for export (remove sensitive data)
 * @param {Object} question - Question document
 * @param {Object} options - Format options
 * @returns {Object} Formatted question
 */
const formatQuestionForExport = (question, options = {}) => {
  const { includeMetadata = true, includeIds = true } = options;

  const formatted = {
    text: question.text,
    type: question.type,
    difficulty: question.difficulty,
    points: question.points,
    timeLimit: question.timeLimit,
    tags: question.tags
  };

  if (includeIds) {
    formatted.id = question._id;
  }

  if (question.choices && question.choices.length > 0) {
    formatted.choices = question.choices.map(c => ({
      text: c.text,
      isCorrect: c.isCorrect
    }));
  }

  if (question.explanation) {
    formatted.explanation = question.explanation;
  }

  if (question.correctAnswer) {
    formatted.correctAnswer = question.correctAnswer;
  }

  if (includeMetadata) {
    formatted.metadata = {
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      createdBy: question.createdBy?.name || question.createdBy
    };
  }

  return formatted;
};

/**
 * Sanitize imported question (remove/normalize invalid data)
 * @param {Object} question - Imported question
 * @returns {Object} Sanitized question
 */
const sanitizeImportedQuestion = (question) => {
  const sanitized = {};

  // Required fields
  if (question.text) sanitized.text = question.text;
  if (question.type) sanitized.type = question.type;

  // Optional fields
  if (question.choices) {
    sanitized.choices = question.choices.map(c => ({
      text: c.text || '',
      isCorrect: Boolean(c.isCorrect)
    }));
  }

  if (question.correctAnswer) sanitized.correctAnswer = question.correctAnswer;
  if (question.explanation) sanitized.explanation = question.explanation;
  if (question.difficulty) sanitized.difficulty = question.difficulty;
  if (question.points !== undefined) sanitized.points = Number(question.points) || 1;
  if (question.timeLimit !== undefined) sanitized.timeLimit = Number(question.timeLimit) || 0;

  if (question.tags && Array.isArray(question.tags)) {
    sanitized.tags = question.tags.filter(t => typeof t === 'string');
  }

  // Remove internal/metadata fields
  delete sanitized._id;
  delete sanitized.id;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  delete sanitized.createdBy;
  delete sanitized.organization;
  delete sanitized.questionBank;
  delete sanitized.course;

  return sanitized;
};

/**
 * Escape XML special characters
 * @param {String} str
 * @returns {String} Escaped string
 */
const escapeXML = (str) => {
  if (!str) return '';

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Get export format from file extension or format string
 * @param {String} format - Format string or filename
 * @returns {String} Normalized format
 */
const getExportFormat = (format) => {
  const normalized = format.toLowerCase().trim();

  if (normalized.endsWith('.csv') || normalized === 'csv') return 'csv';
  if (normalized.endsWith('.json') || normalized === 'json') return 'json';
  if (normalized.endsWith('.xml') || normalized === 'xml' || normalized === 'qti') return 'qti';

  return 'json'; // Default
};

/**
 * Get MIME type for export format
 * @param {String} format
 * @returns {String} MIME type
 */
const getMimeType = (format) => {
  const mimeTypes = {
    json: 'application/json',
    csv: 'text/csv',
    qti: 'application/xml',
    xml: 'application/xml'
  };

  return mimeTypes[format] || 'application/octet-stream';
};

module.exports = {
  exportToJSON,
  importFromJSON,
  exportToCSV,
  importFromCSV,
  exportToQTI,
  formatQuestionForExport,
  sanitizeImportedQuestion,
  getExportFormat,
  getMimeType
};
