## 1. Appwrite Database Setup
You can set up the database and attributes manually, or use the **Automated Setup Script**:

### Option A: Automated Setup (RECOMMENDED)
1. Add your **Appwrite API Key** (with database scope) to `.env.local`:
   ```env
   APPWRITE_ADMIN_API_KEY=your_secret_key_here
   ```
2. Open your terminal in the project root and run:
   ```bash
   node scripts/setup-appwrite.js
   ```
   *This will automatically create the Database, Collection, and all 7 required Attributes.*

### Option B: Manual Setup
Create a collection named `scans` and add these attributes:

| Attribute ID | Type | Size | Allowed Values / Default |
| :--- | :--- | :--- | :--- |
| `target_url` | String | 1024 | Required |
| `scanId` | String | 128 | Optional |
| `status` | String | 32 | `pending`, `scanning`, `completed`, `failed` |
| `overall_risk_score` | Integer | - | Default: 0 |
| `risk_category` | String | 32 | `Safe`, `Warning`, `Critical` |
| `domain_agent_data` | String (Long) | 4096 | JSON Stringified (Optional) |
| `vision_agent_data` | String (Long) | 4096 | JSON Stringified (Optional) |
| `content_agent_data` | String (Long) | 4096 | JSON Stringified (Optional) |

> [!TIP]
> Use **Long String** (up to 4096 or more) for the `_agent_data` fields as they contain stringified JSON blobs.

---

## 2. Deploy the Appwrite Function
The engine lives in `backend/phishing-function`.

1. Go to **Functions** in Appwrite Console.
2. Create a new function called **"Phishing Engine"**.
3. Select **Python 3.11** (or 3.12) as the runtime.
4. **Deploy**: Upload the contents of `backend/phishing-function/` (ensure `main.py`, `ai_engine.py`, and `requirements.txt` are included).
5. **Entrypoint**: `main.py`

### Environment Variables
Configure these variables in the **Settings** tab of your Appwrite Function:

| Key | Value |
| :--- | :--- |
| `GEMINI_API_KEY` | Your Google AI Studio Key |
| `FIRECRAWL_API_KEY` | Your Firecrawl API Key |
| `APPWRITE_API_KEY` | A Project API Key with `databases.write` scope |
| `PROJECT_ID` | Your Appwrite Project ID |
| `DATABASE_ID` | Your Database ID |
| `COLLECTION_ID` | Your Collection ID |

---

## 3. Configure Events (The Trigger)
To make the scan start automatically when you click "Initiate AI Scan" in the UI:

1. Go to your **Function Settings**.
2. Under **Events**, add:
   - `databases.[DATABASE_ID].collections.[COLLECTION_ID].documents.*.create`
3. Now, whenever the frontend creates a document, the Function will automatically wake up and start the multi-agent scan.

---

## 4. Permissions
Ensure the collection permissions allow your users to interact:
- Go to Collection **Settings** -> **Permissions**.
- Add `Any` (or `Users`) with **Create** and **Read** permissions.

---

## 5. Local Frontend Config
Ensure your `.env.local` is correct:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=69a9375a0032afe1d83d
NEXT_PUBLIC_APPWRITE_DB_ID=69a938b3000c81b9bd0a
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=scans
```

### Verification Checklist
- [ ] Attributes `domain_agent_data`, `vision_agent_data`, etc. created in Appwrite.
- [ ] `GEMINI_API_KEY` set in Function Settings.
- [ ] Events configured for `*.create`.
- [ ] Collection Permissions set to `Any` (Create/Read).

**You are now ready to scan!** 🚀
