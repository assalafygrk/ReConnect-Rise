const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const dumpRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}).select('email role');
        console.log('--- DB ROLE DUMP ---');
        users.forEach(u => {
            console.log(`Email: ${u.email} | Role: [${u.role}] | Length: ${u.role.length}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

dumpRoles();
