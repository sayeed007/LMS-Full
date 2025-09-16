const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = [
    // Super Admin
    {
      name: 'System Administrator',
      email: 'admin@lms.com',
      password: hashedPassword,
      role: 'super_admin',
      isEmailVerified: true,
      profile: {
        bio: 'System administrator with full access to the LMS platform.',
        location: 'New York, USA',
        website: 'https://lms.com',
        phoneNumber: '+1-555-0001'
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        darkMode: false,
        language: 'en'
      }
    },

    // Organization Admin
    {
      name: 'Organization Manager',
      email: 'org.admin@lms.com',
      password: hashedPassword,
      role: 'org_admin',
      isEmailVerified: true,
      profile: {
        bio: 'Organization administrator managing courses and instructors.',
        location: 'California, USA',
        phoneNumber: '+1-555-0002'
      }
    },

    // Instructors
    {
      name: 'Dr. John Doe',
      email: 'john.doe@lms.com',
      password: hashedPassword,
      role: 'instructor',
      isEmailVerified: true,
      profile: {
        bio: 'Senior Software Engineer with 10+ years of experience in web development, specializing in JavaScript, React, and Node.js. Passionate about teaching and sharing knowledge.',
        location: 'San Francisco, USA',
        website: 'https://johndoe.dev',
        phoneNumber: '+1-555-0100',
        expertise: ['JavaScript', 'React', 'Node.js', 'Database Design', 'System Architecture'],
        experience: '10+ years',
        education: 'PhD in Computer Science'
      },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe',
        github: 'https://github.com/johndoe'
      }
    },

    {
      name: 'Prof. Sarah Wilson',
      email: 'sarah.wilson@lms.com',
      password: hashedPassword,
      role: 'instructor',
      isEmailVerified: true,
      profile: {
        bio: 'Data Science expert and Machine Learning researcher with a passion for making complex topics accessible to everyone.',
        location: 'Boston, USA',
        website: 'https://sarahwilson.ai',
        phoneNumber: '+1-555-0101',
        expertise: ['Python', 'Machine Learning', 'Data Analysis', 'Statistics', 'AI'],
        experience: '8 years',
        education: 'PhD in Data Science'
      },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahwilson'
      }
    },

    {
      name: 'Michael Chen',
      email: 'michael.chen@lms.com',
      password: hashedPassword,
      role: 'instructor',
      isEmailVerified: true,
      profile: {
        bio: 'Full-stack developer and UI/UX designer with expertise in modern web technologies and user experience design.',
        location: 'Seattle, USA',
        phoneNumber: '+1-555-0102',
        expertise: ['UI/UX Design', 'Frontend Development', 'Design Systems', 'User Research'],
        experience: '6 years',
        education: 'MS in Human-Computer Interaction'
      }
    },

    {
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@lms.com',
      password: hashedPassword,
      role: 'instructor',
      isEmailVerified: true,
      profile: {
        bio: 'Cybersecurity expert and ethical hacker with extensive experience in penetration testing and security architecture.',
        location: 'Austin, USA',
        phoneNumber: '+1-555-0103',
        expertise: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Risk Assessment'],
        experience: '12 years',
        education: 'PhD in Cybersecurity'
      }
    },

    // Students
    {
      name: 'Alice Student',
      email: 'alice.student@lms.com',
      password: hashedPassword,
      role: 'student',
      isEmailVerified: true,
      profile: {
        bio: 'Computer Science student passionate about web development and artificial intelligence.',
        location: 'Chicago, USA',
        phoneNumber: '+1-555-1001',
        education: 'BS Computer Science (In Progress)'
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        learningGoals: ['Web Development', 'Machine Learning', 'Career Development']
      }
    },

    {
      name: 'Bob Johnson',
      email: 'bob.johnson@lms.com',
      password: hashedPassword,
      role: 'student',
      isEmailVerified: true,
      profile: {
        bio: 'Marketing professional looking to transition into tech through data analysis and programming.',
        location: 'Denver, USA',
        phoneNumber: '+1-555-1002',
        education: 'BA Marketing'
      }
    },

    {
      name: 'Carol Williams',
      email: 'carol.williams@lms.com',
      password: hashedPassword,
      role: 'student',
      isEmailVerified: true,
      profile: {
        bio: 'Graphic designer expanding skills into web development and user experience design.',
        location: 'Portland, USA',
        phoneNumber: '+1-555-1003',
        education: 'BFA Graphic Design'
      }
    },

    {
      name: 'David Brown',
      email: 'david.brown@lms.com',
      password: hashedPassword,
      role: 'student',
      isEmailVerified: true,
      profile: {
        bio: 'Recent graduate eager to learn cybersecurity and penetration testing.',
        location: 'Miami, USA',
        phoneNumber: '+1-555-1004',
        education: 'BS Information Technology'
      }
    },

    {
      name: 'Emma Davis',
      email: 'emma.davis@lms.com',
      password: hashedPassword,
      role: 'student',
      isEmailVerified: true,
      profile: {
        bio: 'Data analyst looking to advance skills in machine learning and data science.',
        location: 'Phoenix, USA',
        phoneNumber: '+1-555-1005',
        education: 'MS Statistics'
      }
    },

    {
      name: 'Frank Miller',
      email: 'frank.miller@lms.com',
      password: hashedPassword,
      role: 'student',
      isEmailVerified: true,
      profile: {
        bio: 'Software engineer seeking to improve database design and system architecture skills.',
        location: 'Nashville, USA',
        phoneNumber: '+1-555-1006',
        education: 'BS Software Engineering'
      }
    },

    {
      name: 'Grace Taylor',
      email: 'grace.taylor@lms.com',
      password: hashedPassword,
      role: 'student',
      isEmailVerified: true,
      profile: {
        bio: 'Project manager transitioning to technical role with focus on full-stack development.',
        location: 'Charlotte, USA',
        phoneNumber: '+1-555-1007',
        education: 'MBA Project Management'
      }
    },

    {
      name: 'Henry Wilson',
      email: 'henry.wilson@lms.com',
      password: hashedPassword,
      role: 'student',
      isEmailVerified: true,
      profile: {
        bio: 'High school student with strong interest in programming and game development.',
        location: 'Orlando, USA',
        phoneNumber: '+1-555-1008',
        education: 'High School Senior'
      }
    }
  ];

  // Create users and return them
  const createdUsers = await User.insertMany(users);
  return createdUsers;
};

module.exports = { seedUsers };