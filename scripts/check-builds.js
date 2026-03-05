const { Client, Functions } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_ADMIN_API_KEY);

const functions = new Functions(client);

async function checkBuilds() {
    try {
        const list = await functions.list();
        for (const fn of list.functions) {
            console.log(`\n--- Build Logs for: ${fn.name} ---`);
            const deployments = await functions.listDeployments(fn.$id);
            for (const d of deployments.deployments) {
                console.log(`Deployment: ${d.$id} | Status: ${d.status} | Build ID: ${d.buildId}`);
                if (d.buildId) {
                    // This is where we see what went wrong during npm/pip install
                    const build = await functions.getBuild(fn.$id, d.buildId);
                    console.log(`Build Logs:\n${build.logs || 'No build logs available'}`);
                }
            }
        }
    } catch (e) {
        console.error("Error checking builds:", e.message);
    }
}

checkBuilds();
