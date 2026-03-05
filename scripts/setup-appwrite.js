const { Client, Databases } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DB_ID || 'PhishingIntelligence';
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || 'scans';

// Note: This script requires an API Key with Database write permissions.
// You can get this from the Appwrite Console -> Settings -> API Keys.
const apiKey = process.env.APPWRITE_ADMIN_API_KEY;

if (!apiKey) {
    console.error('❌ Error: APPWRITE_ADMIN_API_KEY is missing in your environment.');
    console.log('💡 Please add it to your .env.local temporarily to run this setup script.');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(apiKey);

const databases = new Databases(client);

async function setup() {
    try {
        console.log(`🚀 Starting Appwrite Setup for Paradox...`);

        // 1. Create Database if it doesn't exist
        try {
            await databases.create(databaseId, 'Phishing Intelligence');
            console.log(`✅ Database "${databaseId}" created.`);
        } catch (e) {
            console.log(`ℹ️ Database "${databaseId}" already exists.`);
        }

        // 2. Create Collection
        try {
            await databases.createCollection(databaseId, collectionId, 'Scans');
            console.log(`✅ Collection "${collectionId}" created.`);
        } catch (e) {
            console.log(`ℹ️ Collection "${collectionId}" already exists.`);
        }

        // 3. Create Attributes
        const attributes = [
            { id: 'target_url', type: 'string', size: 1024, required: true },
            { id: 'scanId', type: 'integer', required: true },
            { id: 'scanDate', type: 'datetime', required: true },
            { id: 'deviceId', type: 'integer', required: true },
            { id: 'scanType', type: 'string', size: 128, required: true },
            { id: 'status', type: 'string', size: 32, required: true, default: 'pending' },
            { id: 'overall_risk_score', type: 'integer', required: false, default: 0 },
            { id: 'risk_category', type: 'string', size: 32, required: false },
            { id: 'domain_agent_data', type: 'string', size: 5000, required: false },
            { id: 'vision_agent_data', type: 'string', size: 5000, required: false },
            { id: 'content_agent_data', type: 'string', size: 5000, required: false },
            { id: 'location', type: 'string', size: 128, required: false },
            { id: 'resultStatus', type: 'string', size: 128, required: false },
        ];

        console.log(`🔨 Configuring attributes (this may take a minute)...`);
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(databaseId, collectionId, attr.id, attr.size, attr.required, attr.default);
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(databaseId, collectionId, attr.id, attr.required, 0, 2147483647, attr.default);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(databaseId, collectionId, attr.id, attr.required, attr.default);
                }
                console.log(`   + Attribute "${attr.id}" added.`);
            } catch (e) {
                console.log(`   ℹ️ Attribute "${attr.id}" already exists or is being created.`);
            }
        }

        console.log(`\n✨ DONE! Your backend schema is ready.`);
        console.log(`🔗 Next steps: Deploy your Appwrite function and try a scan.`);

    } catch (error) {
        console.error(`❌ Setup failed:`, error.message);
    }
}

setup();
