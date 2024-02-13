#!/usr/bin/node

const { MongoClient } = require('mongodb');
const mongo = require('mongodb');

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'file_manager';
        
        const uri = `mongodb://${host}:${port}`;
        this.client = new MongoClient(uri, { useUnifiedTopology: true });  
        this.connected = false;
        this.client.connect().then(() => {
            this.connected = true;
        }).catch((err) => {
            console.error('Error connecting to MongoDB:', err);
            process.exit(1);
        });
    }

    isAlive() {
        return this.connected;
    }

    async nbUsers() {
        await this.client.connect();
        const users = await this.client.db(this.database).collection('users').countDocuments();
        return users;
    }

    async nbFiles() {
        await this.client.connect();
        const files = await this.client.db(this.database).collection('files').countDocuments();
        return files;
    }
}

const dbClient = new DBClient();
module.exports = dbClient;