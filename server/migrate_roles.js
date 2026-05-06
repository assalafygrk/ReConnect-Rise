const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const migrateRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const roleMap = {
            'official-member': 'official_member',
            'special-advisor': 'special_advicer',
            'special_advisor': 'special_advicer',
            'groupleader': 'group_leader',
            'meeting-organizer': 'official_member',
            'welfare_officer': 'welfare'
        };

        const users = await User.find({ role: { $in: Object.keys(roleMap) } });
        console.log(`Found ${users.length} users with legacy roles`);

        for (let user of users) {
            const oldRole = user.role;
            const newRole = roleMap[oldRole];
            
            // Bypass validation during update to fix legacy data
            await User.updateOne({ _id: user._id }, { $set: { role: newRole } });
            console.log(`Updated user ${user.email}: ${oldRole} -> ${newRole}`);
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed', err);
        process.exit(1);
    }
};

migrateRoles();
