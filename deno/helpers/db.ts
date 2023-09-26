import { MongoClient, Database } from 'https://deno.land/x/mongo@v0.32.0/mod.ts';

const client = new MongoClient();

export async function connectToDatabase() {
    await client.connect(
        'mongodb+srv://tyacoolidge:E6imS1oVko9dYP4L@cluster0.8ljpbvu.mongodb.net/?authMechanism=SCRAM-SHA-1'
    );
}

export function getDb() {
    const db: Database = client.database('denoTest');
    return db;
}
