// Quick test to verify database connection and create one user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://anujkumar:Anujkumar@cluster0.lrqmbni.mongodb.net/campusreserve?appName=Cluster0';

async function test() {
    try {
        console.log('Connecting...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        // Define minimal user schema
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: String,
            role: String,
            department: String,
            isEmailVerified: Boolean
        });

        const User = mongoose.model('User', userSchema);

        // Hash password
        const hashedPassword = await bcrypt.hash('Password@123', 10);

        // Try to create one user
        console.log('Creating user...');
        const user = await User.create({
            name: 'Infrastructure Admin',
            email: 'infraadmin@bitsathy.ac.in',
            password: hashedPassword,
            role: 'infra_admin',
            isEmailVerified: true
        });

        console.log('✅ User created:', user.email);

        // Try to login
        const foundUser = await User.findOne({ email: 'infraadmin@bitsathy.ac.in' });
        if (foundUser) {
            const isMatch = await bcrypt.compare('Password@123', foundUser.password);
            console.log('Password match:', isMatch);
        }

        await mongoose.connection.close();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

test();
