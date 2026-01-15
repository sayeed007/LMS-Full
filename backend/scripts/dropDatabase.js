const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config({ path: '../.env' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function dropDatabase() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    await mongoose.connect(mongoURI);
    
    console.log('\\n🔌 Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Ask for confirmation
    return new Promise((resolve, reject) => {
      rl.question('\\n⚠️  WARNING: This will DELETE ALL DATA in the database. Are you sure? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
          try {
            await mongoose.connection.dropDatabase();
            console.log('\\n✅ Database dropped successfully!');
            rl.close();
            resolve(true);
          } catch (error) {
            console.error('\\n❌ Error dropping database:', error.message);
            rl.close();
            reject(error);
          }
        } else {
          console.log('\\n❌ Operation cancelled');
          rl.close();
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error('\\n❌ Connection error:', error.message);
    rl.close();
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  dropDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { dropDatabase };
