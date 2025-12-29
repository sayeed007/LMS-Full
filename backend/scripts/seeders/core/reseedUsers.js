/**
 * Re-seed Users Only
 *
 * Deletes existing users and creates fresh ones with correct password hashing
 */

require('dotenv').config({ path: '../../../.env' });
const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const { seedUsers } = require('./userSeeder');

async function reseedUsers() {
  try {
    console.log('🔄 Re-seeding users...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete all existing users
    console.log('🗑️  Deleting existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} users\n`);

    // Seed new users
    console.log('🌱 Creating new users...');
    const users = await seedUsers();
    console.log(`✅ Created ${users.length} users\n`);

    console.log('Users created:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.role}): ${user.email}`);
    });

    console.log('\n🎉 User re-seeding complete!');
    console.log('📝 All users can login with password: password123');

    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

reseedUsers()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
