// Simple seed script - Run with: node scripts/quickSeed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Hardcode the connection string temporarily
const MONGODB_URI = 'mongodb+srv://anujkumar:Anujkumar@cluster0.lrqmbni.mongodb.net/campusreserve?appName=Cluster0';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    department: String,
    isEmailVerified: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        // Hash password
        const hashedPassword = await bcrypt.hash('Password@123', 10);

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create users
        const users = await User.insertMany([
            {
                name: 'Infrastructure Admin',
                email: 'infraadmin@bitsathy.ac.in',
                password: hashedPassword,
                role: 'infra_admin',
                isEmailVerified: true
            },
            {
                name: 'IT Services Admin',
                email: 'itadmin@bitsathy.ac.in',
                password: hashedPassword,
                role: 'it_admin',
                isEmailVerified: true
            },
            {
                name: 'John Doe',
                email: 'john.doe@bitsathy.ac.in',
                password: hashedPassword,
                role: 'faculty',
                department: 'CS',
                isEmailVerified: true
            },
            {
                name: 'HOD CS',
                email: 'hodcs@bitsathy.ac.in',
                password: hashedPassword,
                role: 'department',
                department: 'CS',
                isEmailVerified: true
            },
            {
                name: 'NSS',
                email: 'nss@bitsathy.ac.in',
                password: hashedPassword,
                role: 'club',
                isEmailVerified: true
            }
        ]);

        console.log(`✅ Created ${users.length} users`);
        console.log('Password for all: Password@123');

        await mongoose.connection.close();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seed();
