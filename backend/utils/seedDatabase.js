require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany();
        await Resource.deleteMany();
        await Booking.deleteMany();
        console.log('Existing data cleared');

        // Create users
        console.log('Creating users...');
        const users = await User.create([
            {
                name: 'Dr. Admin User',
                email: 'admin@college.edu',
                password: 'password123',
                role: 'admin',
            },
            {
                name: 'Prof. Sarah Johnson',
                email: 'sarah@college.edu',
                password: 'password123',
                role: 'faculty',
                department: 'Computer Science',
            },
            {
                name: 'Alex Thompson',
                email: 'alex@student.edu',
                password: 'password123',
                role: 'student',
                department: 'Computer Science',
            },
            {
                name: 'CS Department Head',
                email: 'cs@college.edu',
                password: 'password123',
                role: 'department',
                department: 'Computer Science',
            },
            {
                name: 'Tech Club Representative',
                email: 'techclub@college.edu',
                password: 'password123',
                role: 'club',
                clubName: 'Technology Club',
            },
            {
                name: 'Prof. John Doe',
                email: 'john@college.edu',
                password: 'password123',
                role: 'faculty',
                department: 'Electronics',
            },
        ]);
        console.log(`Created ${users.length} users`);

        // Create resources
        console.log('Creating resources...');
        const resources = await Resource.create([
            {
                name: 'Lecture Hall A',
                type: 'classroom',
                capacity: 120,
                location: 'Building A, Floor 1',
                amenities: ['Projector', 'Whiteboard', 'AC', 'Mic System'],
                department: 'Computer Science',
                isAvailable: true,
            },
            {
                name: 'Computer Lab 101',
                type: 'lab',
                capacity: 40,
                location: 'Building B, Floor 2',
                amenities: ['40 PCs', 'Projector', 'AC', 'High-Speed Internet'],
                department: 'Computer Science',
                isAvailable: true,
            },
            {
                name: 'Seminar Hall - Main',
                type: 'seminar_hall',
                capacity: 200,
                location: 'Main Building, Floor 1',
                amenities: ['Stage', 'Projector', 'Sound System', 'AC', 'Video Conferencing'],
                isAvailable: true,
            },
            {
                name: 'Classroom 201',
                type: 'classroom',
                capacity: 60,
                location: 'Building A, Floor 2',
                amenities: ['Projector', 'Whiteboard', 'AC'],
                department: 'Electronics',
                isAvailable: true,
            },
            {
                name: 'Physics Lab',
                type: 'lab',
                capacity: 30,
                location: 'Science Block, Floor 1',
                amenities: ['Lab Equipment', 'Safety Gear', 'Projector'],
                department: 'Physics',
                isAvailable: false,
            },
            {
                name: 'Conference Room B',
                type: 'seminar_hall',
                capacity: 50,
                location: 'Admin Block, Floor 3',
                amenities: ['Video Conferencing', 'Whiteboard', 'AC', 'Smart TV'],
                isAvailable: true,
            },
            {
                name: 'AI Research Lab',
                type: 'lab',
                capacity: 25,
                location: 'Building B, Floor 3',
                amenities: ['GPU Workstations', 'Projector', 'AC', 'High-Speed Internet'],
                department: 'Computer Science',
                isAvailable: true,
            },
            {
                name: 'Lecture Hall C',
                type: 'classroom',
                capacity: 80,
                location: 'Building C, Floor 1',
                amenities: ['Projector', 'Whiteboard', 'AC', 'Recording Setup'],
                department: 'Mathematics',
                isAvailable: true,
            },
        ]);
        console.log(`Created ${resources.length} resources`);

        // Create bookings
        console.log('Creating bookings...');
        const bookings = await Booking.create([
            {
                resourceId: resources[0]._id, // Lecture Hall A
                userId: users[1]._id, // Prof. Sarah Johnson
                date: '2026-02-05',
                timeSlot: { start: '09:00', end: '11:00' },
                purpose: 'Data Structures Lecture',
                status: 'approved',
                department: 'Computer Science',
            },
            {
                resourceId: resources[1]._id, // Computer Lab 101
                userId: users[2]._id, // Alex Thompson
                date: '2026-02-06',
                timeSlot: { start: '14:00', end: '16:00' },
                purpose: 'Programming Practice Session',
                status: 'pending',
                department: 'Computer Science',
            },
            {
                resourceId: resources[2]._id, // Seminar Hall - Main
                userId: users[4]._id, // Tech Club
                date: '2026-02-10',
                timeSlot: { start: '15:00', end: '18:00' },
                purpose: 'Annual Tech Fest Inauguration',
                status: 'pending',
            },
            {
                resourceId: resources[3]._id, // Classroom 201
                userId: users[1]._id, // Prof. Sarah Johnson
                date: '2026-02-04',
                timeSlot: { start: '11:00', end: '12:00' },
                purpose: 'Guest Lecture on IoT',
                status: 'approved',
                department: 'Electronics',
            },
            {
                resourceId: resources[6]._id, // AI Research Lab
                userId: users[2]._id, // Alex Thompson
                date: '2026-02-07',
                timeSlot: { start: '10:00', end: '13:00' },
                purpose: 'Machine Learning Project Work',
                status: 'rejected',
                department: 'Computer Science',
            },
        ]);
        console.log(`Created ${bookings.length} bookings`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Users:');
        console.log('Admin: admin@college.edu / password123');
        console.log('Faculty: sarah@college.edu / password123');
        console.log('Student: alex@student.edu / password123');
        console.log('Department: cs@college.edu / password123');
        console.log('Club: techclub@college.edu / password123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
