// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs');

// Change this to your desired password
const PASSWORD = 'optikx123';

async function generateHash() {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(PASSWORD, saltRounds);
    
    console.log('Original password:', PASSWORD);
    console.log('Hashed password:', hashedPassword);
    console.log('\n📝 Add this to your .env file:');
    console.log(`ADMIN_PASSWORD_HASH=${hashedPassword}`);
    
    // Verify the hash
    const isValid = await bcrypt.compare(PASSWORD, hashedPassword);
    console.log('\n✅ Verification:', isValid ? 'SUCCESS - Hash is valid' : 'FAILED - Hash is invalid');
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash();