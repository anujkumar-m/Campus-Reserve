// Complete seed script for database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Resource = require('./models/Resource');
const Booking = require('./models/Booking');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // === SEED USERS ===
        console.log('👥 Seeding users...');
        const users = [
            {
                name: 'Admin User',
                email: 'admin@bitsathy.ac.in',
                password: 'admin@123',
                role: 'admin',
                authProvider: 'local',
            },
            {
                name: 'Dr. Sarah Johnson',
                email: 'sarah@college.edu',
                password: 'password123',
                role: 'faculty',
                department: 'Computer Science',
                authProvider: 'local',
            },
            {
                name: 'Alex Chen',
                email: 'alex@student.edu',
                password: 'password123',
                role: 'student',
                department: 'Computer Science',
                authProvider: 'local',
            },
            {
                name: 'CS Department',
                email: 'cs@college.edu',
                password: 'password123',
                role: 'department',
                department: 'Computer Science',
                authProvider: 'local',
            },
        ];

        for (const userData of users) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                await User.create(userData);
                console.log(`  ✅ Created user: ${userData.email}`);
            } else {
                console.log(`  ℹ️  User ${userData.email} already exists`);
            }
        }

        // === SEED RESOURCES ===
        console.log('\n🏫 Seeding resources...');
        const resources = [
            {
                name: 'SF SEMINAR HALL 1',
                type: 'department_seminar_hall',
                category: 'department',
                capacity: 100,
                location: 'SF Block, 2nd Floor',
                amenities: ['Projector', 'AC', 'Whiteboard', 'Sound System'],
                department: 'CS',
                isAvailable: true,
            },
            {
                name: 'CS LAB 1',
                type: 'lab',
                category: 'department',
                capacity: 60,
                location: 'CS Block, 1st Floor',
                amenities: ['Computers', 'AC', 'Projector'],
                department: 'CS',
                isAvailable: true,
            },
            {
                name: 'Main Auditorium',
                type: 'auditorium',
                category: 'central',
                capacity: 500,
                location: 'Main Building',
                amenities: ['Stage', 'Sound System', 'Projector', 'AC', 'Lighting'],
                isAvailable: true,
            },
            {
                name: 'Conference Room A',
                type: 'conference_room',
                category: 'central',
                capacity: 30,
                location: 'Admin Block, 3rd Floor',
                amenities: ['Projector', 'AC', 'Whiteboard', 'Video Conferencing'],
                isAvailable: true,
            },
            {
                name: 'IT LAB 2',
                type: 'lab',
                category: 'department',
                capacity: 40,
                location: 'IT Block, 2nd Floor',
                amenities: ['Computers', 'AC', 'Projector'],
                department: 'IT',
                isAvailable: true,
            },
            {
                name: 'Classroom 301',
                type: 'classroom',
                category: 'department',
                capacity: 50,
                location: 'Main Building, 3rd Floor',
                amenities: ['Projector', 'Whiteboard', 'AC'],
                department: 'CS',
                isAvailable: true,
            },
            {
                name: 'Projector - Sony VPL',
                type: 'projector',
                category: 'movable_asset',
                capacity: 1,
                location: 'Equipment Room',
                amenities: ['HDMI', 'VGA', 'Remote Control'],
                isAvailable: true,
            },
            {
                name: 'DSLR Camera - Canon EOS',
                type: 'camera',
                category: 'movable_asset',
                capacity: 1,
                location: 'Equipment Room',
                amenities: ['Tripod', 'Extra Battery', 'Memory Card'],
                isAvailable: true,
            },
        ];

        for (const resourceData of resources) {
            const existing = await Resource.findOne({ name: resourceData.name });
            if (!existing) {
                await Resource.create(resourceData);
                console.log(`  ✅ Created resource: ${resourceData.name}`);
            } else {
                console.log(`  ℹ️  Resource ${resourceData.name} already exists`);
            }
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Summary:');
        console.log(`  Users: ${await User.countDocuments()}`);
        console.log(`  Resources: ${await Resource.countDocuments()}`);
        console.log(`  Bookings: ${await Booking.countDocuments()}`);

        console.log('\n🔐 Login credentials:');
        console.log('  Admin Email: admin@bitsathy.ac.in');
        console.log('  Admin Password: admin@123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
