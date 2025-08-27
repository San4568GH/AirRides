#!/usr/bin/env node

/**
 * User Schema Migration Script
 * 
 * This script migrates existing user data to be compatible with the new UserSchema
 * that includes additional fields: name, phone, age, gender, and role.
 * 
 * Run this script when:
 * - You have existing users in the database
 * - You've updated the UserSchema with new fields
 * - You want to ensure backward compatibility
 */

import mongoose from 'mongoose';
import config from './config.js';
import UserSchema from '../schemas/UserSchema.js';

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.bold}${colors.cyan}${msg}${colors.reset}`),
};

async function connectToDatabase() {
  try {
    await mongoose.connect(config.database.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log.success('Connected to MongoDB successfully');
  } catch (error) {
    log.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

async function analyzeExistingUsers() {
  log.header('\n📊 ANALYZING EXISTING USER DATA');
  
  try {
    const totalUsers = await UserSchema.countDocuments();
    log.info(`Total users in database: ${totalUsers}`);
    
    if (totalUsers === 0) {
      log.warning('No users found in database. Migration not needed.');
      return { needsMigration: false, usersToMigrate: 0 };
    }

    // Check for users missing new fields
    const usersNeedingMigration = await UserSchema.countDocuments({
      $or: [
        { role: { $exists: false } },
        { name: { $exists: false } },
        { phone: { $exists: false } },
        { age: { $exists: false } },
        { gender: { $exists: false } }
      ]
    });

    log.info(`Users needing migration: ${usersNeedingMigration}`);
    
    // Sample existing users
    const sampleUsers = await UserSchema.find({}, 'username email role name phone age gender').limit(5);
    
    if (sampleUsers.length > 0) {
      log.info('\nSample users:');
      sampleUsers.forEach((user, index) => {
        const hasNewFields = user.role && user.name !== undefined;
        const status = hasNewFields ? colors.green + '✓' : colors.yellow + '○';
        console.log(`  ${status}${colors.reset} ${user.username} (${user.email}) - Role: ${user.role || 'Not Set'}`);
      });
    }

    return { 
      needsMigration: usersNeedingMigration > 0, 
      usersToMigrate: usersNeedingMigration,
      totalUsers 
    };
  } catch (error) {
    log.error(`Error analyzing users: ${error.message}`);
    throw error;
  }
}

async function performMigration() {
  log.header('\n🔄 PERFORMING MIGRATION');
  
  try {
    // Update users missing the role field
    const roleUpdate = await UserSchema.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'passenger' } }
    );
    
    if (roleUpdate.modifiedCount > 0) {
      log.success(`Set default role 'passenger' for ${roleUpdate.modifiedCount} users`);
    }

    // Update users missing the name field (set to empty string if not exists)
    const nameUpdate = await UserSchema.updateMany(
      { name: { $exists: false } },
      { $set: { name: '' } }
    );
    
    if (nameUpdate.modifiedCount > 0) {
      log.success(`Initialized name field for ${nameUpdate.modifiedCount} users`);
    }

    // Update users missing the phone field
    const phoneUpdate = await UserSchema.updateMany(
      { phone: { $exists: false } },
      { $set: { phone: '' } }
    );
    
    if (phoneUpdate.modifiedCount > 0) {
      log.success(`Initialized phone field for ${phoneUpdate.modifiedCount} users`);
    }

    // Update users missing the age field
    const ageUpdate = await UserSchema.updateMany(
      { age: { $exists: false } },
      { $set: { age: null } }
    );
    
    if (ageUpdate.modifiedCount > 0) {
      log.success(`Initialized age field for ${ageUpdate.modifiedCount} users`);
    }

    // Update users missing the gender field
    const genderUpdate = await UserSchema.updateMany(
      { gender: { $exists: false } },
      { $set: { gender: null } }
    );
    
    if (genderUpdate.modifiedCount > 0) {
      log.success(`Initialized gender field for ${genderUpdate.modifiedCount} users`);
    }

    const totalUpdated = Math.max(
      roleUpdate.modifiedCount,
      nameUpdate.modifiedCount,
      phoneUpdate.modifiedCount,
      ageUpdate.modifiedCount,
      genderUpdate.modifiedCount
    );

    return totalUpdated;
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    throw error;
  }
}

async function verifyMigration() {
  log.header('\n✅ VERIFYING MIGRATION');
  
  try {
    const totalUsers = await UserSchema.countDocuments();
    const usersWithRole = await UserSchema.countDocuments({ role: { $exists: true } });
    const usersWithName = await UserSchema.countDocuments({ name: { $exists: true } });
    
    log.info(`Total users: ${totalUsers}`);
    log.info(`Users with role field: ${usersWithRole}`);
    log.info(`Users with name field: ${usersWithName}`);
    
    // Sample migrated users
    const sampleUsers = await UserSchema.find({}, 'username email role name phone age gender').limit(5);
    
    if (sampleUsers.length > 0) {
      log.info('\nSample migrated users:');
      sampleUsers.forEach((user) => {
        console.log(`  ${colors.green}✓${colors.reset} ${user.username} (${user.email})`);
        console.log(`    Role: ${user.role || 'Not Set'}`);
        console.log(`    Name: ${user.name || 'Not Set'}`);
        console.log(`    Phone: ${user.phone || 'Not Set'}`);
        console.log(`    Age: ${user.age || 'Not Set'}`);
        console.log(`    Gender: ${user.gender || 'Not Set'}`);
        console.log('');
      });
    }

    // Check for any remaining issues
    const usersStillNeedingMigration = await UserSchema.countDocuments({
      $or: [
        { role: { $exists: false } },
        { name: { $exists: false } },
        { phone: { $exists: false } },
        { age: { $exists: false } },
        { gender: { $exists: false } }
      ]
    });

    if (usersStillNeedingMigration === 0) {
      log.success('✅ All users successfully migrated!');
      return true;
    } else {
      log.warning(`⚠️  ${usersStillNeedingMigration} users still need migration`);
      return false;
    }
  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
    throw error;
  }
}

async function runMigration() {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║               USER SCHEMA MIGRATION                 ║');
  console.log('║              Airlines Database Update               ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  try {
    // Step 1: Connect to database
    await connectToDatabase();

    // Step 2: Analyze existing data
    const analysis = await analyzeExistingUsers();
    
    if (!analysis.needsMigration) {
      log.success('🎉 No migration needed! All users are up to date.');
      await mongoose.disconnect();
      return;
    }

    // Step 3: Confirm migration
    log.warning(`\n⚠️  Migration will update ${analysis.usersToMigrate} out of ${analysis.totalUsers} users`);
    
    // In a real scenario, you might want to add a confirmation prompt here
    // For automation, we'll proceed directly
    
    // Step 4: Perform migration
    const updatedCount = await performMigration();
    
    // Step 5: Verify migration
    const verificationSuccess = await verifyMigration();
    
    if (verificationSuccess) {
      log.header('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      log.info('Your users are now compatible with the new schema.');
      log.info('You can safely use all new admin features.');
    } else {
      log.error('\n❌ Migration completed with issues. Please check the logs above.');
    }

  } catch (error) {
    log.error(`\n💥 Migration failed with error: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Step 6: Disconnect from database
    await mongoose.disconnect();
    log.info('\n📡 Disconnected from MongoDB');
    log.info('Migration process completed.');
  }
}

// Execute migration if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch(console.error);
}

export default runMigration;
