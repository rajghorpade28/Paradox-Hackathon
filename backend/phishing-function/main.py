import os
import json
from appwrite.client import Client
from appwrite.services.databases import Databases
from ai_engine import run_agentic_scan


def main(context):
    client = Client()
    # Configuration from environment variables
    endpoint    = os.environ.get("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1")
    project_id  = os.environ.get("APPWRITE_PROJECT") or os.environ.get("PROJECT_ID")
    api_key     = os.environ.get("APPWRITE_API_KEY")

    client.set_endpoint(endpoint)
    if project_id: client.set_project(project_id)
    if api_key:    client.set_key(api_key)

    databases = Databases(client)

    try:
        # Appwrite 1.4+ sends body as dict if JSON, but older/other triggers might send string
        payload = context.req.body
        if not payload:
            return context.res.json({"status": "error", "message": "Missing payload"}, 400)

        if isinstance(payload, str):
            try:
                data = json.loads(payload)
            except:
                data = {"target_url": payload} # Fallback if direct string
        else:
            data = payload

        target_url    = data.get("target_url")
        document_id   = data.get("$id")
        database_id   = data.get("$databaseId") or os.environ.get("DATABASE_ID")
        collection_id = data.get("$collectionId") or os.environ.get("COLLECTION_ID")

        if not target_url or not document_id:
            return context.res.json({"status": "error", "message": "Missing target_url or document_id"}, 400)

        # 1. Signal frontend that scanning has started
        context.log(f"Scan initiated for: {target_url}")
        databases.update_document(
            database_id=database_id,
            collection_id=collection_id,
            document_id=document_id,
            data={"status": "scanning"},
        )

        # 2. Run the real multi-agent scan
        scan_results = run_agentic_scan(target_url)

        # 3. Write all results back — ai_engine already returns JSON strings, no double-encoding
        context.log(f"Scan complete. Score: {scan_results.get('overall_risk_score')}")
        databases.update_document(
            database_id=database_id,
            collection_id=collection_id,
            document_id=document_id,
            data={
                "status":             "completed",
                "overall_risk_score": scan_results.get("overall_risk_score"),
                "risk_category":      scan_results.get("risk_category"),
                "domain_agent_data":  scan_results.get("domain_agent_data"),
                "vision_agent_data":  scan_results.get("vision_agent_data"),
                "content_agent_data": scan_results.get("content_agent_data"),
            },
        )

        return context.res.json({"status": "success", "document_id": document_id})

    except Exception as e:
        context.error(f"Function error: {str(e)}")
        try:
            if "database_id" in locals() and "document_id" in locals():
                databases.update_document(
                    database_id=database_id,
                    collection_id=collection_id,
                    document_id=document_id,
                    data={"status": "failed"},
                )
        except Exception:
            pass
        return context.res.json({"status": "error", "message": str(e)}, 500)
