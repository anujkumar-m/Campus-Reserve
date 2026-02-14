const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require(path.join(__dirname, '../models/User'));
const Resource = require(path.join(__dirname, '../models/Resource'));

console.log('📦 Models loaded successfully');

// Connect to MongoDB
const connectDB = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        console.log('MongoDB URI:', mongoUri ? 'Found' : 'Not found');

        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Connected for seeding');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Seed Users
const seedUsers = async () => {
    console.log('\n📝 Seeding Users...');

    const defaultPassword = await hashPassword('Password@123');

    const users = [
        // Infrastructure Admin
        {
            name: 'Infrastructure Admin',
            email: 'infraadmin@bitsathy.ac.in',
            password: await hashPassword('Password@123'),
            role: 'infra_admin',
            isEmailVerified: true
        },
        // IT Services Admin
        {
            name: 'IT Services Admin',
            email: 'itadmin@bitsathy.ac.in',
            password: await hashPassword('Password@123'),
            role: 'it_admin',
            isEmailVerified: true
        },

        // Faculty
        {
            name: 'Dr. Kumar',
            email: 'dr.kumar@bitsathy.ac.in',
            password: await hashPassword('Faculty@123'),
            role: 'faculty',
            department: 'CS',
            isEmailVerified: true
        },
        {
            name: 'Prof. Sharma',
            email: 'prof.sharma@bitsathy.ac.in',
            password: await hashPassword('Faculty@123'),
            role: 'faculty',
            department: 'EC',
            isEmailVerified: true
        },
        {
            name: 'Dr. Patel',
            email: 'dr.patel@bitsathy.ac.in',
            password: await hashPassword('Faculty@123'),
            role: 'faculty',
            department: 'EE',
            isEmailVerified: true
        },
        {
            name: 'Prof. Reddy',
            email: 'prof.reddy@bitsathy.ac.in',
            password: await hashPassword('Faculty@123'),
            role: 'faculty',
            department: 'ME',
            isEmailVerified: true
        },

        // HODs
        { name: 'HOD CS', email: 'hodcs@bitsathy.ac.in', department: 'CS', role: 'department' },
        { name: 'HOD AL', email: 'hodal@bitsathy.ac.in', department: 'AL', role: 'department' },
        { name: 'HOD AD', email: 'hodad@bitsathy.ac.in', department: 'AD', role: 'department' },
        { name: 'HOD IT', email: 'hodit@bitsathy.ac.in', department: 'IT', role: 'department' },
        { name: 'HOD MZ', email: 'hodmz@bitsathy.ac.in', department: 'MZ', role: 'department' },
        { name: 'HOD ME', email: 'hodme@bitsathy.ac.in', department: 'ME', role: 'department' },
        { name: 'HOD EE', email: 'hodee@bitsathy.ac.in', department: 'EE', role: 'department' },
        { name: 'HOD EC', email: 'hodec@bitsathy.ac.in', department: 'EC', role: 'department' },
        { name: 'HOD EI', email: 'hodei@bitsathy.ac.in', department: 'EI', role: 'department' },
        { name: 'HOD CE', email: 'hodce@bitsathy.ac.in', department: 'CE', role: 'department' },
        { name: 'HOD FD', email: 'hodfd@bitsathy.ac.in', department: 'FD', role: 'department' },
        { name: 'HOD FT', email: 'hodft@bitsathy.ac.in', department: 'FT', role: 'department' },
        { name: 'HOD BT', email: 'hodbt@bitsathy.ac.in', department: 'BT', role: 'department' },

        // Clubs
        {
            name: 'NSS',
            email: 'nss@bitsathy.ac.in',
            password: await hashPassword('Club@123'),
            role: 'club',
            clubName: 'NSS',
            isEmailVerified: true
        },
        {
            name: 'NCC',
            email: 'ncc@bitsathy.ac.in',
            password: await hashPassword('Club@123'),
            role: 'club',
            clubName: 'NCC',
            isEmailVerified: true
        },
        {
            name: 'Rotaract',
            email: 'rotaract@bitsathy.ac.in',
            password: await hashPassword('Club@123'),
            role: 'club',
            clubName: 'Rotaract',
            isEmailVerified: true
        }
    ];

    // Helper to add password and verify email for HODs efficiently
    const hodPassword = await hashPassword('HOD@123');
    // Map over users to ensure all fields are set, especially for the shorthand HODs
    const finalUsers = users.map(u => {
        if (u.role === 'department' && !u.password) {
            return { ...u, password: hodPassword, isEmailVerified: true };
        }
        return u;
    });

    try {
        await User.deleteMany({}); // Clear existing users
        console.log('🗑️  Cleared existing users');

        const createdUsers = await User.insertMany(finalUsers);
        console.log(`✅ Created ${createdUsers.length} users`);
        return createdUsers;
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        throw error;
    }
};

// Seed Resources
const seedResources = async () => {
    console.log('\n📝 Seeding Resources...');

    const resources = [
        // Infrastructure Resources
        {
            name: 'Main Auditorium',
            type: 'auditorium',
            category: 'central',
            capacity: 500,
            location: 'Main Block',
            amenities: ['Projector', 'Sound System', 'AC'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'infrastructure',
            isMovable: false
        },
        {
            name: 'CS Lab 1',
            type: 'lab',
            category: 'department',
            capacity: 60,
            location: 'CS Block',
            department: 'CS',
            amenities: ['Computers', 'Projector'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 4,
            managedBy: 'infrastructure',
            isMovable: false
        },
        // IT Services Resources
        {
            name: 'Portable Projector 1',
            type: 'projector',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['HDMI', 'VGA', 'Remote'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        },
        {
            name: 'Laptop 1',
            type: 'other_equipment',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['Charger', 'Mouse'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        }
    ];

    try {
        await Resource.deleteMany({}); // Clear existing resources
        console.log('🗑️  Cleared existing resources');

        const createdResources = await Resource.insertMany(resources);
        console.log(`✅ Created ${createdResources.length} resources`);
        return createdResources;
    } catch (error) {
        console.error('❌ Error seeding resources:', error.message);
        throw error;
    }
};

// Main seed function
const seedDatabase = async () => {
    console.log('🌱 Starting database seeding...\n');

    try {
        await connectDB();

        const users = await seedUsers();
        const resources = await seedResources();

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Resources: ${resources.length}`);
        console.log('\n🔐 All accounts use password: Password@123');
        console.log('   Try: infraadmin@bitsathy.ac.in');
        console.log('   Try: hodcs@bitsathy.ac.in');

        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

// Run seeding
seedDatabase();
