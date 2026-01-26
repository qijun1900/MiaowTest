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
            console.error('ERRor:database Type: FileService 上传文件失败:', error);
            throw error;
        }
    }

}
module.exports = FileService;
    