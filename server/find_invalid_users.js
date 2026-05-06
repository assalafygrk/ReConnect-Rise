const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const findInvalidUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const validRoles = [
            'super_admin', 'admin', 'group_leader', 'treasurer', 
            'welfare', 'special_advicer', 'official_member', 'member'
        ];
        
        const allUsers = await User.find({});
        const invalidUsers = allUsers.filter(u => !validRoles.includes(u.role));
        
        console.log(`Total users: ${allUsers.length}`);
        console.log(`Invalid users found: ${invalidUsers.length}`);
        
        invalidUsers.forEach(u => {
            console.log(`${u.email}: current role is "${u.role}"`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findInvalidUsers();
