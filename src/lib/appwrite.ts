import { Client, Databases, ID } from 'appwrite';

export { ID };

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';

export const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

export const databases = new Databases(client);

// For hackathon purposes
export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID || 'PhishingIntelligence';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || 'Scans';
