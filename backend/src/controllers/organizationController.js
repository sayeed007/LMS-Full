const Organization = require('../models/Organization');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * @desc    Get all organizations with filtering and search
 * @route   GET /api/v1/organizations
 * @access  Private (authenticated users)
 */
exports.getAllOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, isActive, search } = req.query;

    // Build query
    const query = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Organization.countDocuments(query);

    // Execute query with virtual population
    const organizations = await Organization.find(query)
      .populate('memberCount')
      .populate('coursesCount')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: organizations.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: organizations
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching organizations',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new organization
 * @route   POST /api/v1/organizations
 * @access  Private/Super Admin only
 */
exports.createOrganization = async (req, res) => {
  try {
    const {
      name,
      email,
      type,
      description,
      website,
      logo,
      address,
      contactPerson,
      settings
    } = req.body;

    // Check if organization with same name or email already exists
    const existingOrg = await Organization.findOne({
      $or: [{ name }, { email }]
    });

    if (existingOrg) {
      return res.status(400).json({
        status: 'error',
        message: existingOrg.name === name
          ? 'Organization with this name already exists'
          : 'Organization with this email already exists'
      });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      email,
      type,
      description,
      website,
      logo,
      address,
      contactPerson,
      settings
    });

    res.status(201).json({
      status: 'success',
      data: {
        organization
      }
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating organization',
      error: error.message
    });
  }
};

/**
 * @desc    Get organization by ID
 * @route   GET /api/v1/organizations/:id
 * @access  Private (authenticated users)
 */
exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('memberCount')
      .populate('coursesCount');

    if (!organization) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        organization
      }
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching organization',
      error: error.message
    });
  }
};

/**
 * @desc    Update organization
 * @route   PATCH /api/v1/organizations/:id
 * @access  Private/Org Admin or Super Admin
 */
exports.updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization not found'
      });
    }

    // Check permissions: must be org_admin of this org OR super_admin
    if (
      req.user.role !== 'super_admin' &&
      (req.user.role !== 'org_admin' || req.user.organization?.toString() !== req.params.id)
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this organization'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'email', 'description', 'website', 'logo',
      'address', 'contactPerson', 'settings'
    ];

    // Only super_admin can update isActive
    if (req.user.role === 'super_admin' && req.body.isActive !== undefined) {
      organization.isActive = req.body.isActive;
    }

    // Update fields
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        organization[field] = req.body[field];
      }
    });

    await organization.save();

    res.status(200).json({
      status: 'success',
      data: {
        organization
      }
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating organization',
      error: error.message
    });
  }
};

/**
 * @desc    Delete organization
 * @route   DELETE /api/v1/organizations/:id
 * @access  Private/Super Admin only
 */
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization not found'
      });
    }

    // Check if organization has members
    const memberCount = await User.countDocuments({ organization: req.params.id });
    if (memberCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete organization with ${memberCount} members. Please remove all members first.`
      });
    }

    // Check if organization has courses
    const courseCount = await Course.countDocuments({ organization: req.params.id });
    if (courseCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete organization with ${courseCount} courses. Please remove all courses first.`
      });
    }

    await organization.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting organization',
      error: error.message
    });
  }
};

/**
 * @desc    Get organization members
 * @route   GET /api/v1/organizations/:id/members
 * @access  Private/Org Admin or Super Admin
 */
exports.getOrganizationMembers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const { id } = req.params;

    // Check if organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization not found'
      });
    }

    // Check permissions
    if (
      req.user.role !== 'super_admin' &&
      (req.user.role !== 'org_admin' || req.user.organization?.toString() !== id)
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this organization\'s members'
      });
    }

    // Build query
    const query = { organization: id };

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    // Get members
    const members = await User.find(query)
      .select('-password -refreshTokens')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: members.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: members
    });
  } catch (error) {
    console.error('Get organization members error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching organization members',
      error: error.message
    });
  }
};

/**
 * @desc    Add member to organization
 * @route   POST /api/v1/organizations/:id/members
 * @access  Private/Org Admin or Super Admin
 */
exports.addOrganizationMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    // Validate required fields
    if (!userId || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide userId and role'
      });
    }

    // Check if organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization not found'
      });
    }

    // Check permissions
    if (
      req.user.role !== 'super_admin' &&
      (req.user.role !== 'org_admin' || req.user.organization?.toString() !== id)
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to add members to this organization'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user is already in an organization
    if (user.organization) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already a member of another organization'
      });
    }

    // Validate role
    const validRoles = ['student', 'instructor', 'org_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: `Role must be one of: ${validRoles.join(', ')}`
      });
    }

    // Add user to organization
    user.organization = id;
    user.role = role;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Member added successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization
        }
      }
    });
  } catch (error) {
    console.error('Add organization member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding member to organization',
      error: error.message
    });
  }
};

/**
 * @desc    Get organization courses
 * @route   GET /api/v1/organizations/:id/courses
 * @access  Private (authenticated users)
 */
exports.getOrganizationCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { id } = req.params;

    // Check if organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization not found'
      });
    }

    // Build query
    const query = { organization: id };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Course.countDocuments(query);

    // Get courses
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: courses.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: courses
    });
  } catch (error) {
    console.error('Get organization courses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching organization courses',
      error: error.message
    });
  }
};

/**
 * @desc    Get organization statistics
 * @route   GET /api/v1/organizations/:id/stats
 * @access  Private/Org Admin or Super Admin
 */
exports.getOrganizationStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization not found'
      });
    }

    // Check permissions
    if (
      req.user.role !== 'super_admin' &&
      (req.user.role !== 'org_admin' || req.user.organization?.toString() !== id)
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this organization\'s statistics'
      });
    }

    // Get statistics
    const totalMembers = await User.countDocuments({ organization: id });
    const totalCourses = await Course.countDocuments({ organization: id });
    const activeInstructors = await User.countDocuments({
      organization: id,
      role: 'instructor',
      isActive: true
    });

    // Get enrollments for this organization's courses
    const orgCourses = await Course.find({ organization: id }).select('_id');
    const courseIds = orgCourses.map(course => course._id);
    const totalEnrollments = await Enrollment.countDocuments({
      course: { $in: courseIds }
    });

    // Get this month's statistics
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const coursesThisMonth = await Course.countDocuments({
      organization: id,
      createdAt: { $gte: startOfMonth }
    });
    const enrollmentsThisMonth = await Enrollment.countDocuments({
      course: { $in: courseIds },
      createdAt: { $gte: startOfMonth }
    });

    // Get members by role
    const membersByRole = await User.aggregate([
      { $match: { organization: organization._id } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get course status breakdown
    const coursesByStatus = await Course.aggregate([
      { $match: { organization: organization._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalMembers,
        totalCourses,
        totalEnrollments,
        activeInstructors,
        coursesThisMonth,
        enrollmentsThisMonth,
        membersByRole: membersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        coursesByStatus: coursesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get organization stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching organization statistics',
      error: error.message
    });
  }
};
