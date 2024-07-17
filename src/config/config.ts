import { config } from 'dotenv';
config();

import { MongoClient, Db } from 'mongodb';

const connection = process.env.MONGO_URL as string;
const dbName = process.env.DB_NAME;

if (!connection){
    console.log('Can\'t connect to database');
}

let client: MongoClient;

export const getMongoClient = async (): Promise<MongoClient> => {
    if (!client){
        client = new MongoClient(connection);
        await client.connect();
    }
    return client;
}

export const getDb = async (): Promise<Db> => {
    const client = await getMongoClient();
    const db = client.db(dbName);
    return db;
}
