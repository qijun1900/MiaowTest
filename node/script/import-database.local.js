const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB 连接字符串
const url = 'mongodb://localhost:27017';
const dbName = 'examinationsystem';
const collectionName = 'word_test_cet4';

async function importData() {
    const client = new MongoClient(url);

    try {
        // 连接到 MongoDB
        await client.connect();
        console.log('Connected to database');
        
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // 读取 JSON 文件
        const data = fs.readFileSync('CET4luan_1.json');
        const jsonData = JSON.parse(data);
        
        // 插入数据
        const result = await collection.insertMany(jsonData);
        console.log(`${result.insertedCount} documents were inserted`);
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        // 关闭连接
        await client.close();
    }
}

importData();