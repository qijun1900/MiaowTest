const FileResourceModel = require('../../models/FileResourceModel');
const FileService = {
    uploadFile: async ({
        url, storage, name, category, description, 
        tag, ext, size, mimeType, creator, path,status,
    }) => {
        try {
            const fileResource = new FileResourceModel({
                url,
                storage,
                name,
                originalName: name,
                category,
                description,    
                tag,
                ext,
                size,
                mimeType,
                creator,
                path,
                createdAt: new Date(),
                updatedAt: new Date(),
                status
            });
            await fileResource.save();
            return fileResource;
        }catch (error) {
            console.error('ERROR:database Type: FileService 上传文件失败:', error);
            throw error;
        }
    },
    getTags: async () => {
        try {
            const tags = await FileResourceModel.distinct('tag', 
                { tag: { $ne: '' } }
            );
            return tags;
        }catch (error) {
            console.error('ERROR:database Type: FileService 获取业务标签数组失败:', error);
            throw error;
        }
    }
}
module.exports = FileService;
    