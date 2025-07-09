const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndexes() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/media-platform';
        
        console.log('连接到MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ 已连接到MongoDB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('devices');
        
        console.log('📋 当前索引:');
        const indexes = await collection.indexes();
        indexes.forEach((index, i) => {
            console.log(`  ${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
        });
        
        // 删除地理位置索引
        try {
            await collection.dropIndex('location.coordinates_2dsphere');
            console.log('✅ 删除地理位置索引成功');
        } catch (error) {
            console.log('⚠️  地理位置索引不存在或已删除');
        }
        
        console.log('\n📋 删除后的索引:');
        const newIndexes = await collection.indexes();
        newIndexes.forEach((index, i) => {
            console.log(`  ${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
        });
        
        await mongoose.connection.close();
        console.log('✅ 索引清理完成');
        
    } catch (error) {
        console.error('❌ 索引清理失败:', error);
        process.exit(1);
    }
}

dropIndexes();
