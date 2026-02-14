const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Resource = require('../models/Resource');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for seeding');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
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

    const users = [
        // Infrastructure Admin
        {
            name: 'Infrastructure Admin',
            email: 'infraadmin@bitsathy.ac.in',
            password: await hashPassword('Admin@123'),
            role: 'infra_admin',
            isEmailVerified: true
        },
        // IT Services Admin
        {
            name: 'IT Services Admin',
            email: 'itadmin@bitsathy.ac.in',
            password: await hashPassword('Admin@123'),
            role: 'it_admin',
            isEmailVerified: true
        },
        // Faculty
        {
            name: 'John Doe',
            email: 'john.doe@bitsathy.ac.in',
            password: await hashPassword('Faculty@123'),
            role: 'faculty',
            department: 'CS',
            isEmailVerified: true
        },
        {
            name: 'Kumar',
            email: 'kumar@bitsathy.ac.in',
            password: await hashPassword('Faculty@123'),
            role: 'faculty',
            department: 'EC',
            isEmailVerified: true
        },
        {
            name: 'Dr Sharma',
            email: 'dr.sharma@bitsathy.ac.in',
            password: await hashPassword('Faculty@123'),
            role: 'faculty',
            department: 'ME',
            isEmailVerified: true
        },
        {
            name: 'Prof Wilson',
            email: 'prof.wilson@bitsathy.ac.in',
            password: await hashPassword('Faculty@123'),
            role: 'faculty',
            department: 'IT',
            isEmailVerified: true
        },
        // HODs for all departments
        {
            name: 'HOD CS',
            email: 'hodcs@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'CS',
            isEmailVerified: true
        },
        {
            name: 'HOD AL',
            email: 'hodal@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'AL',
            isEmailVerified: true
        },
        {
            name: 'HOD AD',
            email: 'hodad@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'AD',
            isEmailVerified: true
        },
        {
            name: 'HOD IT',
            email: 'hodit@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'IT',
            isEmailVerified: true
        },
        {
            name: 'HOD EC',
            email: 'hodec@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'EC',
            isEmailVerified: true
        },
        {
            name: 'HOD ME',
            email: 'hodme@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'ME',
            isEmailVerified: true
        },
        {
            name: 'HOD EE',
            email: 'hodee@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'EE',
            isEmailVerified: true
        },
        {
            name: 'HOD EI',
            email: 'hodei@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'EI',
            isEmailVerified: true
        },
        {
            name: 'HOD CE',
            email: 'hodce@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'CE',
            isEmailVerified: true
        },
        {
            name: 'HOD MZ',
            email: 'hodmz@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'MZ',
            isEmailVerified: true
        },
        {
            name: 'HOD FD',
            email: 'hodfd@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'FD',
            isEmailVerified: true
        },
        {
            name: 'HOD FT',
            email: 'hodft@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'FT',
            isEmailVerified: true
        },
        {
            name: 'HOD BT',
            email: 'hodbt@bitsathy.ac.in',
            password: await hashPassword('HOD@123'),
            role: 'department',
            department: 'BT',
            isEmailVerified: true
        },
        // Clubs
        {
            name: 'NSS',
            email: 'nss@bitsathy.ac.in',
            password: await hashPassword('Club@123'),
            role: 'club',
            isEmailVerified: true
        },
        {
            name: 'NCC',
            email: 'ncc@bitsathy.ac.in',
            password: await hashPassword('Club@123'),
            role: 'club',
            isEmailVerified: true
        },
        {
            name: 'Rotaract',
            email: 'rotaract@bitsathy.ac.in',
            password: await hashPassword('Club@123'),
            role: 'club',
            isEmailVerified: true
        }
    ];

    try {
        await User.deleteMany({}); // Clear existing users
        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} users`);
        return createdUsers;
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        throw error;
    }
};

// Seed Resources
const seedResources = async () => {
    console.log('\n📝 Seeding Resources...');

    const resources = [
        // Infrastructure Resources (Fixed - managed by Infrastructure Admin)
        {
            name: 'Main Auditorium',
            type: 'auditorium',
            category: 'central',
            capacity: 500,
            location: 'Main Block, Ground Floor',
            amenities: ['Projector', 'Sound System', 'AC', 'Stage'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'infrastructure',
            isMovable: false
        },
        {
            name: 'Seminar Hall 1',
            type: 'central_seminar_hall',
            category: 'central',
            capacity: 200,
            location: 'Admin Block, 2nd Floor',
            amenities: ['Projector', 'Whiteboard', 'AC'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 6,
            managedBy: 'infrastructure',
            isMovable: false
        },
        {
            name: 'CS Lab 1',
            type: 'lab',
            category: 'department',
            capacity: 60,
            location: 'CS Block, 1st Floor',
            department: 'CS',
            amenities: ['Computers', 'Projector', 'AC'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 4,
            managedBy: 'infrastructure',
            isMovable: false
        },
        {
            name: 'CS Classroom 101',
            type: 'classroom',
            category: 'department',
            capacity: 80,
            location: 'CS Block, Ground Floor',
            department: 'CS',
            amenities: ['Projector', 'Whiteboard', 'AC'],
            isAvailable: true,
            requiresApproval: false,
            maxBookingDuration: 3,
            managedBy: 'infrastructure',
            isMovable: false
        },
        {
            name: 'EC Lab 1',
            type: 'lab',
            category: 'department',
            capacity: 50,
            location: 'EC Block, 2nd Floor',
            department: 'EC',
            amenities: ['Equipment', 'Projector', 'AC'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 4,
            managedBy: 'infrastructure',
            isMovable: false
        },
        {
            name: 'ME Workshop',
            type: 'lab',
            category: 'department',
            capacity: 40,
            location: 'ME Block, Ground Floor',
            department: 'ME',
            amenities: ['Machines', 'Tools', 'Safety Equipment'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 4,
            managedBy: 'infrastructure',
            isMovable: false
        },
        {
            name: 'Conference Room A',
            type: 'conference_room',
            category: 'central',
            capacity: 30,
            location: 'Admin Block, 3rd Floor',
            amenities: ['Projector', 'Conference Table', 'AC', 'Video Conferencing'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 4,
            managedBy: 'infrastructure',
            isMovable: false
        },

        // IT Services Resources (Movable - managed by IT Services Admin)
        {
            name: 'Portable Projector 1',
            type: 'projector',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['HDMI', 'VGA', 'Remote', 'Carry Case'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        },
        {
            name: 'Portable Projector 2',
            type: 'projector',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['HDMI', 'VGA', 'Remote', 'Carry Case'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        },
        {
            name: 'Laptop 1 - Dell',
            type: 'laptop',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['Charger', 'Mouse', 'Bag'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        },
        {
            name: 'Laptop 2 - HP',
            type: 'laptop',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['Charger', 'Mouse', 'Bag'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        },
        {
            name: 'Sound System 1',
            type: 'sound_system',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['Speakers', 'Microphones', 'Mixer', 'Cables'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        },
        {
            name: 'Camera - Canon DSLR',
            type: 'camera',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['Lens', 'Battery', 'Charger', 'Memory Card', 'Bag'],
            isAvailable: true,
            requiresApproval: true,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        },
        {
            name: 'Portable Whiteboard',
            type: 'whiteboard',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['Markers', 'Eraser', 'Stand'],
            isAvailable: true,
            requiresApproval: false,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        },
        {
            name: 'Extension Cables Set',
            type: 'cables',
            category: 'movable_asset',
            capacity: 1,
            location: 'IT Services Store',
            amenities: ['Power Strips', 'Extension Cords', 'Cable Organizers'],
            isAvailable: true,
            requiresApproval: false,
            maxBookingDuration: 8,
            managedBy: 'it_services',
            isMovable: true
        }
    ];

    try {
        await Resource.deleteMany({}); // Clear existing resources
        const createdResources = await Resource.insertMany(resources);
        console.log(`✅ Created ${createdResources.length} resources`);
        console.log(`   - Infrastructure resources: ${createdResources.filter(r => r.managedBy === 'infrastructure').length}`);
        console.log(`   - IT Services resources: ${createdResources.filter(r => r.managedBy === 'it_services').length}`);
        return createdResources;
    } catch (error) {
        console.error('❌ Error seeding resources:', error);
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
        console.log(`   Total Users: ${users.length}`);
        console.log(`   - Admins: ${users.filter(u => u.role === 'infra_admin' || u.role === 'it_admin').length}`);
        console.log(`   - Faculty: ${users.filter(u => u.role === 'faculty').length}`);
        console.log(`   - HODs: ${users.filter(u => u.role === 'department').length}`);
        console.log(`   - Clubs: ${users.filter(u => u.role === 'club').length}`);
        console.log(`   Total Resources: ${resources.length}`);
        console.log(`   - Infrastructure: ${resources.filter(r => r.managedBy === 'infrastructure').length}`);
        console.log(`   - IT Services: ${resources.filter(r => r.managedBy === 'it_services').length}`);

        console.log('\n🔐 Test Credentials:');
        console.log('   Infrastructure Admin: infraadmin@bitsathy.ac.in / Admin@123');
        console.log('   IT Services Admin: itadmin@bitsathy.ac.in / Admin@123');
        console.log('   Faculty: john.doe@bitsathy.ac.in / Faculty@123');
        console.log('   HOD CS: hodcs@bitsathy.ac.in / HOD@123');
        console.log('   Club NSS: nss@bitsathy.ac.in / Club@123');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run seeding
seedDatabase();
