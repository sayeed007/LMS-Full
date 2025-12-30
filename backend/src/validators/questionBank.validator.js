const { object, string, array, boolean, number } = require('yup');

// Section schema
const sectionSchema = object({
  name: string()
    .required('Section name is required')
    .trim()
    .max(100, 'Section name cannot exceed 100 characters'),
  description: string()
    .trim()
    .max(500, 'Section description cannot exceed 500 characters'),
  order: number()
    .min(0, 'Order must be a positive number')
});

// Settings schema
const settingsSchema = object({
  randomizeQuestions: boolean(),
  randomizeChoices: boolean(),
  defaultPointsPerQuestion: number()
    .min(0, 'Default points cannot be negative'),
  passingScore: number()
    .min(0, 'Passing score cannot be negative')
    .max(100, 'Passing score cannot exceed 100'),
  defaultTimeLimit: number()
    .min(0, 'Time limit cannot be negative'),
  allowRetakes: boolean(),
  maxAttempts: number()
    .min(1, 'Must allow at least one attempt'),
  showCorrectAnswers: boolean(),
  showExplanations: boolean(),
  showScoreImmediately: boolean()
});

// Create question bank validation
const createQuestionBankSchema = object({
  name: string()
    .required('Question bank name is required')
    .trim()
    .max(100, 'Question bank name cannot exceed 100 characters'),
  description: string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters'),
  course: string()
    .required('Course ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid course ID format'),
  visibility: string()
    .oneOf(['public', 'private', 'organization'], 'Invalid visibility option')
    .default('private'),
  sections: array()
    .of(sectionSchema),
  settings: settingsSchema,
  tags: array()
    .of(string().trim()),
  thumbnail: string()
    .url('Thumbnail must be a valid URL'),
  color: string()
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
});

// Update question bank validation
const updateQuestionBankSchema = object({
  name: string()
    .trim()
    .max(100, 'Question bank name cannot exceed 100 characters'),
  description: string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters'),
  visibility: string()
    .oneOf(['public', 'private', 'organization'], 'Invalid visibility option'),
  settings: settingsSchema,
  tags: array()
    .of(string().trim()),
  thumbnail: string()
    .url('Thumbnail must be a valid URL'),
  color: string()
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
});

// Add/Update section validation
const sectionDataSchema = object({
  name: string()
    .required('Section name is required')
    .trim()
    .max(100, 'Section name cannot exceed 100 characters'),
  description: string()
    .trim()
    .max(500, 'Section description cannot exceed 500 characters'),
  order: number()
    .min(0, 'Order must be a positive number')
});

// Duplicate question bank validation
const duplicateQuestionBankSchema = object({
  includeQuestions: boolean()
    .default(false)
});

module.exports = {
  createQuestionBankSchema,
  updateQuestionBankSchema,
  sectionDataSchema,
  duplicateQuestionBankSchema
};
