const multer = require("multer");
const path = require("path");
const WrongBookService = require("../../services/user/WrongBookService");
const { uploadBuffer, deleteFileByUrl } = require("../../helpers/ossHelper");
const {
  isCloudFileId,
  deleteCloudFiles,
} = require("../../helpers/cloudStorageHelper");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const DEFAULT_BIZ = "wrongbook";

const IMAGE_BIZ_CONFIG = {
  wrongbook: {
    folderPrefix: "user/wrong_question",
    saveRecord: async ({ uid, url }) => {
      const dbResult = await WrongBookService.uploadImage({ uid, url });
      if (!dbResult?.success) {
        throw new Error("图片上传成功但保存记录失败");
      }

      return {
        _id: dbResult?.data?._id,
        url: dbResult?.data?.url || url,
      };
    },
    removeRecord: async ({ uid, imageId, imageUrl }) => {
      return WrongBookService.removeImageById({
        uid,
        imageId,
        imageUrl,
      });
    },
  },
  notebook: {
    folderPrefix: "user/notebook",
  },
};

const resolveBiz = (req) => {
  const biz = String(req?.body?.biz || req?.query?.biz || DEFAULT_BIZ)
    .trim()
    .toLowerCase();

  if (IMAGE_BIZ_CONFIG[biz]) {
    return biz;
  }

  return DEFAULT_BIZ;
};

const buildImagePath = ({ uid, biz, extension = ".jpg" }) => {
  const config = IMAGE_BIZ_CONFIG[biz] || IMAGE_BIZ_CONFIG[DEFAULT_BIZ];
  const safeExt = String(extension || ".jpg").startsWith(".")
    ? String(extension || ".jpg")
    : `.${extension}`;
  const random = Math.random().toString(36).slice(2, 8);
  return `${config.folderPrefix}/${uid}/${Date.now()}_${random}${safeExt.toLowerCase()}`;
};

const buildUploadResponseData = async ({ biz, uid, url }) => {
  const config = IMAGE_BIZ_CONFIG[biz] || IMAGE_BIZ_CONFIG[DEFAULT_BIZ];

  if (typeof config.saveRecord === "function") {
    return config.saveRecord({ uid, url });
  }

  return { url };
};

const ImageController = {
  uploadImage: [
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(200).send({
            code: 400,
            message: "请选择要上传的图片",
          });
        }

        const { uid } = req.user;
        const biz = resolveBiz(req);
        const extension =
          path.extname(String(req.file.originalname || "")) || ".jpg";
        const filePath = buildImagePath({
          uid,
          biz,
          extension,
        });

        const fileUrl = await uploadBuffer(req.file.buffer, filePath);
        const data = await buildUploadResponseData({
          biz,
          uid,
          url: fileUrl,
        });

        res.status(200).send({
          code: 200,
          message: "上传成功",
          data,
        });
      } catch (error) {
        console.error("上传图片失败", error);
        res.status(500).send({
          code: 500,
          message: "上传图片失败",
        });
      }
    },
  ],

  uploadCloudImage: async (req, res) => {
    try {
      const { uid } = req.user;
      const { fileID, base64Data, fileExt } = req.body;
      const biz = resolveBiz(req);

      let fileUrl = "";

      if (base64Data) {
        const buffer = Buffer.from(base64Data, "base64");
        const extension = fileExt ? `.${fileExt}` : ".jpg";
        const filePath = buildImagePath({
          uid,
          biz,
          extension,
        });
        fileUrl = await uploadBuffer(buffer, filePath);
      } else if (fileID) {
        fileUrl = String(fileID);
      } else {
        return res.status(200).send({
          code: 400,
          message: "缺少文件信息",
        });
      }

      const data = await buildUploadResponseData({
        biz,
        uid,
        url: fileUrl,
      });

      res.status(200).send({
        code: 200,
        message: "上传成功",
        data,
      });
    } catch (error) {
      console.error("云托管上传图片失败", error);
      res.status(500).send({
        code: 500,
        message: "上传图片失败",
      });
    }
  },

  deleteImage: async (req, res) => {
    try {
      const { uid } = req.user;
      const imagePath = req.body.path;
      const imageId = req.body._id;
      const biz = resolveBiz(req);
      const config = IMAGE_BIZ_CONFIG[biz] || IMAGE_BIZ_CONFIG[DEFAULT_BIZ];

      if (isCloudFileId(imagePath)) {
        await deleteCloudFiles([imagePath]).catch((err) => {
          console.warn("服务端删除云存储文件失败:", imagePath, err.message);
        });
      } else if (imagePath) {
        await deleteFileByUrl(imagePath);
      }

      if (imageId && typeof config.removeRecord === "function") {
        const dbResult = await config.removeRecord({
          uid,
          imageId,
          imageUrl: imagePath,
        });

        return res.status(200).send({
          code: 200,
          message: "删除图片成功",
          data: {
            modifiedCount: dbResult?.modifiedCount || 0,
          },
        });
      }

      res.status(200).send({
        code: 200,
        message: "删除图片成功",
      });
    } catch (error) {
      console.error("删除图片失败", error);
      res.status(500).send({
        code: 500,
        message: "删除图片失败",
      });
    }
  },
};

module.exports = ImageController;
