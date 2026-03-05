const { Client, Functions } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_ADMIN_API_KEY);

const functions = new Functions(client);

async function deploy() {
    try {
        const list = await functions.list();
        const scannerFn = list.functions.find(f => f.name.includes("Phining") || f.name.includes("Scanner") || f.name.includes("Engine"));

        if (!scannerFn) {
            console.error("❌ Could not find the Phishing Engine function.");
            return;
        }

        console.log(`🚀 Found function: ${scannerFn.name} (${scannerFn.$id})`);

        console.log("📦 Uploading engine.tar.gz and triggering build...");
        const zipPath = path.join(__dirname, '../engine.tar.gz');
        const deployment = await functions.createDeployment(
            scannerFn.$id,
            InputFile.fromPath(zipPath, 'engine.tar.gz'),
            true // Activate deployment immediately
        );

        console.log(`✅ Deployment created: ${deployment.$id}`);
        console.log(`⏳ Build status: ${deployment.status}`);
        console.log(`✨ DONE! The function is now rebuilding with all modules.`);

    } catch (e) {
        console.error("❌ Deployment failed:", e.message);
    }
}

deploy();
