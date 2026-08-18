import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export async function connectDB() {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('No MONGODB_URI found in environment variables.');
      console.log('Starting local in-memory MongoDB server fallback...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`In-memory MongoDB server started at: ${uri}`);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      console.log('In-memory MongoDB server stopped.');
    }
  } catch (error) {
    console.error('Error during database disconnection:', error);
  }
}
