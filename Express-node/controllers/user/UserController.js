const UserService = require("../../services/user/UserService");
const {
  sendVerifyCode: sendVerifyCodeEmail,
} = require("../../helpers/emailHelper");
const multer = require("multer");
const path = require("path");
const ConsumerModel = require("../../models/ConsumerModel");
const ossConfig = require("../../config/oss.config");
const { uploadBuffer, deleteFileByUrl } = require("../../helpers/ossHelper");
const {
  isCloudFileId,
  deleteCloudFiles,
} = require("../../helpers/cloudStorageHelper");
const ActivityService = require("../../services/user/ActivityService");

// 使用内存存储，方便后续上传到OSS
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 限制10MB
});

function isOssUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("cloud://")) return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;

  if (ossConfig.cdnDomain && url.includes(ossConfig.cdnDomain)) {
    return true;
  }

  return !!(
    ossConfig.bucket &&
    ossConfig.region &&
    url.includes(`${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com`)
  );
}

const UserController = {
  Userlogin: async (req, res) => {
    try {
      const { message, code } = req.body;
      console.log("接收到的 message:", message, "code:", code);
      const result = await UserService.Userlogin(message, code);
      res.status(200).send({
        code: 200,
        ActionType: "OK",
        data: result.data,
      });
    } catch (error) {
      console.error("Userlogin 失败", error);
      throw error;
    }
  },
  // 发送邮箱验证码
  sendVerifyCode: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(200).send({
          code: 400,
          ActionType: "ERROR",
          message: "请输入有效的邮箱地址",
        });
      }
      const result = await sendVerifyCodeEmail(email);
      res.status(200).send({
        code: result.success ? 200 : 429,
        ActionType: result.success ? "OK" : "ERROR",
        message: result.message,
      });
    } catch (error) {
      console.error("sendVerifyCode 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误，请稍后重试",
      });
    }
  },
  UserRegister: async (req, res) => {
    try {
      const { account, verifyCode, password, uid } = req.body;
      const result = await UserService.UserRegister(
        account,
        verifyCode,
        password,
        uid || null,
      );
      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          message: result.message,
          data: result.data,
        });
      } else {
        res.status(200).send({
          code: result.code || 400,
          ActionType: "ERROR",
          message: result.message,
        });
      }
    } catch (error) {
      console.error("UserRegister 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "注册失败，请稍后重试",
      });
    }
  },
  // 用户账号登录
  UserAccountLogin: async (req, res) => {
    try {
      const { account, password } = req.body;
      const result = await UserService.UserAccountLogin(account, password);
      res.status(200).send({
        code: result.code,
        success: result.success,
        message: result.message,
        data: result.data || {},
      });
    } catch (error) {
      console.error("UserAccountLogin 失败", error);
      throw error;
    }
  },
  // 更新用户信息
  updateUserInfo: async (req, res) => {
    try {
      const { nickname, avatar, gender } = req.body;
      const { uid } = req.user; //获取用户openid
      const result = await UserService.updateUserInfo({
        uid,
        nickname,
        avatar,
        gender,
      });

      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          message: result.message,
          data: result.data,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
          message: result.message,
        });
      }
    } catch (error) {
      console.error("updateUserInfo 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  // 处理头像上传
  uploadUserAvatar: [
    upload.single("file"), // 使用multer中间件处理文件上传
    async (req, res) => {
      try {
        // 检查是否有文件上传
        if (!req.file) {
          return res.status(200).send({
            code: 400,
            ActionType: "ERROR",
            message: "请选择要上传的图片",
          });
        }

        // 获取用户信息
        const { uid } = req.user;
        if (!uid) {
          return res.status(200).send({
            code: 401,
            ActionType: "ERROR",
            message: "用户未登录",
          });
        }

        const currentUser = await ConsumerModel.findById(uid).select("avatar");
        const oldAvatar = currentUser?.avatar || "";

        // 生成唯一的文件名
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `user/avatar/${uid}/${Date.now()}${fileExtension}`;

        // 使用 ossHelper 的 Buffer 上传
        const avatarUrl = await uploadBuffer(req.file.buffer, fileName);

        const databaseResult = await UserService.updateUserAvatar({
          uid,
          avatarUrl: avatarUrl,
        });
        if (databaseResult.success) {
          // 删除旧头像（支持 OSS 和云存储）
          if (oldAvatar && oldAvatar !== avatarUrl) {
            if (isOssUrl(oldAvatar)) {
              deleteFileByUrl(oldAvatar).catch((err) => {
                console.warn("删除旧OSS头像失败:", err.message || err);
              });
            } else if (isCloudFileId(oldAvatar)) {
              deleteCloudFiles([oldAvatar]).catch((err) => {
                console.warn("删除旧云存储头像失败:", err.message || err);
              });
            }
          }
          // 返回成功响应
          res.status(200).send({
            code: databaseResult.code,
            message: databaseResult.message,
            data: { avatar: avatarUrl },
          });
        } else {
          res.status(200).send({
            code: databaseResult.code,
            message: databaseResult.message,
          });
        }
      } catch (e) {
        console.error("uploadUserAvatar失败", e);
        res.status(200).send({
          code: 500,
          ActionType: "ERROR",
          message: "服务器错误",
        });
      }
    },
  ],
  // 云托管模式上传头像（支持两种方式：云对象存储fileID / base64中转OSS）
  uploadCloudAvatar: async (req, res) => {
    try {
      const { uid } = req.user;
      const { fileID, base64Data, fileExt } = req.body;

      const currentUser = await ConsumerModel.findById(uid).select("avatar");
      const oldAvatar = currentUser?.avatar || "";

      let avatarUrl;

      if (base64Data) {
        // 方式2：base64 中转 OSS
        const buffer = Buffer.from(base64Data, "base64");
        const ext = fileExt || "jpg";
        const fileName = `user/avatar/${uid}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        avatarUrl = await uploadBuffer(buffer, fileName);
      } else if (fileID) {
        // 方式1：云对象存储，直接使用 fileID
        avatarUrl = fileID;
      } else {
        return res.status(200).send({
          code: 400,
          ActionType: "ERROR",
          message: "缺少文件信息",
        });
      }

      const databaseResult = await UserService.updateUserAvatar({
        uid,
        avatarUrl: avatarUrl,
      });

      if (databaseResult.success) {
        // 删除旧头像（支持 OSS 和云存储）
        if (oldAvatar && oldAvatar !== avatarUrl) {
          if (isOssUrl(oldAvatar)) {
            deleteFileByUrl(oldAvatar).catch((err) => {
              console.warn("删除旧OSS头像失败:", err.message || err);
            });
          } else if (isCloudFileId(oldAvatar)) {
            deleteCloudFiles([oldAvatar]).catch((err) => {
              console.warn("删除旧云存储头像失败:", err.message || err);
            });
          }
        }
        res.status(200).send({
          code: databaseResult.code,
          message: databaseResult.message,
          data: { avatar: avatarUrl },
        });
      } else {
        res.status(200).send({
          code: databaseResult.code,
          message: databaseResult.message,
        });
      }
    } catch (e) {
      console.error("云托管上传头像失败", e);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  //收藏考试
  addExamFavorite: async (req, res) => {
    try {
      const { examId } = req.body;
      const { uid } = req.user; //获取用户openid
      const result = await UserService.addExamFavorite(examId, uid);
      if (result.success) {
        ActivityService.recordBusinessActivity(req, {
          eventName: "EXAM_FAVORITE_ADDED",
          module: "favorite",
          bizId: String(examId || ""),
          score: 1,
          metadata: {
            examId,
            source: "my_favorite",
          },
        }).catch((error) => {
          console.warn(
            "记录 EXAM_FAVORITE_ADDED 失败",
            error?.message || error,
          );
        });

        res.status(200).send({
          code: 200,
          ActionType: "OK",
          message: result.message,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
          message: result.message,
        });
      }
    } catch (error) {
      console.error("addExamFavorite 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  //检测是否收藏
  getExamFavorites: async (req, res) => {
    try {
      const { examId } = req.body;
      const { uid } = req.user;

      const result = await UserService.getExamFavorites(examId, uid);
      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          data: result.data,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
        });
      }
    } catch (error) {
      console.error("getExamFavorites 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  //取消收藏
  removeExamFavorite: async (req, res) => {
    try {
      const { examId } = req.body;
      const { uid } = req.user;
      const result = await UserService.removeExamFavorite(examId, uid);
      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          message: result.message,
        });
      }
    } catch (error) {
      console.error("removeExamFavorite 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  getUserFavoritesExam: async (req, res) => {
    try {
      const { uid } = req.user;
      const result = await UserService.getUserFavoritesExam(uid); // 调用服务层方法获取用户收藏的考试
      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          data: result.data,
        });
      }
    } catch (error) {
      console.error("getUserFavoritesExam 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  BindAccount: async (req, res) => {
    try {
      const { account, password, verifyCode } = req.body;
      const { uid } = req.user;
      const result = await UserService.BindAccount({
        uid,
        account,
        password,
        verifyCode,
      });
      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          message: result.message,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
          message: result.message,
        });
      }
    } catch (error) {
      console.error("BindAccount 失败", error);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  checkUserBind: async (req, res) => {
    try {
      const { uid } = req.user;
      const result = await UserService.checkUserBind(uid);
      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          data: result.data,
        });
      }
    } catch (error) {
      console.error("checkUserBind 失败", error);
    }
  },
  userFeedback: async (req, res) => {
    try {
      const { type, content, contactInfo, relatedId } = req.body; // 从请求体中获取反馈信息

      // 获取用户uid，如果用户未登录则设为null
      const uid = req.user && req.user.uid ? req.user.uid : null;

      const result = await UserService.userFeedback({
        uid,
        type,
        content,
        contactInfo,
        relatedId,
      }); // 调用服务层方法处理反馈
      if (result.success) {
        if (uid && String(content || "").trim()) {
          ActivityService.recordBusinessActivity(req, {
            eventName: "FEEDBACK_SUBMITTED",
            module: "feedback",
            bizId: String(relatedId || ""),
            score: 1,
            metadata: {
              type,
              relatedId,
            },
          }).catch((error) => {
            console.warn(
              "记录 FEEDBACK_SUBMITTED 失败",
              error?.message || error,
            );
          });
        }

        res.status(200).send({
          code: 200,
          ActionType: "OK",
          message: result.message, // 返回成功消息
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
          message: "反馈失败",
        });
      }
    } catch (e) {
      console.error("userFeedback 失败", e);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  savePracticeNote: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid
      if (!uid) {
        return res.status(200).send({
          code: 401,
          message: "您未登录",
        }); // 如果用户未登录，返回错误信息
      }
      const { questionId, questionType, examId, content } = req.body; // 从请求体中获取笔记信息
      const result = await UserService.savePracticeNote({
        uid,
        questionId,
        questionType,
        examId,
        content,
      });

      if (result.success) {
        if (typeof content === "string" && content.trim()) {
          ActivityService.recordBusinessActivity(req, {
            eventName: "NOTE_SAVED",
            module: "note",
            bizId: String(questionId || ""),
            score: 2,
            metadata: {
              source: "exam_practice",
              questionType,
              examId,
            },
          }).catch((error) => {
            console.warn("记录 NOTE_SAVED 失败", error?.message || error);
          });
        }

        res.status(200).send({
          code: 200,
          ActionType: "OK",
          message: result.message,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
          message: result.message,
        });
      }
    } catch (e) {
      console.error("savePracticeNote 失败", e);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  getPracticeNote: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid
      if (!uid) {
        return res.status(200).send({
          code: 401,
          ActionType: "ERROR",
          message: "您未登录",
        });
      }
      const { questionId } = req.body; // 通过questionId获取笔记信息

      // 验证questionId是否存在
      if (!questionId) {
        return res.status(200).send({
          code: 400,
          ActionType: "ERROR",
          message: "缺少题目ID",
        });
      }

      const result = await UserService.getPracticeNote({ uid, questionId });

      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          data: result.data,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
          message: result.message,
        });
      }
    } catch (e) {
      console.error("getPracticeNote 失败", e);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  getNoteExamList: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid
      if (!uid) {
        return res.status(200).send({
          code: 401,
          ActionType: "ERROR",
          message: "您未登录",
        });
      }
      const result = await UserService.getNoteExamList({ uid }); // 调用服务层方法获取用户笔记的考试列表

      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          data: result.data,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
          message: result.message,
        });
      }
    } catch (e) {
      console.error("getNoteExamList 失败", e);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  getNoteListByExamId: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid
      if (!uid) {
        return res.status(200).send({
          code: 401,
          ActionType: "ERROR",
          message: "您未登录",
        });
      }
      const { examId } = req.body; // 从请求体中获取考试ID
      if (!examId) {
        return res.status(200).send({
          code: 400,
          ActionType: "ERROR",
          message: "缺少考试ID",
        });
      }
      const result = await UserService.getNoteListByExamId({ uid, examId }); // 调用服务层方法获取指定考试ID的笔记列表

      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          data: result.data,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
        });
      }
    } catch (e) {
      console.error("getNoteListByExamId 失败", e);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  saveUserBankPracticeNote: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid
      if (!uid) {
        return res.status(200).send({
          code: 401,
          ActionType: "ERROR",
          message: "您未登录",
        });
      }
      const { questionId, questionType, examId, content } = req.body; // 从请求体中获取笔记信息
      const result = await UserService.saveUserBankPracticeNote({
        uid,
        questionId,
        questionType,
        examId,
        content,
      }); // 调用服务层方法保存用户笔记

      if (result.success) {
        if (typeof content === "string" && content.trim()) {
          ActivityService.recordBusinessActivity(req, {
            eventName: "NOTE_SAVED",
            module: "note",
            bizId: String(questionId || ""),
            score: 2,
            metadata: {
              source: "user_bank",
              questionType,
              examId,
            },
          }).catch((error) => {
            console.warn(
              "记录 NOTE_SAVED(user_bank) 失败",
              error?.message || error,
            );
          });
        }

        res.status(200).send({
          code: 200,
          ActionType: "OK",
          message: result.message,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
          message: result.message,
        });
      }
    } catch (e) {
      console.error("saveUserBankPracticeNote 失败", e);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  getUserBankPracticeNote: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid
      if (!uid) {
        return res.status(200).send({
          code: 401,
          ActionType: "ERROR",
          message: "您未登录",
        });
      }
      const { questionId } = req.body; // 从请求体中获取笔记信息
      const result = await UserService.getUserBankPracticeNote({
        uid,
        questionId,
      }); // 调用服务层方法获取用户笔记
      if (result.success) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          data: result.data,
        });
      } else {
        res.status(200).send({
          code: result.code,
          ActionType: "ERROR",
          message: result.message,
        });
      }
    } catch (e) {
      console.error("getUserBankPracticeNote 失败", e);
    }
  },
  useLLMChat: async (req, res) => {
    try {
      const { message, model } = req.body;
      console.log(message, model);
      const result = await UserService.useLLMChat({ message, model });
      res.status(200).send({
        code: 200,
        ActionType: "OK",
        data: result,
      });
    } catch (e) {
      console.error("useLLMChat 失败", e);
    }
  },
  setTodayTodos: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid，前端阻拦了未登录的情况
      const { fulldate, todos_content } = req.body; // 从请求体中获取待办事项信息
      const result = await UserService.setTodayTodos({
        uid,
        fulldate,
        todos_content,
      });
      if (result.success) {
        const todoText =
          typeof todos_content === "string"
            ? todos_content
            : todos_content?.content || "";
        if (String(todoText).trim()) {
          ActivityService.recordBusinessActivity(req, {
            eventName: "TODO_CREATED",
            module: "todo",
            bizId: String(fulldate || ""),
            score: 1,
            metadata: {
              fulldate,
            },
          }).catch((error) => {
            console.warn("记录 TODO_CREATED 失败", error?.message || error);
          });
        }

        res.status(200).send({
          code: 200,
          message: result.message,
        });
      } else {
        res.status(200).send({
          code: result.code,
          message: result.message,
        });
      }
    } catch (e) {
      console.error("setTodayTodos 失败", e);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  getDotDates: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid，前端阻拦了未登录的情况
      const result = await UserService.getDotDates({ uid });
      if (result.success) {
        res.status(200).send({
          code: 200,
          data: result.data,
        });
      } else {
        res.status(200).send({
          code: result.code,
          message: result.message,
        });
      }
    } catch (e) {
      console.error("getDotDates 失败", e);
      res.status(200).send({
        code: 500,
        ActionType: "ERROR",
        message: "服务器错误",
      });
    }
  },
  getTodayTodos: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid，前端阻拦了未登录的情况
      const { fulldate } = req.body; // 从请求体中获取日期信息
      const result = await UserService.getTodayTodos({ uid, fulldate });
      if (result.success) {
        res.status(200).send({
          code: 200,
          data: result.data,
        });
      }
    } catch (e) {
      console.error("getTodayTodos 失败", e);
    }
  },
  toggleTodoStatus: async (req, res) => {
    try {
      const { uid } = req.user;
      const { fulldate, todoId } = req.body; // 从请求体中获取日期和待办事项ID信息
      const result = await UserService.toggleTodoStatus({
        uid,
        fulldate,
        todoId,
      });
      if (result.success) {
        res.status(200).send({
          code: 200,
          message: result.message,
        });
      } else {
        res.status(200).send({
          code: result.code,
          message: result.message,
        });
      }
    } catch (e) {
      console.error("toggleTodoStatus 失败", e);
    }
  },
  deleteTodo: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid，前端阻拦了未登录的情况
      const { fulldate, todoId } = req.body; // 从请求体中获取日期和待办事项ID信息
      const result = await UserService.deleteTodo({ uid, fulldate, todoId });
      if (result.success) {
        res.status(200).send({
          code: 200,
          message: result.message,
        });
      } else {
        res.status(200).send({
          code: result.code,
          message: result.message,
        });
      }
    } catch {
      console.error("deleteTodo 失败", e);
    }
  },
  editTodo: async (req, res) => {
    try {
      const { uid } = req.user; // 获取用户uid，前端阻拦了未登录的情况
      const { fulldate, todoId, todoForm } = req.body; // 从请求体中获取日期和待办事项ID信息
      const result = await UserService.editTodo({
        uid,
        fulldate,
        todoId,
        todoForm,
      });
      if (result.success) {
        res.status(200).send({
          code: 200,
          message: result.message,
        });
      } else {
        res.status(200).send({
          code: result.code,
          message: result.message,
        });
      }
    } catch (e) {
      console.error("editTodo 失败", e);
    }
  },
};

module.exports = UserController;
