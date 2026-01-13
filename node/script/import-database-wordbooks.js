#!/usr/bin/env node

/**
 * 默认词书初始化脚本
 * 用于将默认词书数据导入到数据库中
 */

// 加载环境变量
require('dotenv').config();

// 导入数据库管理器
const { dbManager } = require('../db/db.enhanced.js');

// 导入词书模型和默认词书数据
const { WordBooksModel } = require('../models/WordBooksModel.js');

// 获取默认词书数据（从WordBooksModel中导出的bookIdToImageMap）
const { bookIdToImageMap } = require('../models/WordBooksModel.js');

/**
 * 初始化默认词书
 */
async function initializeDefaultWordBooks() {
  try {
    console.log('========================================');
    console.log('📚 开始初始化默认词书...');
    console.log('========================================');

    // 连接数据库
    await dbManager.connect();
    console.log('✅ 数据库连接成功');

    // 转换默认词书数据为数组格式
    const defaultWordBooks = Object.entries(bookIdToImageMap).map(([bookId, bookInfo]) => ({
      bookId,
      ...bookInfo
    }));

    console.log(`📋 准备导入 ${defaultWordBooks.length} 本词书`);

    // 批量导入词书，使用upsert防止重复插入
    const importPromises = defaultWordBooks.map(async (book) => {
      try {
        // 使用bookId作为唯一标识符，不存在则插入，存在则更新
        const result = await WordBooksModel.updateOne(
          { bookId: book.bookId },
          { $set: book },
          { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
          console.log(`✅ 新增词书: ${book.title} (${book.bookId})`);
        } else if (result.modifiedCount > 0) {
          console.log(`🔄 更新词书: ${book.title} (${book.bookId})`);
        } else {
          console.log(`⏭️  跳过词书: ${book.title} (${book.bookId}) - 无需更新`);
        }
        
        return result;
      } catch (error) {
        console.error(`❌ 导入词书失败: ${book.title} (${book.bookId})`);
        console.error(`   错误信息: ${error.message}`);
        throw error;
      }
    });

    // 等待所有导入操作完成
    await Promise.all(importPromises);

    // 统计导入结果
    const totalBooks = await WordBooksModel.countDocuments();
    console.log('\n========================================');
    console.log('✅ 默认词书初始化完成！');
    console.log('========================================');
    console.log(`📊 导入结果: 成功导入 ${defaultWordBooks.length} 本词书`);
    console.log(`📊 当前数据库词书总数: ${totalBooks} 本`);
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ 初始化默认词书失败！');
    console.error(`   错误信息: ${error.message}`);
    console.error(`   详细错误: ${error.stack}`);
    
    // 确保数据库连接被关闭
    try {
      await dbManager.disconnect();
    } catch (disconnectError) {
      console.error('❌ 关闭数据库连接时也发生了错误:', disconnectError.message);
    }
    process.exit(1);
  }
}

// 执行初始化函数
initializeDefaultWordBooks();
