require('dotenv').config({ path: '../../../.env' });
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI ? 'Found ✅' : 'Missing ❌');

    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);

    await mongoose.connection.close();
    console.log('✅ Connection closed');

    console.log('\n🎉 Everything is ready to seed!');
    console.log('\nRun: node seedAll.js');

  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. MongoDB is running');
    console.error('2. MONGODB_URI in .env is correct');
    console.error('3. Network connection is available');
    process.exit(1);
  }
}

testConnection();
