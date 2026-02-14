// Complete database reset and seed
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://anujkumar:Anujkumar@cluster0.lrqmbni.mongodb.net/campusreserve?appName=Cluster0';

async function resetAndSeed() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        // Drop all collections
        console.log('\n🗑️  Dropping all collections...');
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.drop();
            console.log(`   Dropped: ${collection.collectionName}`);
        }

        // Define schemas
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: String,
            role: String,
            department: String,
            isEmailVerified: Boolean
        });

        const resourceSchema = new mongoose.Schema({
            name: String,
            type: String,
            category: String,
            capacity: Number,
            location: String,
            department: String,
            amenities: [String],
            isAvailable: Boolean,
            requiresApproval: Boolean,
            maxBookingDuration: Number,
            managedBy: String,
            isMovable: Boolean
        });

        const User = mongoose.model('User', userSchema);
        const Resource = mongoose.model('Resource', resourceSchema);

        // Hash password
        const hashedPassword = await bcrypt.hash('Password@123', 10);

        // Create users
        console.log('\n📝 Creating users...');
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

        // Create resources
        console.log('\n📝 Creating resources...');
        const resources = await Resource.insertMany([
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
                type: 'laptop',
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
        ]);
        console.log(`✅ Created ${resources.length} resources`);

        console.log('\n✅ Database reset and seeded successfully!');
        console.log('\n🔐 Login credentials:');
        console.log('   Email: infraadmin@bitsathy.ac.in');
        console.log('   Password: Password@123');

        await mongoose.connection.close();
        console.log('\n👋 Done!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

resetAndSeed();
