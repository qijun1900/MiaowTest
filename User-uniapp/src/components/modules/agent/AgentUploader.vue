<template>
    <view class="agent-uploader-wrap">
        <!-- xe-upload：不渲染 UI，仅负责选择文件，App / 小程序 / H5 通吃 -->
        <xe-upload ref="xeRef" :options="uploadOptions" @callback="handleXeCallback" />

        <!-- TDesign 附件列表展示（无附件时不渲染，避免占位空白） -->
        <t-attachments
            v-if="attachmentItems.length > 0"
            :items="attachmentItems"
            :removable="mode === 'editable'"
            :image-viewer="true"
            @file-click="handleFileClick"
            @remove="handleRemove"
        />
    </view>
</template>

<script setup>
import { ref, computed } from "vue";
import XeUpload from "../../../uni_modules/xe-upload/components/xe-upload/xe-upload.vue";
import TAttachments from "@tdesign/uniapp-chat/attachments/attachments.vue";
import { cloudFileToHttpUrl } from "../../../util/cloudFileUrl";

const props = defineProps({
    mode: {
        type: String,
        default: "editable",
        validator: (v) => ["editable", "readonly"].includes(v),
    },
    images: {
        type: Array,
        default: () => [],
    },
    maxCount: {
        type: Number,
        default: 9,
    },
});

const emit = defineEmits([
    "remove",
    "retry",
    "preview",
    "files-chosen",
    "warning",
]);

const xeRef = ref(null);

// xe-upload 这里只让其做文件选择，不在组件内直接上传（实际上传由 useAgentAttachments 处理）。
const uploadOptions = computed(() => ({ name: "file" }));

const inferFileType = (img) => {
    if (img.fileType && img.fileType !== "file") return img.fileType;
    const name = String(img.name || img.url || img.localPath || "").toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)) return "image";
    if (/\.(mp4|mov|avi|m4v|webm)$/i.test(name)) return "video";
    if (/\.pdf$/i.test(name)) return "pdf";
    if (/\.(doc|docx)$/i.test(name)) return "doc";
    if (/\.(ppt|pptx)$/i.test(name)) return "ppt";
    if (/\.(txt|md|log)$/i.test(name)) return "txt";
    return "image";
};

const mapStatus = (s) => {
    if (s === "uploading") return "pending";
    if (s === "failed") return "fail";
    return "success";
};

const resolveSrc = (img) => {
    if (img.status === "uploaded" && img.url) {
        return cloudFileToHttpUrl(img.url);
    }
    if (img.localPath) return img.localPath;
    return cloudFileToHttpUrl(typeof img === "string" ? img : img?.url || "");
};

// 转换为 t-attachments 需要的结构
const attachmentItems = computed(() =>
    props.images.map((img, index) => {
        const fileType = inferFileType(img);
        return {
            fileType,
            name: img.name || `附件${index + 1}`,
            url: resolveSrc(img),
            size: img.size || 0,
            status: mapStatus(img.status),
            errorMessage: img.error || "",
            mode: "aspectFill",
        };
    })
);

const remainCount = computed(() => Math.max(0, props.maxCount - props.images.length));

const ensureCapacity = () => {
    if (remainCount.value <= 0) {
        uni.showToast({ title: `最多上传${props.maxCount}个`, icon: "none" });
        return false;
    }
    return true;
};

const pickImage = () => {
    if (!ensureCapacity()) return;
    xeRef.value?.upload("image", {
        count: remainCount.value,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
    });
};

const pickFile = () => {
    if (!ensureCapacity()) return;
    // 注意：extension 在三端语义不同
    // · H5  → uni.chooseFile 的 extension（不带点的扩展名数组）
    // · MP-WEIXIN → wx.chooseMessageFile 的 extension（不带点的扩展名数组）
    // · APP-PLUS → 拼成 <input accept="..."> 的 accept 字符串，
    //   plus webview 只认 MIME，不认 dot-extension（.pdf 之类会被忽略，fallback 到相机）
    //
    // App 端：只选文档（图片走 pickImage 单独入口）。
    // 单个 xxx/* MIME 在 plus webview 下能稳定生效，不会带出图库/视频/媒体工具入口。
    // #ifdef APP-PLUS
    xeRef.value?.upload("file", {
        count: remainCount.value,
        extension: "application/*",
    });
    return;
    // #endif

    // #ifdef H5 || MP-WEIXIN
    xeRef.value?.upload("file", {
        count: remainCount.value,
        // wx.chooseMessageFile：type 默认是 "all"，会在选择面板里展示
        // 「照片 / 视频 / 媒体选择工具」三个入口；这里限定为 file 仅显示文件入口
        type: "file",
        extension: ["pdf", "docx", "txt", "md"],
    });
    // #endif
};

const handleXeCallback = ({ type, data }) => {
    if (type === "choose" && Array.isArray(data) && data.length) {
        emit("files-chosen", data);
    } else if (type === "warning") {
        emit("warning", data);
    }
};

const handleRemove = (e) => {
    const index = e?.index ?? -1;
    if (index < 0) return;
    const img = props.images[index];
    if (img?.status === "failed") {
        emit("retry", index);
        return;
    }
    emit("remove", index);
};

const handleFileClick = (e) => {
    const item = e?.item;
    if (!item) return;
    if (item.fileType === "image" && item.url) {
        const urls = attachmentItems.value
            .filter((i) => i.fileType === "image" && i.url)
            .map((i) => i.url);
        uni.previewImage({ urls, current: item.url });
    }
    emit("preview", item);
};

defineExpose({ pickImage, pickFile });
</script>

<style scoped>
.agent-uploader-wrap {
    width: 100%;
    padding: 8rpx 0;
}
</style>
