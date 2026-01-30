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
                tag, ext, size, mimeType, creator, path,status: 1, 
                createTime: Date.now(), editTime: Date.now()
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
            const {page,size,search,tag} = req.query
            console.log("Received getFileList request with params:", req.query);
            const result = await FileService.getFileList({
                page: Number(page), 
                size: Number(size), 
                search: search || "",
                tag: tag || ""
            });
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
    },
    deleteFile: async (req,res)=>{
        try {
            const {fileId} = req.body;
            const result = await FileService.deleteFile(fileId);
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
            console.error('删除文件资源失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '删除文件资源失败'
            })
        }
    },
    updateFile:async (req,res)=>{
        try{
            if(req.file){
                // 如果上传了新文件，更新 URL 和路径
                req.body.url = req.file.ossUrl;
                req.body.path = req.file.ossPath;
                req.body.storage = req.file.storage;
                req.body.isUpdatedFile = true;
            }
            const { 
                _id, 
                name, 
                category, 
                tag, 
                ext,
                description, 
                url, 
                mimeType,
                size,
                path, 
                storage ,
                isUpdatedFile
            } = req.body;

            let fileData = {
                name,   
                category,
                tag,
                ext,
                description,
                url, 
                path, 
                mimeType,
                size,
                storage ,
                originalName: name,
                editTime : new Date()
            };
            const result = await FileService.updateFile(_id, fileData, isUpdatedFile);
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
        }catch(error){
            console.error('更新文件资源失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '更新文件资源失败'
            })
        }
    },
    changeFileStatus: async (req, res) => {
        try {
            const { fileId } = req.body;
            const fileRecord = await FileService.changeFileStatus(fileId);
            if (!fileRecord) {
                return res.status(500).send({
                    code: 500,
                    ActionType: 'ERROR',
                });
            }
            res.send({
                code: 200,
            });
        } catch (error) {
            console.error('更新文件资源失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '更新文件资源失败'
            })
        }
    }
}
module.exports = FileController;