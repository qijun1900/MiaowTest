// 本地静态文件迁移到阿里云 OSS 脚本
const path = require('path');
const ossHelper = require('../helpers/ossHelper');

// 本地静态文件目录
const localPublicDir = path.join(__dirname, '../public');

// 开始迁移
async function startMigration() {
    console.log('开始迁移本地静态文件到阿里云 OSS...');
    console.log(`本地静态文件目录: ${localPublicDir}`);
    
    try {
        // 迁移 avataruploads 目录
        console.log('\n迁移 avataruploads 目录...');
        const avatarResults = await ossHelper.migrateDirToOSS(
            path.join(localPublicDir, 'avataruploads'),
            'avataruploads'
        );
        console.log(`avataruploads 目录迁移完成，共迁移 ${avatarResults.length} 个文件`);
        
        // 迁移 examcoveruploads 目录
        console.log('\n迁移 examcoveruploads 目录...');
        const examCoverResults = await ossHelper.migrateDirToOSS(
            path.join(localPublicDir, 'examcoveruploads'),
            'examcoveruploads'
        );
        console.log(`examcoveruploads 目录迁移完成，共迁移 ${examCoverResults.length} 个文件`);
        
        // 迁移 newsuploads 目录
        console.log('\n迁移 newsuploads 目录...');
        const newsResults = await ossHelper.migrateDirToOSS(
            path.join(localPublicDir, 'newsuploads'),
            'newsuploads'
        );
        console.log(`newsuploads 目录迁移完成，共迁移 ${newsResults.length} 个文件`);
        
        // 迁移 productuploads 目录
        console.log('\n迁移 productuploads 目录...');
        const productResults = await ossHelper.migrateDirToOSS(
            path.join(localPublicDir, 'productuploads'),
            'productuploads'
        );
        console.log(`productuploads 目录迁移完成，共迁移 ${productResults.length} 个文件`);
        
        // 迁移 stylesheets 目录
        console.log('\n迁移 stylesheets 目录...');
        const stylesheetResults = await ossHelper.migrateDirToOSS(
            path.join(localPublicDir, 'stylesheets'),
            'stylesheets'
        );
        console.log(`stylesheets 目录迁移完成，共迁移 ${stylesheetResults.length} 个文件`);
        
        // 计算总迁移文件数
        const totalFiles = 
            avatarResults.length + 
            examCoverResults.length + 
            newsResults.length + 
            productResults.length + 
            stylesheetResults.length;
        
        console.log('\n====================================');
        console.log('本地静态文件迁移到阿里云 OSS 完成！');
        console.log(`总迁移文件数: ${totalFiles}`);
        console.log('====================================');
        
    } catch (error) {
        console.error('\n迁移过程中发生错误:', error);
        process.exit(1);
    }
}

// 执行迁移
startMigration();
