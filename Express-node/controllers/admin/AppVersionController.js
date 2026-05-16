const AppVersionService = require("../../services/admin/AppVersionService");
const ossHelper = require("../../helpers/ossHelper");

const AppVersionController = {
  // ── Admin 接口 ──────────────────────────────────────────────────

  // 获取版本列表
  getVersionList: async (req, res) => {
    try {
      const { page, size } = req.query;
      const result = await AppVersionService.getList({
        page: Number(page) || 1,
        size: Number(size) || 20,
      });
      res.status(200).send({ ActionType: "OK", data: result, code: 200 });
    } catch (error) {
      console.error("获取版本列表失败:", error);
      res.status(500).send({ code: 500, ActionType: "ERROR", message: "获取版本列表失败" });
    }
  },

  // 新增版本
  addVersion: async (req, res) => {
    try {
      const { versionCode, versionName, platform, forceUpdate, changelog, downloadUrl: manualUrl } = req.body;
      // 优先使用 OSS 完整 URL，否则使用手动输入的 URL
      const downloadUrl = req.file ? (req.file.ossUrl || req.file.relativePath) : (manualUrl || "");
      const fileSize = req.file ? req.file.size : 0;

      await AppVersionService.add({
        versionCode: Number(versionCode),
        versionName,
        platform,
        forceUpdate: forceUpdate === "true" || forceUpdate === true,
        changelog,
        downloadUrl,
        fileSize,
      });
      res.status(200).send({ ActionType: "OK", code: 200 });
    } catch (error) {
      console.error("新增版本失败:", error);
      res.status(500).send({ code: 500, ActionType: "ERROR", message: "新增版本失败" });
    }
  },

  // 编辑版本
  editVersion: async (req, res) => {
    try {
      const { _id, versionCode, versionName, platform, forceUpdate, changelog, downloadUrl: manualUrl } = req.body;
      const downloadUrl = req.file ? (req.file.ossUrl || req.file.relativePath) : manualUrl;
      const fileSize = req.file ? req.file.size : undefined;

      const updateData = {
        versionCode: Number(versionCode),
        versionName,
        platform,
        forceUpdate: forceUpdate === "true" || forceUpdate === true,
        changelog,
      };
      if (downloadUrl) updateData.downloadUrl = downloadUrl;
      if (fileSize) updateData.fileSize = fileSize;

      await AppVersionService.update({ _id, ...updateData });
      res.status(200).send({ ActionType: "OK", code: 200 });
    } catch (error) {
      console.error("编辑版本失败:", error);
      res.status(500).send({ code: 500, ActionType: "ERROR", message: "编辑版本失败" });
    }
  },

  // 删除单个版本
  deleteVersion: async (req, res) => {
    try {
      const { _id } = req.body;
      await AppVersionService.deleteOne({ _id });
      res.status(200).send({ ActionType: "OK", code: 200 });
    } catch (error) {
      console.error("删除版本失败:", error);
      res.status(500).send({ code: 500, ActionType: "ERROR", message: "删除版本失败" });
    }
  },

  // 批量删除版本
  deleteManyVersions: async (req, res) => {
    try {
      const { _ids } = req.body;
      await AppVersionService.deleteMany({ _ids });
      res.status(200).send({ ActionType: "OK", code: 200 });
    } catch (error) {
      console.error("批量删除版本失败:", error);
      res.status(500).send({ code: 500, ActionType: "ERROR", message: "批量删除版本失败" });
    }
  },

  // 更新版本状态
  updateStatus: async (req, res) => {
    try {
      const { _id, status } = req.body;
      await AppVersionService.updateStatus({ _id, status: Number(status) });
      res.status(200).send({ ActionType: "OK", code: 200 });
    } catch (error) {
      console.error("更新版本状态失败:", error);
      res.status(500).send({ code: 500, ActionType: "ERROR", message: "更新版本状态失败" });
    }
  },

  // ── 用户端接口 ──────────────────────────────────────────────────

  // 检查更新（无需登录）
  checkUpdate: async (req, res) => {
    try {
      const { platform, currentVersionCode } = req.query;
      const latest = await AppVersionService.getLatestVersion({
        platform,
        currentVersionCode: Number(currentVersionCode),
      });

      if (latest) {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          data: { hasUpdate: true, latestVersion: latest },
        });
      } else {
        res.status(200).send({
          code: 200,
          ActionType: "OK",
          data: { hasUpdate: false },
        });
      }
    } catch (error) {
      console.error("检查更新失败:", error);
      res.status(500).send({ code: 500, ActionType: "ERROR", message: "检查更新失败" });
    }
  },

  // 代理下载安装包（绕过 OSS 的 APK 分发限制）
  downloadVersion: async (req, res) => {
    try {
      const { id } = req.query;
      const record = await AppVersionService.getById(id);
      if (!record || !record.downloadUrl) {
        return res.status(404).send({ code: 404, message: "文件不存在" });
      }

      // 从完整 URL 中提取 OSS 路径
      const url = new URL(record.downloadUrl);
      const ossPath = url.pathname.substring(1); // 去掉开头的 /

      // 从 OSS 获取文件并转发给客户端
      const result = await ossHelper.getFile(ossPath);
      const filename = `v${record.versionName}.apk`;

      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      res.setHeader("Content-Length", result.content.length);
      res.send(result.content);
    } catch (error) {
      console.error("下载安装包失败:", error);
      res.status(500).send({ code: 500, message: "下载失败" });
    }
  },
};

module.exports = AppVersionController;
