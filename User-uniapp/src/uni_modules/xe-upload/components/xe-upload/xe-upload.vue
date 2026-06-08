<!-- eslint-disable -->
<template>
  <view>
    <!-- #ifdef APP-PLUS -->
    <view class="xe-upload" v-html="renderInput" :props="mergeProps" :change:props="XeUpload.renderProps"></view>
    <!-- #endif -->
  </view>
</template>

<script>
import {
  chooseMedia,
  chooseFile,
  chooseMessageFile,
  uploadFile,
} from '../../tools/apis';
import {
  deepMerge,
  awaitWrap,
  base64ToPath,
  isArray,
} from '../../tools/tools';

export default {
  name: 'XeUpload',
  props: {
    options: {
      default: () => ({}),
      type: Object,
    },
  },
  data() {
    return {
      id: 0, // APP上传框ID
      renderInput: '', // APP上传框
    };
  },
  computed: {
    mergeOptions({ options = {} }) {
      const tmpOptions = {
        name: 'file',
      };
      return deepMerge(tmpOptions, options);
    },
    mergeProps({ id, renderInput, mergeOptions }) {
      return {
        id,
        renderInput,
        upload: mergeOptions,
      };
    },
  },
  methods: {
    // 上传事件
    async upload(type, config = {}) {
      let tmpResult = [];
      if (['image', 'video'].includes(type)) {
        const [err, res] = await chooseMedia(type, config);
        if (err) return this.handleError(err);
        tmpResult = res?.tempFiles || [];
      }
      // H5 || APP-PLUS || MP-WEIXIN
      if (['file'].includes(type)) {
        let tmpFiles = {};
        let tmpErr = null;
        // #ifdef H5
        [tmpErr, tmpFiles] = await chooseFile(config);
        // #endif
        // #ifdef MP-WEIXIN
        [tmpErr, tmpFiles] = await chooseMessageFile(config);
        // #endif
        // #ifdef APP-PLUS
        this.id = Math.floor(Math.random() * 100000000 + 1);
        this.initInput(config.extension);
        // #endif
        if (tmpErr) return this.handleError(tmpErr);
        tmpResult = tmpFiles?.tempFiles || [];
      }
      this.handleUpload(tmpResult);
    },
    // 初始化上传框
    initInput(extension) {
      const { id } = this;
      let accept = extension;
      if (isArray(extension)) {
        accept = extension.join(',');
      }
      this.renderInput = `<input type="file" id="xe-upload-${id}" name="xe-upload" ${accept ? 'accept="' + accept + '"' : ''} />`;
    },
    // 文件上传（没有传入上传url时返回本地链接）
    async handleUpload(files = []) {
      if (files.filter((e) => Boolean(e)).length === 0) return;
      const { mergeOptions } = this;
      if (!mergeOptions.url) {
        return this.handleEmits({
          type: 'choose',
          data: files,
        });
      }
      const tmpUploads = files.map((e) =>
        uploadFile(
          {
            ...mergeOptions,
            filePath: e.tempFilePath,
          },
          e,
        )
      );
      const [err, res] = await awaitWrap(Promise.all(tmpUploads));
      if (err) return this.handleError(err);
      this.handleEmits({
        type: 'success',
        data: res,
      });
    },
    // 处理失败事件
    handleError(error) {
      this.handleEmits({
        type: 'warning',
        data: error,
      });
    },
    // 处理响应事件
    async handleEmits(e) {
      // #ifdef APP-PLUS
      if (e.type === 'choose') {
        // 将base64转为本地链接
        for (let i = 0; i < e.data.length; i += 1) {
          const item = e.data[i];
          if (!item.base64Url) {
            continue;
          }
          const [parseError, parseUrl] = await awaitWrap(base64ToPath(item.base64Url, item.name));
          if (!parseError) {
            e.data[i].tempFilePath = parseUrl;
          } else {
            e.data[i].tempFilePath = item.base64Url;
          }
          delete e.data[i].base64Url;
        }
      }
      // #endif
      this.$emit('callback', e);
    },
  },
};
</script>

<!-- #ifdef APP-PLUS -->
<script module="XeUpload" lang="renderjs">
import {
  appUploadFile,
} from '../../tools/apis';
import {
  awaitWrap,
  fileToBase64,
} from '../../tools/tools';

export default {
  data() {
    return {
      id: 0, // 上传框ID
      uploadOptions: {}, // 上传配置
    };
  },
  methods: {
    // 处理 XeUpload 传入 renderjs 数据，以及调起上传框
    renderProps(info) {
      const { id, renderInput, upload } = info;
      if (!renderInput) return;
      this.id = id;
      this.uploadOptions = upload;
      this.$nextTick(() => {
        const dom = document.getElementById(`xe-upload-${id}`);
        dom.addEventListener('change', () => {
          this.handleUpload();
        });
        dom?.click?.();
      });
    },
    // 处理文件上传(没有传入url时返回本地链接)
    async handleUpload() {
      const {
        url,
        name,
        header = {},
        formData = {},
      } = this.uploadOptions || {};
      const dom = document.getElementById(`xe-upload-${this.id}`);
      if (!dom.files[0]) return;
      const tmpFileList = Array.from(dom.files);
      const tmpUploads = [];
      for (let i = 0; i < tmpFileList.length; i += 1) {
        const e = tmpFileList[i];
        let tmpType = 'file';
        if (e.type.includes('image')) {
          tmpType = 'image';
        }
        if (e.type.includes('video')) {
          tmpType = 'video';
        }
        const tmpExts = {
          size: e.size,
          name: e.name,
          type: e.type,
          fileType: tmpType,
          tempFilePath: '',
          base64Url: '',
        };
        // 没有传入上传url时，直接返回本地链接
        if (!url) {
          const [parseError, parseUrl] = await awaitWrap(fileToBase64(dom.files[i]));
          if (!parseError) {
            tmpExts.base64Url = parseUrl;
          }
          tmpUploads.push(tmpExts);
          continue;
        };
        const tmpData = new FormData();
        tmpData.append(name, dom.files[i], e.name);
        for (let key in formData) {
          tmpData.append(key, formData[key]);
        }
        // 上传进度
        const onprogress = (ev) => {
          if(ev.lengthComputable) {
            var result = (ev.loaded / ev.total) * 100;
            this.handleRenderEmits({
              type: 'onprogress',
              data: {
                progress: Math.floor(result),
                current: i + 1,
                total: tmpFileList.length,
              },
            });
          };
        }
        tmpUploads.push(appUploadFile({
          url,
          header,
          formData: tmpData
        }, tmpExts, onprogress ));
      }
      // 没有传入上传url时，直接返回本地链接列表
      if (!url) {
        return this.handleRenderEmits({
          type: 'choose',
          data: tmpUploads,
        });
      }
      this.handleRenderEmits({
        type: 'onprogress',
        data: {
          progress: 0,
          current: 1,
          total: tmpFileList.length,
        },
      });
      // 处理上传文件
      const [err, res] = await awaitWrap(Promise.all(tmpUploads));
      if (err) {
        return this.handleRenderEmits({
          type: 'warning',
          data: err,
        });
      }
      this.handleRenderEmits({
        type: 'success',
        data: res,
      });
    },
    // 数据传输到XeUpload组件
    handleRenderEmits(data) {
      this.$ownerInstance.callMethod('handleEmits', data);
    },
  },
};
</script>
<!-- #endif -->

<style scoped>
.xe-upload {
  display: none;
}
</style>
