import time
import json
from appwrite.client import Client
from appwrite.services.databases import Databases

# This is the entrypoint for the Appwrite function.
# It expects the req and res objects as arguments.
def main(context):
    client = Client()
    
    # Environment variables set in the Appwrite Function settings
    client.set_endpoint(context.req.variables.get('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
    client.set_project(context.req.variables.get('PROJECT_ID'))
    client.set_key(context.req.variables.get('APPWRITE_API_KEY'))
    
    databases = Databases(client)

    try:
        # Access the payload passed from the Appwrite Event
        # The event: databases.[DB_ID].collections.[COLLECTION_ID].documents.*.create
        payload = context.req.body_raw
        if payload:
            data = json.loads(payload)
        else:
             return context.res.json({
                "status": "error",
                "message": "Missing payload"
            }, 400)
            
        target_url = data.get('target_url')
        document_id = data.get('$id')
        database_id = data.get('$databaseId')
        collection_id = data.get('$collectionId')

        if not target_url or not document_id:
             return context.res.json({
                "status": "error",
                "message": "Missing target_url or document_id"
            }, 400)

        # 1. Update Document Status to "scanning" immediately
        context.log(f"Initiating scan for URL: {target_url} (Doc: {document_id})")
        databases.update_document(
            database_id=database_id,
            collection_id=collection_id,
            document_id=document_id,
            data={"status": "scanning"}
        )

        # 2. Execute Mock AI Scan 
        # DEVELOPER 2: Your run_agentic_scan(url) function goes here.
        # Replace the `mock_ai_scan` call with your actual class instantiation and execution.
        scan_results = mock_ai_scan(target_url, context)

        # 3. Update Document with Results and set status to "completed"
        context.log("Scan complete. Updating Appwrite document.")
        databases.update_document(
            database_id=database_id,
            collection_id=collection_id,
            document_id=document_id,
            data={
                "status": "completed",
                "overall_risk_score": scan_results.get("overall_risk_score"),
                "risk_category": scan_results.get("risk_category"),
                "domain_agent_data": json.dumps(scan_results.get("domain_agent_data", {})),
                "vision_agent_data": json.dumps(scan_results.get("vision_agent_data", {})),
                "content_agent_data": json.dumps(scan_results.get("content_agent_data", {}))
            }
        )

        return context.res.json({
            "status": "success",
            "message": "Scan completed successfully",
            "document_id": document_id
        })

    except Exception as e:
        context.error(f"Function Error: {str(e)}")
        # Attempt to mark the document as failed
        try:
           if 'database_id' in locals() and 'document_id' in locals():
               databases.update_document(
                    database_id=database_id,
                    collection_id=collection_id,
                    document_id=document_id,
                    data={"status": "failed"}
                )
        except Exception as update_err:
             context.error(f"Failed to update document status to failed: {str(update_err)}")


        return context.res.json({
            "status": "error",
            "message": str(e)
        }, 500)


def mock_ai_scan(url, context):
    """
    Dummy function to simulate AI agent scanning process.
    Developer 2 will replace this with the real Agent logic.
    """
    context.log(f"Mocking AI scan for {url}...")
    time.sleep(3) # Simulate processing delay
    
    return {
        "overall_risk_score": 85,
        "risk_category": "Critical",
        "domain_agent_data": {
            "age_days": 2,
            "registrar_reputation": "Low",
            "ssl_valid": False,
            "red_flags": ["Domain registered 2 days ago", "Free SSL certificate used"]
        },
        "vision_agent_data": {
            "visual_similarity_score": 0.92,
            "matched_brand": "PayPal",
            "suspicious_screenshot_url": "https://placehold.co/600x400/222222/crimson?text=Suspicious+Login",
            "target_brand_screenshot_url": "https://placehold.co/600x400/222222/safe?text=Official+PayPal"
        },
        "content_agent_data": {
            "urgency_keywords_detected": True,
            "suspicious_forms": 1,
            "red_flags": ["Asks for PII indiscriminately", "High urgency language ('Account suspended')"]
        }
    }
