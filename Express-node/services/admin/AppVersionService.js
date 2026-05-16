const AppVersionModel = require("../../models/AppVersionModel");
const { deleteFile } = require("../../helpers/ossHelper");

const AppVersionService = {
  // 分页获取版本列表（按 versionCode 降序）
  getList: async ({ page, size }) => {
    const skip = (page - 1) * size;
    const [data, total] = await Promise.all([
      AppVersionModel.find({}).sort({ versionCode: -1 }).skip(skip).limit(size),
      AppVersionModel.countDocuments({}),
    ]);
    return { data, total };
  },

  // 新增版本记录
  add: async (data) => {
    return AppVersionModel.create(data);
  },

  // 更新版本记录（若有新文件则删除旧 OSS 文件）
  update: async ({ _id, ...fields }) => {
    if (fields.downloadUrl) {
      const old = await AppVersionModel.findById(_id);
      if (old && old.downloadUrl && old.downloadUrl !== fields.downloadUrl) {
        await deleteFile(old.downloadUrl);
      }
    }
    return AppVersionModel.updateOne({ _id }, { ...fields, editTime: new Date() });
  },

  // 删除单条记录
  deleteOne: async ({ _id }) => {
    const record = await AppVersionModel.findById(_id);
    if (record && record.downloadUrl) {
      await deleteFile(record.downloadUrl);
    }
    return AppVersionModel.deleteOne({ _id });
  },

  // 批量删除
  deleteMany: async ({ _ids }) => {
    const records = await AppVersionModel.find({ _id: { $in: _ids } });
    for (const record of records) {
      if (record.downloadUrl) {
        await deleteFile(record.downloadUrl);
      }
    }
    return AppVersionModel.deleteMany({ _id: { $in: _ids } });
  },

  // 更新状态（启用/禁用）
  updateStatus: async ({ _id, status }) => {
    return AppVersionModel.updateOne({ _id }, { status, editTime: new Date() });
  },

  // 根据 ID 获取单条记录
  getById: async (id) => {
    return AppVersionModel.findById(id);
  },

  // 获取最新可用版本（用户端调用）
  getLatestVersion: async ({ platform, currentVersionCode }) => {
    return AppVersionModel.findOne({
      platform: { $in: [platform, "all"] },
      status: 1,
      versionCode: { $gt: currentVersionCode },
    }).sort({ versionCode: -1 });
  },
};

module.exports = AppVersionService;
