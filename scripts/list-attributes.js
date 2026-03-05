const { Client, Databases } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DB_ID;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;
const apiKey = process.env.APPWRITE_ADMIN_API_KEY;

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(apiKey);

const databases = new Databases(client);

async function listAttributes() {
    try {
        const response = await databases.listAttributes(databaseId, collectionId);
        console.log("--- Collection Attributes ---");
        response.attributes.forEach(attr => {
            console.log(`ID: ${attr.key}, Required: ${attr.required}, Default: ${attr.default}, Type: ${attr.type}`);
        });
    } catch (e) {
        console.error("Error listing attributes:", e.message);
    }
}

listAttributes();
