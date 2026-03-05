import json
import os
import time
from appwrite.client import Client
from appwrite.services.databases import Databases

# --- PLUMBING (Developer 1) ---
# Goal: Setup Appwrite cloud function to act as the backend glue.

def mock_ai_scan(url: str) -> dict:
    """Mock AI integration for testing tonight."""
    time.sleep(3)
    return {
        "overall_risk_score": 92,
        "risk_category": "Critical",
        "domain_agent_data": json.dumps({"findings": "Typosquatting detected", "red_flags": ["New Reg"]}),
        "vision_agent_data": json.dumps({"similarity": 95, "fake_url": url, "real_url": "https://www.paypal.com"}),
        "content_agent_data": json.dumps({"red_flags": ["Hidden Form"]})
    }

def main(context):
    """
    Appwrite Function Execution Handler.
    Triggered by: databases.[DB_ID].collections.[COLLECTION_ID].documents.*.create
    """
    client = Client()
    # Pull endpoint and project ID from environment variables provided by Appwrite
    client.set_endpoint(os.environ.get("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"))
    client.set_project(os.environ.get("APPWRITE_PROJECT", ""))
    client.set_key(os.environ.get("APPWRITE_API_KEY", ""))

    databases = Databases(client)
    db_id = "PhishingIntelligence"
    collection_id = "Scans"

    req = context.req
    res = context.res
    payload = req.body
    
    # Appwrite payloads are sometimes passed as stringified JSON
    if isinstance(payload, str):
        payload = json.loads(payload)

    target_url = payload.get("target_url")
    doc_id = payload.get("$id")
    
    if not target_url or not doc_id:
        context.error("Missing target_url or $id in the document creation event.")
        return res.json({"error": "Missing target_url or $id"}, 400)

    try:
        # 1. Acknowledge and update UI to 'scanning'
        context.log(f"Received scan request for {target_url}. Updating status to 'scanning'.")
        databases.update_document(
            database_id=db_id,
            collection_id=collection_id,
            document_id=doc_id,
            data={"status": "scanning"}
        )
        
        # 2. Run mock AI (Tomorrow: from ai_engine import run_agentic_scan)
        context.log("Running mock AI engine...")
        scan_results = mock_ai_scan(target_url)
        context.log(f"Generated results for mock AI: {scan_results}")
        
        # 3. Save final state to Appwrite
        context.log("Updating document with final AI results.")
        databases.update_document(
            database_id=db_id,
            collection_id=collection_id,
            document_id=doc_id,
            data={
                "status": "completed",
                "overall_risk_score": scan_results["overall_risk_score"],
                "risk_category": scan_results["risk_category"],
                "domain_agent_data": scan_results["domain_agent_data"],
                "vision_agent_data": scan_results["vision_agent_data"],
                "content_agent_data": scan_results["content_agent_data"]
            }
        )

        return res.json({"success": True, "score": scan_results["overall_risk_score"]})

    except Exception as e:
        context.error(f"Error executing scan: {str(e)}")
        # Fail gracefully
        databases.update_document(
            database_id=db_id,
            collection_id=collection_id,
            document_id=doc_id,
            data={
                "status": "failed",
                "overall_risk_score": 0
            }
        )
        return res.json({"success": False, "error": str(e)}, 500)
