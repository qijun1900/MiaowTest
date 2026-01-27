const FileService = require('../../services/admin/FileService');
const FileController = {
    uploadFile: async (req, res) => {
        try {
            const url = req.file ? req.file.ossUrl : "";
            const path = req.file? req.file.ossPath : "";
            const storage = req.file? req.file.storage : "";
            const {
                name,
                category,
                description,
                tag,
                ext,
                size,
                mimeType,
                creator,
            } = req.body;


            const result = await FileService.uploadFile({
                url, storage, name, category, description, 
                tag, ext, size, mimeType, creator, path,status: 1, createTime: Date.now(), editTime: Date.now()
            });
            if (!result) {
                return res.status(500).send({
                    code: 500,
                    ActionType: 'ERROR',
                });
            }
            res.send({
                code: 200,
                ActionType: 'OK',
            });
        }catch (error) {
            console.error('文件上传失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '文件上传失败'
            })
        }
    },
    getTags: async (req, res) => {
        try {
            const result = await FileService.getTags();
            if (!result) {
                return res.status(500).send({
                    code: 500,
                    ActionType: 'ERROR',
                });
            }
            res.send({
                code: 200,
                ActionType: 'OK',
                data: result,
            });
        }catch (error) {
            console.error('获取业务标签数组失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '获取业务标签数组失败'
            })
        }
        
    },
    getFileList: async (req, res) => {
        try {
            const {page,size} = req.query
            const result = await FileService.getFileList({
                page: Number(page), size: Number(size)}
            );
            if (!result) {
                return res.status(500).send({
                    code: 500,
                    ActionType: 'ERROR',
                });
            }
            res.send({
                code: 200,
                data: result,
            });
        }catch (error) {
            console.error('获取资源列表失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '获取资源列表失败'
            })
        }
        

    }

}
module.exports = FileController;