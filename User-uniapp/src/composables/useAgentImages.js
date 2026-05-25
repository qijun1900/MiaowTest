import { ref, computed } from "vue";
import { httpUpload, http } from "../util/http";
import escconfig from "../config/esc.config";

const DEFAULT_UPLOAD_URL = "/uniappAPI/upload/image";
const DEFAULT_CLOUD_UPLOAD_URL = "/uniappAPI/upload/cloudImage";

/**
 * 聊天图片管理 composable：选择即上传，按状态跟踪每张图片。
 *
 * @param {Object} options
 * @param {number}  options.maxCount       - 最大图片数量，默认 9
 * @param {number}  options.maxSize        - 单张最大字节数，默认 10MB
 * @param {string}  options.cloudPathPrefix - OSS 路径前缀
 * @param {Object}  options.uploadFormData  - 额外表单数据（如 biz）
 */
export function useAgentImages(options = {}) {
  const maxCount = options.maxCount || 9;
  const maxSize = options.maxSize || 10 * 1024 * 1024;
  const cloudPathPrefix = options.cloudPathPrefix || "user/agent_chat";
  const uploadFormData = options.uploadFormData || {};

  /**
   * 图片列表，每项结构：
   * { id, localPath, url, status: 'uploading'|'uploaded'|'failed', error? }
   */
  const images = ref([]);
  let idSeq = 0;

  // ─── 计算属性 ──────────────────────────────────────────────────────────────

  const isUploading = computed(() => images.value.some((img) => img.status === "uploading"));
  const hasFailed = computed(() => images.value.some((img) => img.status === "failed"));
  const canSend = computed(
    () => images.value.length > 0 && !isUploading.value && !hasFailed.value,
  );
  const uploadedUrls = computed(() =>
    images.value.filter((img) => img.status === "uploaded").map((img) => img.url),
  );

  // ─── 内部方法 ──────────────────────────────────────────────────────────────

  function createItem(localPath) {
    return {
      id: ++idSeq,
      localPath,
      url: "",
      status: "uploading",
      error: "",
    };
  }

  function checkFileSize(filePath) {
    return new Promise((resolve, reject) => {
      uni.getFileInfo({
        filePath,
        success: (info) => {
          if (info.size > maxSize) {
            const mb = (maxSize / (1024 * 1024)).toFixed(0);
            reject(new Error(`图片过大，限制${mb}MB`));
          } else {
            resolve(info.size);
          }
        },
        fail: () => resolve(0),
      });
    });
  }

  /**
   * 上传单张图片，直接调用上传接口，不依赖 useImageUpload。
   */
  async function doUpload(filePath) {
    // #ifdef MP-WEIXIN
    if (escconfig.useCloudContainer) {
      console.log("[AgentImages] 云托管上传:", filePath);
      const data = await httpUpload({
        filePath,
        url: DEFAULT_CLOUD_UPLOAD_URL,
        cloudPath: cloudPathPrefix + "/" + Date.now() + "_" + Math.random().toString(36).slice(2, 8) + ".jpg",
        formData: uploadFormData,
      });
      console.log("[AgentImages] 云托管响应:", JSON.stringify(data));
      if (data.code === 200 && data?.data?.url) {
        return data.data.url;
      }
      throw new Error(data.message || "云托管上传失败");
    }
    // #endif

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      console.log("[AgentImages] 开始上传:", filePath);

      uni.uploadFile({
        url: DEFAULT_UPLOAD_URL,
        filePath,
        name: "file",
        fileType: "image",
        formData: uploadFormData,
        success: (res) => {
          const elapsed = Date.now() - startTime;
          console.log(`[AgentImages] 上传响应 (${elapsed}ms):`, res.statusCode, res.data?.substring?.(0, 200));

          let data;
          try {
            data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          } catch (e) {
            console.error("[AgentImages] 响应解析失败:", e, "原始:", res.data);
            reject(new Error("服务器响应解析失败"));
            return;
          }

          if (data.code === 200 && data?.data?.url) {
            console.log("[AgentImages] 上传成功:", data.data.url);
            resolve(data.data.url);
          } else {
            console.error("[AgentImages] 上传失败:", data);
            reject(new Error(data.message || "上传失败"));
          }
        },
        fail: (err) => {
          const elapsed = Date.now() - startTime;
          console.error(`[AgentImages] 上传错误 (${elapsed}ms):`, err);
          reject(new Error(err?.errMsg || "网络请求失败"));
        },
      });
    });
  }

  async function uploadItem(index) {
    const item = images.value[index];
    if (!item) return;
    const tag = `[AgentImages #${item.id}]`;
    try {
      console.log(`${tag} 开始上传: ${item.localPath}`);
      const fileSize = await checkFileSize(item.localPath);
      console.log(`${tag} 文件大小: ${fileSize} bytes`);

      const url = await doUpload(item.localPath);
      // 通过响应式数组访问，确保触发视图更新
      images.value[index].url = url;
      images.value[index].status = "uploaded";
      images.value[index].error = "";
      console.log(`${tag} 上传完成: ${url}`);
    } catch (err) {
      images.value[index].status = "failed";
      images.value[index].error = err?.message || "上传失败";
      console.error(`${tag} 上传失败:`, err.message);
    }
  }

  // ─── 对外方法 ──────────────────────────────────────────────────────────────

  function addImages(remaining) {
    const count = remaining != null ? Math.min(remaining, maxCount) : maxCount;
    if (count <= 0) {
      uni.showToast({ title: `最多${maxCount}张图片`, icon: "none" });
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
          images.value.push(item);
          const idx = images.value.length - 1;
          console.log(`[AgentImages] 新增图片 #${item.id}, 当前总数: ${images.value.length}`);
          uploadItem(idx);
        }
      },
      fail: (err) => {
        console.error("[AgentImages] 选择图片失败:", err);
      },
    });
  }

  async function removeImage(index) {
    const item = images.value[index];
    if (!item) return;
    console.log(`[AgentImages] 删除图片 #${item.id}, status: ${item.status}`);
    images.value.splice(index, 1);
    if (item.status === "uploaded" && item.url) {
      http({
        url: "/uniappAPI/delete/image",
        method: "POST",
        data: { path: item.url },
      }).catch((err) => {
        console.warn("[AgentImages] 删除远程文件失败:", err.message);
      });
    }
  }

  function retryImage(index) {
    const item = images.value[index];
    if (!item || item.status !== "failed") return;
    console.log(`[AgentImages] 重试上传 #${item.id}`);
    images.value[index].status = "uploading";
    images.value[index].error = "";
    uploadItem(index);
  }

  function clearAll() {
    images.value = [];
  }

  function getUploadedUrls() {
    return images.value
      .filter((img) => img.status === "uploaded" && img.url)
      .map((img) => img.url);
  }

  return {
    images,
    isUploading,
    hasFailed,
    canSend,
    uploadedUrls,
    addImages,
    removeImage,
    retryImage,
    clearAll,
    getUploadedUrls,
  };
}
