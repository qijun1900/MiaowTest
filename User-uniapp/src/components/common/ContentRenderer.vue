<template>
  <MpHtml
    v-if="isMarkdown"
    class="note-md-render"
    :content="content"
    :markdown="true"
    :tag-style="mergedTagStyle"
    :selectable="selectable"
    :preview-img="previewImg"
    :show-img-menu="showImgMenu"
    :scroll-table="scrollTable"
  />
  <rich-text
    v-else
    class="note-rich-render"
    :nodes="content"
  ></rich-text>
</template>

<script setup>
import { computed } from "vue";
import MpHtml from "../../uni_modules/mp-html/components/mp-html/mp-html.vue";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  isMarkdown: {
    type: Boolean,
    default: false,
  },
  selectable: {
    type: [Boolean, String],
    default: true,
  },
  previewImg: {
    type: [Boolean, String],
    default: true,
  },
  showImgMenu: {
    type: [Boolean, String],
    default: true,
  },
  scrollTable: {
    type: [Boolean, String],
    default: true,
  },
  tagStyle: {
    type: Object,
    default: () => ({}),
  },
});

const defaultTagStyle = {
  p: "margin: 8rpx 0; line-height: 1.8;",
  div: "line-height: 1.8;",
  img: "max-width: 100%; border-radius: 8px; margin: 8rpx 0;",
  table: "border-collapse: collapse; max-width: 100%; margin: 8rpx 0;",
  th: "border:1px solid #e5e7eb;padding:6px;background:#f8fafc;",
  td: "border:1px solid #e5e7eb;padding:6px;",
  thead: "background:#f8fafc;",
  pre: "margin:8px 0;padding:10px;border-radius:8px;background:#111827;color:#f8fafc;overflow:auto;",
  code: "padding:2px 5px;border-radius:4px;background:#eef2f7;color:#1f3a8a;",
  span: "line-height:1.8;",
  a: "color:#2563eb;text-decoration:none;",
};

const mergedTagStyle = computed(() => ({
  ...defaultTagStyle,
  ...props.tagStyle,
}));
</script>

<style scoped>
.note-md-render {
  font-size: 32rpx;
  line-height: 1.8;
  color: #4f576b;
  display: block;
}

.note-rich-render {
  font-size: 32rpx;
  line-height: 1.8;
  color: #4f576b;
}
</style>
