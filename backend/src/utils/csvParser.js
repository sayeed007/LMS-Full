/**
 * CSV Parser and Generator for Question Import/Export
 *
 * Supports importing and exporting questions in CSV format
 * Compatible with common question bank formats
 */

/**
 * Parse CSV string to questions array
 * @param {String} csvContent - CSV file content
 * @returns {Array} Array of question objects
 */
const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Validate required headers
  const requiredHeaders = ['text', 'type'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  // Parse data rows
  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length !== headers.length) {
      console.warn(`Skipping row ${i + 1}: Column count mismatch`);
      continue;
    }

    const question = {};

    headers.forEach((header, index) => {
      const value = values[index].trim();

      // Map CSV fields to question schema
      switch (header.toLowerCase()) {
        case 'text':
        case 'question':
          question.text = value;
          break;

        case 'type':
        case 'question_type':
          question.type = normalizeQuestionType(value);
          break;

        case 'choices':
        case 'options':
          question.choices = parseChoices(value);
          break;

        case 'correct_answer':
        case 'answer':
        case 'correctanswer':
          question.correctAnswer = value;
          break;

        case 'explanation':
          question.explanation = value;
          break;

        case 'difficulty':
          question.difficulty = normalizeDifficulty(value);
          break;

        case 'points':
        case 'score':
          question.points = parseInt(value) || 1;
          break;

        case 'time_limit':
        case 'timelimit':
          question.timeLimit = parseInt(value) || 0;
          break;

        case 'tags':
          question.tags = value ? value.split(';').map(t => t.trim()) : [];
          break;

        default:
          // Store unknown fields as-is
          if (value) {
            question[header] = value;
          }
      }
    });

    // Validate and add question
    if (question.text && question.type) {
      questions.push(question);
    } else {
      console.warn(`Skipping row ${i + 1}: Missing required fields`);
    }
  }

  return questions;
};

/**
 * Parse a single CSV line handling quoted values
 * @param {String} line - CSV line
 * @returns {Array} Array of values
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last value
  values.push(current);

  return values;
};

/**
 * Parse choices from CSV format
 * Format: "Choice 1[*]|Choice 2|Choice 3[*]"
 * [*] indicates correct answer
 * @param {String} choicesString
 * @returns {Array} Array of choice objects
 */
const parseChoices = (choicesString) => {
  if (!choicesString) return [];

  return choicesString.split('|').map(choice => {
    const isCorrect = choice.includes('[*]');
    const text = choice.replace('[*]', '').trim();

    return {
      text,
      isCorrect
    };
  });
};

/**
 * Normalize question type from various formats
 * @param {String} type
 * @returns {String} Normalized type
 */
const normalizeQuestionType = (type) => {
  const normalized = type.toLowerCase().trim();

  const typeMap = {
    'single': 'single-choice',
    'single choice': 'single-choice',
    'singlechoice': 'single-choice',
    'mcq': 'single-choice',
    'multiple': 'multiple-choice',
    'multiple choice': 'multiple-choice',
    'multiplechoice': 'multiple-choice',
    'multi': 'multiple-choice',
    'true/false': 'true-false',
    'truefalse': 'true-false',
    'tf': 'true-false',
    'bool': 'true-false',
    'boolean': 'true-false',
    'essay': 'descriptive',
    'text': 'descriptive',
    'short answer': 'descriptive',
    'fill': 'fill-blank',
    'fill in the blank': 'fill-blank',
    'fillblank': 'fill-blank'
  };

  return typeMap[normalized] || normalized;
};

/**
 * Normalize difficulty from various formats
 * @param {String} difficulty
 * @returns {String} Normalized difficulty
 */
const normalizeDifficulty = (difficulty) => {
  const normalized = difficulty.toLowerCase().trim();

  const difficultyMap = {
    '1': 'easy',
    '2': 'medium',
    '3': 'hard',
    'e': 'easy',
    'm': 'medium',
    'h': 'hard',
    'simple': 'easy',
    'moderate': 'medium',
    'difficult': 'hard',
    'challenging': 'hard'
  };

  return difficultyMap[normalized] || normalized;
};

/**
 * Generate CSV from questions array
 * @param {Array} questions - Array of question objects
 * @param {Object} options - Export options
 * @returns {String} CSV content
 */
const generateCSV = (questions, options = {}) => {
  const {
    includeIds = false,
    includeMetadata = true
  } = options;

  // Define headers
  const headers = [
    'text',
    'type',
    'choices',
    'explanation',
    'difficulty',
    'points',
    'timeLimit',
    'tags'
  ];

  if (includeIds) {
    headers.unshift('id');
  }

  if (includeMetadata) {
    headers.push('createdAt', 'updatedAt', 'createdBy');
  }

  // Build CSV rows
  const rows = [headers];

  questions.forEach(question => {
    const row = [];

    headers.forEach(header => {
      let value = '';

      switch (header) {
        case 'id':
          value = question._id || question.id || '';
          break;

        case 'text':
          value = stripHTML(question.text || '');
          break;

        case 'type':
          value = question.type || '';
          break;

        case 'choices':
          value = formatChoices(question.choices || []);
          break;

        case 'explanation':
          value = stripHTML(question.explanation || '');
          break;

        case 'difficulty':
          value = question.difficulty || 'medium';
          break;

        case 'points':
          value = question.points || 1;
          break;

        case 'timeLimit':
          value = question.timeLimit || 0;
          break;

        case 'tags':
          value = (question.tags || []).join(';');
          break;

        case 'createdAt':
          value = question.createdAt ? new Date(question.createdAt).toISOString() : '';
          break;

        case 'updatedAt':
          value = question.updatedAt ? new Date(question.updatedAt).toISOString() : '';
          break;

        case 'createdBy':
          value = question.createdBy?.name || question.createdBy || '';
          break;

        default:
          value = question[header] || '';
      }

      // Escape and quote value
      row.push(escapeCSVValue(value.toString()));
    });

    rows.push(row);
  });

  // Join rows
  return rows.map(row => row.join(',')).join('\n');
};

/**
 * Format choices for CSV export
 * Format: "Choice 1[*]|Choice 2|Choice 3[*]"
 * @param {Array} choices
 * @returns {String} Formatted choices string
 */
const formatChoices = (choices) => {
  return choices.map(choice => {
    const text = choice.text || '';
    const marker = choice.isCorrect ? '[*]' : '';
    return `${text}${marker}`;
  }).join('|');
};

/**
 * Strip HTML tags from text
 * @param {String} html
 * @returns {String} Plain text
 */
const stripHTML = (html) => {
  if (!html) return '';

  // Simple HTML stripping (for CSV export)
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

/**
 * Escape and quote CSV value
 * @param {String} value
 * @returns {String} Escaped value
 */
const escapeCSVValue = (value) => {
  // Always quote if contains comma, newline, or quote
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    // Escape quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

module.exports = {
  parseCSV,
  generateCSV,
  parseCSVLine,
  parseChoices,
  formatChoices,
  normalizeQuestionType,
  normalizeDifficulty,
  stripHTML
};
