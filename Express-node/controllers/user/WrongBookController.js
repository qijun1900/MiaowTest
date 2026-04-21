const WrongBookService = require("../../services/user/WrongBookService");
const { deleteFileByUrl } = require("../../helpers/ossHelper");
const { deleteCloudFiles } = require("../../helpers/cloudStorageHelper");
const ActivityService = require("../../services/user/ActivityService");

const WrongBookController = {
  // 获取错题本列表
  getWrongBooks: async (req, res) => {
    try {
      const { uid } = req.user;
      const data = await WrongBookService.getWrongBooks({ uid });
      res.send({
        code: 200,
        data: data,
      });
    } catch (error) {
      console.error("获取错题本列表失败", error);
      res.status(500).send({
        code: 500,
        message: "获取错题本列表失败",
      });
    }
  },
  // 创建错题本
  createWrongBook: async (req, res) => {
    try {
      const { uid } = req.user;
      const { title, color } = req.body;
      const result = await WrongBookService.createWrongBook({
        uid,
        title,
        color,
      });
      if (!result.success) {
        return res.status(200).send({
          code: 400,
          message: "创建错题本失败",
        });
      }

      ActivityService.recordBusinessActivity(req, {
        eventName: "WRONGBOOK_CREATED",
        module: "wrongbook",
        bizId: String(result?.data?._id || ""),
        score: 2,
        metadata: {
          title,
          color,
        },
      }).catch((error) => {
        console.warn("记录 WRONGBOOK_CREATED 失败", error?.message || error);
      });

      res.status(200).send({
        code: 200,
        message: "创建错题本成功",
      });
    } catch (error) {
      console.error("创建错题本失败", error);
      res.status(200).send({
        code: 500,
        message: "创建错题本失败",
      });
    }
  },
  // 获取错题本详情 (Book)
  getWrongBookDetail: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.query;
      const data = await WrongBookService.getWrongBookDetail({ uid, id });
      if (!data) {
        return res.status(200).send({
          code: 404,
          message: "错题本不存在",
        });
      }
      res.status(200).send({
        code: 200,
        data,
      });
    } catch (error) {
      console.error("获取错题本详情失败", error);
      res.status(200).send({
        code: 500,
        message: "获取错题本详情失败",
      });
    }
  },

  // 更新错题本 (Book)
  updateWrongBook: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id, title, color } = req.body;
      const result = await WrongBookService.updateWrongBook({
        uid,
        id,
        title,
        color,
      });
      if (!result.success) {
        return res.status(200).send({
          code: 400,
          message: "更新错题本失败",
        });
      }
      res.status(200).send({
        code: 200,
        message: "更新错题本成功",
      });
    } catch (error) {
      console.error("更新错题本失败", error);
      res.status(200).send({
        code: 500,
        message: "更新错题本失败",
      });
    }
  },

  // 删除错题本 (Book)
  deleteWrongBook: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.body;
      const result = await WrongBookService.deleteWrongBook({ uid, id });

      // 统一返回 200 状态码，通过 code 字段区分成功/失败
      if (!result.success) {
        return res.status(200).send({
          code: 400,
          message: result.message || "删除错题本失败",
          data: {
            questionCount: result.questionCount,
          },
        });
      }

      res.status(200).send({
        code: 200,
        message: "删除错题本成功",
      });
    } catch (error) {
      console.error("删除错题本失败", error);
      res.status(200).send({
        code: 500,
        message: "删除错题本失败",
      });
    }
  },
  // 添加错题
  addWrongQuestion: async (req, res) => {
    try {
      const { uid } = req.user;
      const questionData = req.body;

      // 验证必填字段
      if (!questionData.wrongBookId) {
        return res.status(200).send({
          code: 400,
          message: "缺少错题本ID",
        });
      }

      if (!questionData.Type) {
        return res.status(200).send({
          code: 400,
          message: "缺少题目类型",
        });
      }

      // 调用 Service 层添加错题
      const result = await WrongBookService.addWrongQuestion({
        uid,
        questionData,
      });

      if (!result.success) {
        return res.status(200).send({
          code: 400,
          message: result.message || "添加错题失败",
        });
      }

      res.status(200).send({
        code: 200,
        message: "添加错题成功",
        data: result.data,
      });

      ActivityService.recordBusinessActivity(req, {
        eventName: "WRONG_QUESTION_ADDED",
        module: "wrongbook",
        bizId: String(result?.data?._id || questionData.wrongBookId || ""),
        score: 3,
        metadata: {
          wrongBookId: questionData.wrongBookId,
          questionType: questionData.Type,
          questionSource: questionData.questionSource || "user",
        },
      }).catch((error) => {
        console.warn("记录 WRONG_QUESTION_ADDED 失败", error?.message || error);
      });
    } catch (error) {
      console.error("添加错题失败", error);
      res.status(500).send({
        code: 500,
        message: "添加错题失败",
      });
    }
  },
  // 获取错题列表
  getWrongQuestions: async (req, res) => {
    try {
      const { uid } = req.user;
      const {
        wrongBookId,
        page = 1,
        pageSize = 20,
        keyword = "",
        tag = "",
        status,
      } = req.query;
      const data = await WrongBookService.getWrongQuestions({
        uid,
        wrongBookId,
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 20,
        keyword,
        tag,
        status,
      });
      res.send({
        code: 200,
        data,
      });
    } catch (error) {
      console.error("获取错题列表失败", error);
      res.status(500).send({
        code: 500,
        message: "获取错题列表失败",
      });
    }
  },

  // 删除错题
  deleteWrongQuestion: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.body;
      const result = await WrongBookService.deleteWrongQuestion({ uid, id });
      if (!result.success) {
        return res.status(200).send({
          code: 400,
          message: result.message || "删除错题失败",
        });
      }

      // 删除错题相关图片(如果有的话) images[{url:...,_id:...}...]
      // 区分云存储文件和 OSS 文件
      const cloudFiles = [];
      const ossFiles = [];

      result.data.images.forEach((img) => {
        const url = img.url || img;
        if (typeof url === "string") {
          if (url.startsWith("cloud://")) {
            cloudFiles.push(url);
          } else {
            ossFiles.push(url);
          }
        }
      });

      // 并行删除
      const deletePromises = [];

      // 删除 OSS 文件
      if (ossFiles.length > 0) {
        deletePromises.push(
          ...ossFiles.map((url) =>
            deleteFileByUrl(url).catch((err) => {
              console.warn("删除 OSS 文件失败:", url, err);
            }),
          ),
        );
      }

      // 服务端删除云存储文件（通过微信开放 API）
      if (cloudFiles.length > 0) {
        deletePromises.push(
          deleteCloudFiles(cloudFiles).catch((err) => {
            console.warn("服务端删除云存储文件失败:", err.message);
          }),
        );
      }

      await Promise.all(deletePromises);

      res.send({
        code: 200,
        message: "删除错题成功",
      });
    } catch (error) {
      console.error("删除错题失败", error);
      res.status(500).send({
        code: 500,
        message: "删除错题失败",
      });
    }
  },

  //将错题标记为已掌握
  markAsMastered: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.body;
      const result = await WrongBookService.markAsMastered({ uid, id });
      if (!result.success) {
        return res.status(200).send({
          code: 400,
          message: "标记为已掌握失败",
        });
      }
      res.status(200).send({
        code: 200,
        message: "标记为已掌握成功",
      });
    } catch (error) {
      console.error("标记为已掌握失败", error);
      res.status(500).send({
        code: 500,
        message: "标记为已掌握失败",
      });
    }
  },

  //将错题标记为需要复习
  markAsNeedReview: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.body;
      const result = await WrongBookService.markAsNeedReview({ uid, id });
      if (!result.success) {
        return res.status(200).send({
          code: 400,
          message: "标记为需要复习失败",
        });
      }
      res.status(200).send({
        code: 200,
        message: "标记为需要复习成功",
      });
    } catch (error) {
      console.error("标记为需要复习失败", error);
      res.status(500).send({
        code: 500,
        message: "标记为需要复习失败",
      });
    }
  },

  // 获取错题详情
  getWrongQuestionDetail: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const data = await WrongBookService.getWrongQuestionDetail({ uid, id });
      if (!data) {
        return res.status(200).send({
          code: 404,
          message: "错题不存在",
        });
      }
      res.status(200).send({
        code: 200,
        data,
      });
    } catch (error) {
      console.error("获取错题详情失败", error);
      res.status(500).send({
        code: 500,
        message: "获取错题详情失败",
      });
    }
  },

  // 更新错题
  updateWrongQuestion: async (req, res) => {
    try {
      const { uid } = req.user;
      const {
        id,
        wrongBookId,
        Type,
        questionSource,
        stem,
        options,
        correctAnswer,
        wrongAnswer,
        analysis,
        tags,
        difficulty,
      } = req.body;
      const result = await WrongBookService.updateWrongQuestion({
        uid,
        id,
        wrongBookId,
        Type,
        questionSource,
        stem,
        options,
        correctAnswer,
        wrongAnswer,
        analysis,
        tags,
        difficulty,
      });
      if (!result.success) {
        return res.status(200).send({
          code: 400,
          message: result.message || "更新错题失败",
        });
      }
      res.status(200).send({
        code: 200,
        message: "更新错题成功",
      });
    } catch (error) {
      console.error("更新错题失败", error);
      res.status(500).send({
        code: 500,
        message: "更新错题失败",
      });
    }
  },

  // 获取错题统计
  getWrongBookStatistics: async (req, res) => {
    try {
      const { uid } = req.user;
      const data = await WrongBookService.getWrongBookStatistics({ uid });
      res.send({
        code: 200,
        data,
      });
    } catch (error) {
      console.error("获取错题统计失败", error);
      res.status(500).send({
        code: 500,
        message: "获取错题统计失败",
      });
    }
  },

  // 获取用户所有已使用的标签
  getUserTags: async (req, res) => {
    try {
      const { uid } = req.user;
      const { wrongBookId } = req.query;
      if (!wrongBookId) {
        return res.status(200).send({
          code: 400,
          message: "wrongBookId不能为空",
        });
      }
      const tags = await WrongBookService.getUserTags({ uid, wrongBookId });
      res.send({
        code: 200,
        data: tags,
      });
    } catch (error) {
      console.error("获取用户标签失败", error);
      res.status(500).send({
        code: 500,
        message: "获取用户标签失败",
      });
    }
  },
};

module.exports = WrongBookController;
