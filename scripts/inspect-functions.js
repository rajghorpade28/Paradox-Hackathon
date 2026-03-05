const { Client, Functions } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_ADMIN_API_KEY);

const functions = new Functions(client);

async function inspectFunctions() {
    try {
        console.log("🔍 Fetching functions...");
        const list = await functions.list();

        if (list.total === 0) {
            console.log("❌ No functions found in this project.");
            return;
        }

        for (const fn of list.functions) {
            console.log(`\n--- Function: ${fn.name} (${fn.$id}) ---`);
            console.log(`Status: ${fn.enabled ? 'Enabled' : 'Disabled'}`);
            console.log(`Timeout: ${fn.timeout}s`);
            console.log(`Runtime: ${fn.runtime}`);

            console.log("📜 Fetching recent executions...");
            const execs = await functions.listExecutions(fn.$id);

            if (execs.total === 0) {
                console.log("   (No executions yet)");
            }

            for (const ex of execs.executions) {
                console.log(`\n   [Execution: ${ex.$id} | Status: ${ex.status} | Duration: ${ex.duration}s]`);
                if (ex.status === 'failed') {
                    console.log(`   ❌ ERROR LOG: ${ex.errors || 'No error output'}`);
                }
                console.log(`   📄 STDOUT LOG: ${ex.logs || 'No logs'}`);
            }

            // PROACTIVE FIX: Increase timeout if it's too low
            if (fn.timeout < 60) {
                console.log(`\n🛠️  Timeout is too low (${fn.timeout}s). Increasing to 60s...`);
                // Use the exact parameters from the fn object
                await functions.update(
                    fn.$id,
                    fn.name,
                    fn.execute,
                    fn.events,
                    fn.enabled,
                    60,
                    fn.entrypoint,
                    fn.commands,
                    fn.params,
                    fn.runtime
                );
                console.log(`✅ Timeout increased to 60s.`);
            }
        }
    } catch (e) {
        console.error("❌ Error inspecting functions:", e.message);
    }
}

inspectFunctions();
