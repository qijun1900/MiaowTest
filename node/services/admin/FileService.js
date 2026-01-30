const {deleteFile} = require('../../helpers/ossHelper');
const FileResourceModel = require('../../models/FileResourceModel');
const FileService = {
    uploadFile: async ({
        url, storage, name, category, description,
        tag, ext, size, mimeType, creator, path, status,
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
        } catch (error) {
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
        } catch (error) {
            console.error('ERROR:database Type: FileService 获取业务标签数组失败:', error);
            throw error;
        }
    },
    getFileList: async ({ page, size, search, tag }) => {
        try {
            const skip = (page - 1) * size;
            // 构建查询条件
            const query = {};
            const conditions = [];
            
            // 添加搜索条件
            if (search) {
                conditions.push({ name: { $regex: search, $options: 'i' } }); // 模糊匹配名称，忽略大小写
            }
            
            // 添加标签筛选
            if (tag) {
                conditions.push({ tag: tag });
            }
            
            // 应用查询条件
            if (conditions.length > 0) {
                query.$and = conditions;
            }
            
            // 获取总数
            const total = await FileResourceModel.countDocuments(query);
            // 获取分页数据
            const fileList = await FileResourceModel.find(query,{
                _id:1,
                name:1,
                originalName:1,
                ext:1,
                mimeType:1,
                size:1,
                url:1,
                storage:1,
                category:1,
                description:1,
                tag:1,
                status:1,
                creator:1,
                createTime:1,
                editTime:1,
            }).sort({ createTime: -1 })
                .skip(skip)
                .limit(size)
                .lean();
            return {
                list: fileList,
                total,
            };
        } catch (error) {
            console.error('ERROR:database Type: FileService 获取资源列表失败:', error);
            throw error;
        }
    },
    deleteFile: async (fileId) => {
        try {
            //删除OSS文件
            const fileRecord = await FileResourceModel.findById(fileId);
            if (fileRecord && fileRecord.storage !== 'local' && fileRecord.path) {
                await deleteFile(fileRecord.path);
            }
            // 删除数据库记录
            const result = await FileResourceModel.deleteOne({ _id: fileId });
            return result;
        } catch (error) {
            console.error('ERROR:database Type: FileService 删除文件资源失败:', error);
            throw error;
        }
    },
    updateFile: async (fileId, updateData,isUpdatedFile) => {
        try {
            //如果是更新了文件，则需要删除旧文件
            if(isUpdatedFile){
                const fileRecord = await FileResourceModel.findById(fileId);
                if (fileRecord && fileRecord.storage !== 'local' && fileRecord.path) {
                    await deleteFile(fileRecord.path);
                }
            }
            const result = await FileResourceModel.updateOne(
                { _id: fileId },
                { $set: updateData }
            );
            return result;
        }
        catch (error) {
            console.error('ERROR:database Type: FileService 更新文件资源失败:', error);
            throw error;
        }
    },
    changeFileStatus: async (fileId) => {
        try {
            const fileRecord = await FileResourceModel.findById(fileId);
            if (!fileRecord) {
                throw new Error('文件资源未找到');
            }
            const newStatus = fileRecord.status === 1 ? 0 : 1;
            const result = await FileResourceModel.updateOne(
                { _id: fileId },
                { $set: { status: newStatus, editTime: new Date() } }
            );
            return result;
        } catch (error) {
            console.error('ERROR:database Type: FileService 更改文件资源状态失败:', error);
            throw error;
        }
    }
}
module.exports = FileService;
    