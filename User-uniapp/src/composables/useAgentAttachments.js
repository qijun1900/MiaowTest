import { ref, computed } from "vue";
import { httpUpload, http } from "../util/http";
import escconfig from "../config/esc.config";

const DEFAULT_UPLOAD_URL = "/uniappAPI/upload/image";
const DEFAULT_CLOUD_UPLOAD_URL = "/uniappAPI/upload/cloudImage";

/**
 * 聊天附件管理 composable：选择即上传，按状态跟踪每个附件（图片 / 文档 / 其他）。
 *
 * @param {Object} options
 * @param {number}  options.maxCount        - 最大附件数量，默认 9
 * @param {number}  options.maxSize         - 单个附件最大字节数，默认 10MB
 * @param {string}  options.cloudPathPrefix - OSS 路径前缀
 * @param {Object}  options.uploadFormData  - 额外表单数据（如 biz）
 */
export function useAgentAttachments(options = {}) {
  const maxCount = options.maxCount || 9;
  const maxSize = options.maxSize || 10 * 1024 * 1024;
  const cloudPathPrefix = options.cloudPathPrefix || "user/agent_chat";
  const uploadFormData = options.uploadFormData || {};

  /**
   * 附件列表，每项结构：
   * { id, localPath, url, status: 'uploading'|'uploaded'|'failed', error?, name, size, fileType, mimeType }
   */
  const attachments = ref([]);
  let idSeq = 0;

  // ─── 计算属性 ──────────────────────────────────────────────────────────────

  const isUploading = computed(() => attachments.value.some((a) => a.status === "uploading"));
  const hasFailed = computed(() => attachments.value.some((a) => a.status === "failed"));
  const canSend = computed(
    () => attachments.value.length > 0 && !isUploading.value && !hasFailed.value,
  );
  const uploadedUrls = computed(() =>
    attachments.value.filter((a) => a.status === "uploaded").map((a) => a.url),
  );

  // ─── 内部方法 ──────────────────────────────────────────────────────────────

  function getFileExtension(meta = {}) {
    const source = String(meta.name || meta.localPath || "").split("?")[0];
    const match = source.match(/\.([a-z0-9]+)$/i);
    return match ? `.${match[1].toLowerCase()}` : "";
  }

  function inferFileType(meta = {}) {
    if (meta.fileType && meta.fileType !== "file") return meta.fileType;
    if (String(meta.mimeType || "").startsWith("image/")) return "image";
    const ext = getFileExtension(meta);
    if (/^\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(ext)) return "image";
    return "file";
  }

  function createItem(localPath, meta = {}) {
    return {
      id: ++idSeq,
      localPath,
      url: "",
      status: "uploading",
      error: "",
      name: meta.name || "",
      size: meta.size || 0,
      fileType: inferFileType({ ...meta, localPath }),
      mimeType: meta.mimeType || "",
    };
  }

  function checkFileSize(filePath) {
    return new Promise((resolve, reject) => {
      uni.getFileInfo({
        filePath,
        success: (info) => {
          if (info.size > maxSize) {
            const mb = (maxSize / (1024 * 1024)).toFixed(0);
            reject(new Error(`附件过大，限制${mb}MB`));
          } else {
            resolve(info.size);
          }
        },
        fail: () => resolve(0),
      });
    });
  }

  /**
   * 上传单个附件，直接调用上传接口。
   */
  async function doUpload(filePath, item = {}) {
    const extension = getFileExtension({ name: item.name, localPath: filePath }) || ".jpg";
    // #ifdef MP-WEIXIN
    if (escconfig.useCloudContainer) {
      console.log("[AgentAttachments] 云托管上传:", filePath);
      const data = await httpUpload({
        filePath,
        url: DEFAULT_CLOUD_UPLOAD_URL,
        cloudPath: cloudPathPrefix + "/" + Date.now() + "_" + Math.random().toString(36).slice(2, 8) + extension,
        formData: uploadFormData,
      });
      console.log("[AgentAttachments] 云托管响应:", JSON.stringify(data));
      if (data.code === 200 && data?.data?.url) {
        return data.data.url;
      }
      throw new Error(data.message || "云托管上传失败");
    }
    // #endif

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      console.log("[AgentAttachments] 开始上传:", filePath);

      uni.uploadFile({
        url: DEFAULT_UPLOAD_URL,
        filePath,
        name: "file",
        ...(item.fileType === "image" ? { fileType: "image" } : {}),
        formData: uploadFormData,
        success: (res) => {
          const elapsed = Date.now() - startTime;
          console.log(`[AgentAttachments] 上传响应 (${elapsed}ms):`, res.statusCode, res.data?.substring?.(0, 200));

          let data;
          try {
            data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          } catch (e) {
            console.error("[AgentAttachments] 响应解析失败:", e, "原始:", res.data);
            reject(new Error("服务器响应解析失败"));
            return;
          }

          if (data.code === 200 && data?.data?.url) {
            console.log("[AgentAttachments] 上传成功:", data.data.url);
            resolve(data.data.url);
          } else {
            console.error("[AgentAttachments] 上传失败:", data);
            reject(new Error(data.message || "上传失败"));
          }
        },
        fail: (err) => {
          const elapsed = Date.now() - startTime;
          console.error(`[AgentAttachments] 上传错误 (${elapsed}ms):`, err);
          reject(new Error(err?.errMsg || "网络请求失败"));
        },
      });
    });
  }

  async function uploadItem(index) {
    const item = attachments.value[index];
    if (!item) return;
    const tag = `[AgentAttachments #${item.id}]`;
    try {
      console.log(`${tag} 开始上传: ${item.localPath}`);
      const fileSize = await checkFileSize(item.localPath);
      console.log(`${tag} 文件大小: ${fileSize} bytes`);

      const url = await doUpload(item.localPath, item);
      // 通过响应式数组访问，确保触发视图更新
      attachments.value[index].url = url;
      attachments.value[index].status = "uploaded";
      attachments.value[index].error = "";
      console.log(`${tag} 上传完成: ${url}`);
    } catch (err) {
      attachments.value[index].status = "failed";
      attachments.value[index].error = err?.message || "上传失败";
      console.error(`${tag} 上传失败:`, err.message);
    }
  }

  // ─── 对外方法 ──────────────────────────────────────────────────────────────

  /**
   * 弹起系统相册/相机选图，仅用于图片附件入口。
   * @param {number} [remaining] 还可添加的数量，默认为剩余可用配额
   */
  function pickImages(remaining) {
    const count = remaining != null ? Math.min(remaining, maxCount) : maxCount;
    if (count <= 0) {
      uni.showToast({ title: `最多${maxCount}个附件`, icon: "none" });
      return;
    }
    uni.chooseImage({
      count,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        for (const path of res.tempFilePaths) {
          try {
            await checkFileSize(path);
          } catch (err) {
            uni.showToast({ title: err.message, icon: "none" });
            continue;
          }
          const item = createItem(path);
          attachments.value.push(item);
          const idx = attachments.value.length - 1;
          console.log(`[AgentAttachments] 新增图片 #${item.id}, 当前总数: ${attachments.value.length}`);
          uploadItem(idx);
        }
      },
      fail: (err) => {
        console.error("[AgentAttachments] 选择图片失败:", err);
      },
    });
  }

  async function removeAttachment(index) {
    const item = attachments.value[index];
    if (!item) return;
    console.log(`[AgentAttachments] 删除附件 #${item.id}, status: ${item.status}`);
    attachments.value.splice(index, 1);
    if (item.status === "uploaded" && item.url) {
      http({
        url: "/uniappAPI/delete/image",
        method: "POST",
        data: { path: item.url },
      }).catch((err) => {
        console.warn("[AgentAttachments] 删除远程文件失败:", err.message);
      });
    }
  }

  function retryAttachment(index) {
    const item = attachments.value[index];
    if (!item || item.status !== "failed") return;
    console.log(`[AgentAttachments] 重试上传 #${item.id}`);
    attachments.value[index].status = "uploading";
    attachments.value[index].error = "";
    uploadItem(index);
  }

  /**
   * 直接从已经选好的本地文件列表创建上传任务（用于 xe-upload 等已完成选择的场景）。
   * @param {Array<{tempFilePath: string, name?: string, size?: number, type?: string, fileType?: string}>} files
   */
  async function addFromChosenFiles(files) {
    if (!Array.isArray(files) || !files.length) return;
    for (const f of files) {
      const filePath = f.tempFilePath;
      if (!filePath) continue;
      try {
        await checkFileSize(filePath);
      } catch (err) {
        uni.showToast({ title: err.message, icon: "none" });
        continue;
      }
      const item = createItem(filePath, {
        name: f.name,
        size: f.size,
        fileType: f.fileType || "file",
        mimeType: f.type,
      });
      attachments.value.push(item);
      const idx = attachments.value.length - 1;
      console.log(`[AgentAttachments] xe-upload 新增 #${item.id} (${item.fileType})`);
      uploadItem(idx);
    }
  }

  function clearAll() {
    attachments.value = [];
  }

  /** 获取所有已上传的 URL（含图片和文件） */
  function getUploadedAttachmentUrls() {
    return attachments.value
      .filter((a) => a.status === "uploaded" && a.url)
      .map((a) => a.url);
  }

  function isImageItem(a) {
    const ext = getFileExtension({ name: a.name, localPath: a.url || a.localPath });
    if (ext) return /^\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(ext);
    return a.fileType === "image" || String(a.mimeType || "").startsWith("image/");
  }

  /** 仅获取图片类型的已上传 URL（用于多模态视觉模型） */
  function getUploadedImages() {
    return attachments.value
      .filter((a) => a.status === "uploaded" && a.url && isImageItem(a))
      .map((a) => a.url);
  }

  /** 仅获取非图片附件（文档/PDF 等），返回 {url, name} 数组 */
  function getUploadedFiles() {
    return attachments.value
      .filter((a) => a.status === "uploaded" && a.url && !isImageItem(a))
      .map((a) => ({ url: a.url, name: a.name || "" }));
  }

  return {
    attachments,
    isUploading,
    hasFailed,
    canSend,
    uploadedUrls,
    pickImages,
    addFromChosenFiles,
    removeAttachment,
    retryAttachment,
    clearAll,
    getUploadedAttachmentUrls,
    getUploadedImages,
    getUploadedFiles,
  };
}
