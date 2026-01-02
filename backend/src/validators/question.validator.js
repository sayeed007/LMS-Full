const { object, string, array, boolean, number, mixed } = require('yup');

// Choice schema for multiple choice questions
const choiceSchema = object({
  text: string()
    .required('Choice text is required')
    .trim(),
  isCorrect: boolean()
    .default(false)
});

// Attachment schema
const attachmentSchema = object({
  name: string()
    .required('Attachment name is required'),
  url: string()
    .required('Attachment URL is required')
    .url('Invalid URL format'),
  type: string()
    .oneOf(['image', 'video', 'audio', 'document'], 'Invalid attachment type')
    .default('document')
});

// Create question validation
const createQuestionSchema = object({
  text: string()
    .required('Question text is required')
    .trim(),
  type: string()
    .required('Question type is required')
    .oneOf(
      ['single-choice', 'multiple-choice', 'descriptive', 'true-false', 'fill-blank'],
      'Invalid question type'
    ),
  choices: array()
    .of(choiceSchema)
    .when('type', {
      is: (type) => ['single-choice', 'multiple-choice', 'true-false'].includes(type),
      then: (schema) => schema
        .min(2, 'Choice-based questions must have at least 2 choices')
        .required('Choices are required for this question type'),
      otherwise: (schema) => schema.notRequired()
    }),
  correctAnswer: string()
    .when('type', {
      is: (type) => ['descriptive', 'fill-blank'].includes(type),
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.notRequired() // Will be validated in choices
    }),
  explanation: string()
    .trim(),
  difficulty: string()
    .oneOf(['easy', 'medium', 'hard'], 'Invalid difficulty level')
    .default('medium'),
  points: number()
    .min(0, 'Points cannot be negative')
    .default(1),
  timeLimit: number()
    .min(0, 'Time limit cannot be negative')
    .default(0),
  tags: array()
    .of(string().trim()),
  attachments: array()
    .of(attachmentSchema),
  questionBank: string()
    .required('Question bank ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid question bank ID format'),
  bankSection: string()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid bank section ID format'),
  isPublic: boolean()
    .default(false)
}).test('validate-choices', 'Invalid choice configuration', function(value) {
  const { type, choices } = value;

  // Validate single-choice has exactly one correct answer
  if (type === 'single-choice') {
    const correctChoices = choices?.filter(c => c.isCorrect) || [];
    if (correctChoices.length !== 1) {
      return this.createError({
        path: 'choices',
        message: 'Single choice questions must have exactly one correct answer'
      });
    }
  }

  // Validate multiple-choice has at least one correct answer
  if (type === 'multiple-choice') {
    const correctChoices = choices?.filter(c => c.isCorrect) || [];
    if (correctChoices.length === 0) {
      return this.createError({
        path: 'choices',
        message: 'Multiple choice questions must have at least one correct answer'
      });
    }
  }

  // Validate true-false has exactly 2 choices and one correct
  if (type === 'true-false') {
    if (choices?.length !== 2) {
      return this.createError({
        path: 'choices',
        message: 'True/False questions must have exactly 2 choices'
      });
    }
    const correctChoices = choices?.filter(c => c.isCorrect) || [];
    if (correctChoices.length !== 1) {
      return this.createError({
        path: 'choices',
        message: 'True/False questions must have exactly one correct answer'
      });
    }
  }

  return true;
});

// Update question validation (all fields optional)
const updateQuestionSchema = object({
  text: string()
    .trim(),
  type: string()
    .oneOf(
      ['single-choice', 'multiple-choice', 'descriptive', 'true-false', 'fill-blank'],
      'Invalid question type'
    ),
  choices: array()
    .of(choiceSchema),
  correctAnswer: string(),
  explanation: string()
    .trim(),
  difficulty: string()
    .oneOf(['easy', 'medium', 'hard'], 'Invalid difficulty level'),
  points: number()
    .min(0, 'Points cannot be negative'),
  timeLimit: number()
    .min(0, 'Time limit cannot be negative'),
  tags: array()
    .of(string().trim()),
  attachments: array()
    .of(attachmentSchema),
  isPublic: boolean(),
  isActive: boolean()
});

// Bulk create questions validation
const bulkCreateQuestionsSchema = object({
  questionBankId: string()
    .required('Question bank ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid question bank ID format'),
  questions: array()
    .of(createQuestionSchema)
    .min(1, 'At least one question is required')
    .max(100, 'Cannot create more than 100 questions at once')
    .required('Questions array is required')
});

// Duplicate question validation
const duplicateQuestionSchema = object({
  questionBankId: string()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid question bank ID format')
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  bulkCreateQuestionsSchema,
  duplicateQuestionSchema
};
