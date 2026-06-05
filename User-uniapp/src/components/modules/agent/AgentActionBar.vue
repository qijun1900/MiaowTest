<template>
    <view v-if="visible" class="action-bar-wrapper">
        <t-chat-actionbar
            :content="content"
            :action-bar="builtinActions"
            :placement="placement"
            :copy-mode="copyMode"
            @actions="handleTdActions"
        >
            <template #prefix>
                <view
                    v-if="actions.includes('save-note')"
                    class="custom-action-item"
                    hover-class="custom-action-item-active"
                    @click="handleSaveNote"
                >
                    <t-icon name="edit-1" :size="iconSize" color="#8b8fa3" />
                </view>
                <view
                    v-if="actions.includes('favorite')"
                    class="custom-action-item"
                    hover-class="custom-action-item-active"
                    @click="handleFavorite"
                >
                    <t-icon
                        :name="favorited ? 'star-filled' : 'star'"
                        :size="iconSize"
                        :color="favorited ? '#f5a623' : '#8b8fa3'"
                    />
                </view>
                <view
                    v-if="actions.includes('more')"
                    class="custom-action-item"
                    hover-class="custom-action-item-active"
                    @click="handleMore"
                >
                    <t-icon name="more" :size="iconSize" color="#8b8fa3" />
                </view>
            </template>
        </t-chat-actionbar>
    </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    content: {
        type: String,
        default: "",
    },
    favorited: {
        type: Boolean,
        default: false,
    },
    visible: {
        type: Boolean,
        default: true,
    },
    actions: {
        type: Array,
        default: () => ["copy", "favorite", "regenerate", "more", "good", "bad", "share", "save-note"],
    },
    placement: {
        type: String,
        default: "start",
    },
    copyMode: {
        type: String,
        default: "text",
    },
});

const emit = defineEmits([
    "copy",
    "favorite",
    "regenerate",
    "more",
    "good",
    "bad",
    "share",
    "actions",
    "save-note",
]);

const iconSize = 20;

const ACTION_MAP = {
    copy: "copy",
    regenerate: "replay",
    good: "good",
    bad: "bad",
    share: "share",
    quote: "quote",
};

const builtinActions = computed(() =>
    props.actions
        .map((a) => ACTION_MAP[a])
        .filter(Boolean),
);

const handleTdActions = (ctx) => {
    const { name, active, data } = ctx || {};
    emit("actions", ctx);
    switch (name) {
        case "copy":
            uni.setClipboardData({
                data: data || props.content,
                success: () => {
                    uni.showToast({ 
                        title: "已复制", 
                        icon: "none", 
                        duration: 1500 ,
                        position: "bottom",
                        });
                    emit("copy", data || props.content);
                },
            });
            break;
        case "replay":
            emit("regenerate");
            break;
        case "good":
        case "bad":
        case "share":
            emit(name, active);
            break;
    }
};

const handleFavorite = () => {
    emit("favorite", !props.favorited);
};

const handleMore = () => {
    emit("more");
};

const handleSaveNote = () => {
    emit("save-note", props.content);
};
</script>

<style scoped>
.action-bar-wrapper {
    margin-top: 12rpx;
    margin-left: 8rpx;
}

.custom-action-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
    border-radius: 8rpx;
    transition: all 0.2s ease;
    margin-right: 8rpx;
}

.custom-action-item-active {
    background: rgba(15, 23, 42, 0.05);
    transform: scale(0.95);
}
</style>
