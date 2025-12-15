import { MongoClient, Db } from 'mongodb';
// import mongoose from 'mongoose'; // Removed to fix "Cannot find module 'mongoose'" lint error

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const clientPromise = (async () => {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://kevin:kevin@cluster0.3eo8tjf.mongodb.net';

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined. Please add it to .env.local');
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  await client.connect();
  return client;
})();

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    console.log('[v0] Using cached MongoDB connection');
    return { client: cachedClient, db: cachedDb };
  }

  const client = await clientPromise;
  const db = client.db('admin_panel') || client.db();

  cachedClient = client;
  cachedDb = db;

  console.log('[v0] MongoDB connection successful');
  return { client, db };
}

// Mongoose connection for models
let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://kevin:kevin@cluster0.3eo8tjf.mongodb.net';

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    const db = await mongoose.connect(uri, {
      dbName: 'admin_panel',
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default clientPromise;
