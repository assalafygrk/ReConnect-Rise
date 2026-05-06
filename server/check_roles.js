const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).select('email role status');
        console.log('Current users and roles:');
        users.forEach(u => {
            console.log(`${u.email}: ${u.role} (${u.status})`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Check failed', err);
        process.exit(1);
    }
};

checkRoles();
