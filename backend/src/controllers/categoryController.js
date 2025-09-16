const Category = require('../models/Category');
const { body, validationResult, param } = require('express-validator');
const mongoose = require('mongoose');

// Validation rules
const categoryValidationRules = () => {
  return [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z0-9\s&-]+$/)
      .withMessage('Category name can only contain letters, numbers, spaces, & and -'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('icon')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Icon name cannot exceed 50 characters'),
    body('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color'),
    body('parentCategory')
      .optional()
      .isMongoId()
      .withMessage('Parent category must be a valid ID')
  ];
};

const categoryIdValidation = () => {
  return [
    param('id').isMongoId().withMessage('Invalid category ID')
  ];
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      isActive,
      includeStats = false,
      includeSubcategories = false
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    let categories;

    if (includeStats === 'true') {
      // Use aggregation to include course count
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'courses',
            localField: 'name',
            foreignField: 'category',
            as: 'courses'
          }
        },
        {
          $addFields: {
            courseCount: { $size: '$courses' }
          }
        },
        {
          $project: {
            courses: 0
          }
        },
        { $sort: { name: 1 } },
        { $skip: skip },
        { $limit: limitNum }
      ];

      categories = await Category.aggregate(pipeline);
    } else {
      // Regular query
      let queryBuilder = Category.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'firstName lastName');

      if (includeSubcategories === 'true') {
        queryBuilder = queryBuilder.populate('subcategories');
      }

      categories = await queryBuilder;
    }

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: categories,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }

    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get course count
    const courseCount = await category.getCourseCount();
    const categoryWithStats = {
      ...category.toObject(),
      courseCount
    };

    res.json({
      success: true,
      data: categoryWithStats
    });
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin/Instructor)
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }

    const { name, description, icon, color, parentCategory } = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Validate parent category if provided
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const category = new Category({
      name,
      description,
      icon: icon || 'folder',
      color: color || '#3B82F6',
      parentCategory: parentCategory || null,
      createdBy: req.user.id
    });

    await category.save();

    // Populate the created category
    await category.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error in createCategory:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Instructor)
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }

    const { name, description, icon, color, parentCategory, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Validate parent category if provided
    if (parentCategory && parentCategory !== category.parentCategory?.toString()) {
      if (parentCategory === req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }

      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    // Populate the updated category
    await category.populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error in updateCategory:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has courses
    const Course = mongoose.model('Course');
    const courseCount = await Course.countDocuments({ category: category.name });

    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${courseCount} course(s) associated with it.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentCategory: category._id });

    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${subcategoryCount} subcategory(ies).`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get category stats
// @route   GET /api/categories/stats
// @access  Public
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Category.getCategoriesWithStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getCategoryStats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  categoryValidationRules,
  categoryIdValidation
};