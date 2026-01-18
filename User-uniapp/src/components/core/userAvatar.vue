<template>
    <view
        class="avatar-container"
        :style="containerStyle"
    >
        <image
            class="avatar"
            mode="aspectFill"
            :src="avatarSrc"
            :style="avatarStyle"
            @click="handleClick"
            @error="handleError"
        />
        <!-- 在线状态指示点（可选） -->
        <view v-if="showOnline && userInfoStore.isLoggedIn" class="online-dot"></view>
    </view>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import { UserInfoStore } from '../../stores/modules/UserinfoStore';

const userInfoStore = UserInfoStore();

const emit = defineEmits(['click', 'error']);

const props = defineProps({
    // 头像宽度，单位rpx
    width: {
        type: Number,
        default: 110
    },
    // 头像高度，单位rpx
    height: {
        type: Number,
        default: 110
    },
    // 自定义头像地址（可选，不传则使用用户信息中的头像）
    src: {
        type: String,
        default: ''
    },
    // 是否显示在线状态点
    showOnline: {
        type: Boolean,
        default: false
    },
    // 头像形状：circle（圆形）、square（方形）、rounded（圆角方形）
    shape: {
        type: String,
        default: 'circle',
        validator: (value) => ['circle', 'square', 'rounded'].includes(value)
    },
    // 圆角大小（仅在shape为rounded时生效），单位rpx
    borderRadius: {
        type: Number,
        default: 20
    },
    // 是否显示边框
    showBorder: {
        type: Boolean,
        default: false
    },
    // 边框颜色
    borderColor: {
        type: String,
        default: '#fff'
    },
    // 边框宽度，单位rpx
    borderWidth: {
        type: Number,
        default: 4
    }
});


// 计算头像地址
const avatarSrc = computed(() => {
    // 如果传入了自定义src，优先使用
    if (props.src) {
        return props.src;
    }
    
    // 根据登录状态返回对应头像
    if (userInfoStore.isLoggedIn) {
        return userInfoStore.userInfo?.avatar || '/static/other/default-avatar.png';
    }
    
    return '/static/other/default-user.png';
});

// 计算容器样式
const containerStyle = computed(() => {
    return {
        width: `${props.width}rpx`,
        height: `${props.height}rpx`,
        position: 'relative',
        display: 'inline-block'
    };
});

// 计算头像样式
const avatarStyle = computed(() => {
    let borderRadiusValue = '50%'; // 默认圆形
    
    if (props.shape === 'square') {
        borderRadiusValue = '0';
    } else if (props.shape === 'rounded') {
        borderRadiusValue = `${props.borderRadius}rpx`;
    }
    
    return {
        width: '100%',
        height: '100%',
        borderRadius: borderRadiusValue,
        border: props.showBorder ? `${props.borderWidth}rpx solid ${props.borderColor}` : 'none',
        boxSizing: 'border-box'
    };
});

// 点击事件
const handleClick = () => {
    emit('click');
};

// 图片加载失败事件
const handleError = (e) => {
    emit('error', e);
};
</script>

<style scoped>
.avatar-container {
    position: relative; 
    display: inline-block; /** 头像容器设为行内块元素，确保内边距和边框生效 */
}

.avatar {
    display: block; 
    object-fit: cover; /** 确保图片填充容器，保持比例 */
    background-color: #f0f8ff;
    box-shadow: 0 4rpx 12rpx rgba(198, 226, 255, 0.25); /* 柔和的蓝色阴影 */
    border: 2px solid rgba(255, 255, 255, 0.9); /* 明亮的白色边框 */
}

.online-dot {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 20rpx;
    height: 20rpx;
    background: #4CAF50;
    border-radius: 50%;
    border: 3rpx solid #fff;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}
</style>