const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// MongoDB 连接字符串
const url = 'mongodb://localhost:27017';
const dbName = 'examinationsystem';
const collectionName = 'words';
const dataDir = path.join(__dirname, 'words_data');

async function importData() {
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log('Connected to database');
        
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
        console.log(`Found ${files.length} JSON files to import`);
        
        let totalInserted = 0;
        
        for (const file of files) {
            const filePath = path.join(dataDir, file);
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                const lines = data.split('\n').filter(line => line.trim());
                const jsonData = lines.map(line => JSON.parse(line));
                
                const result = await collection.insertMany(jsonData);
                console.log(`${file}: ${result.insertedCount} documents inserted`);
                totalInserted += result.insertedCount;
            } catch (error) {
                console.error(`${file}: Error - ${error.message}`);
            }
        }
        
        console.log(`\nTotal: ${totalInserted} documents were inserted`);
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        await client.close();
    }
}

importData();