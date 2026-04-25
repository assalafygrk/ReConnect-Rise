const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://db_reconnect:RR2026$@cluster0.hcej6u5.mongodb.net/?appName=Cluster0';

async function promote() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('Users found:', users.map(u => `${u.name} (${u.email}) - ${u.role}`));

    if (users.length > 0) {
      // Promote the first user to admin just to have an admin, or specifically if one is requested.
      const targetUser = users[0];
      targetUser.role = 'admin';
      await targetUser.save();
      console.log(`Promoted ${targetUser.email} to admin`);
    } else {
      console.log('No users found. Creating a default admin user...');
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@reconnectandrise.com',
        password: 'Password123!', // Note: assuming plaintext or pre-hash depending on the model hook. If User model has a pre-save hook for hashing, this is fine.
        phone: '1234567890',
        role: 'admin'
      });
      console.log(`Created default admin: ${admin.email}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

promote();
