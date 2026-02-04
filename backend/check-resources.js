// Check resources in database
require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('./models/Resource');

const checkResources = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const resources = await Resource.find({});
        console.log(`📊 Total resources: ${resources.length}\n`);

        resources.forEach((resource, index) => {
            console.log(`${index + 1}. ${resource.name}`);
            console.log(`   ID: ${resource._id}`);
            console.log(`   Type: ${resource.type}`);
            console.log(`   Location: ${resource.location}`);
            console.log(`   Available: ${resource.isAvailable}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkResources();
