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
    }

}
module.exports = FileController;