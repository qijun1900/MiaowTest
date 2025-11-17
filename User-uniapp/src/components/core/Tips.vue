<template>
	<view 
		v-if="visible" 
		class="tips-container" 
		:class="type" 
		@click="handleClick">
		<view class="tips-content">
			<view 
				v-if="showIcon" 
				class="tips-icon">
				<text class="iconfont" 
				:class="iconClass">
			</text>
			</view>
			<view class="tips-text">{{ text }}</view>
			<view 
				v-if="closable && !clickable" 
				class="tips-close" @click.stop="close">
				<text class="iconfont icon-close"></text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 定义props
const props = defineProps({
	// 提示文本
	text: {
		type: String,
		default: ''
	},
	// 提示类型：info, success, warning, error
	type: {
		type: String,
		default: 'info'
	},
	// 是否显示图标
	showIcon: {
		type: Boolean,
		default: true
	},
	// 是否可关闭
	closable: {
		type: Boolean,
		default: true
	},
	// 自动关闭时间(毫秒)，0表示不自动关闭
	duration: {
		type: Number,
		default: 3000
	},
	// 是否可点击
	clickable: {
		type: Boolean,
		default: false
	}
})

// 定义emits
const emit = defineEmits(['close'])

// 响应式数据
const visible = ref(true)
let timer = null

// 计算属性
const iconClass = computed(() => {
	const iconMap = {
		'info': 'icon-info',
		'success': 'icon-success',
		'warning': 'icon-warning',
		'error': 'icon-error'
	}
	return iconMap[props.type] || iconMap['info']
})

// 方法
const close = () => {
	visible.value = false
	emit('close')
}

const handleClick = () => {
	if (props.clickable) {
		emit('click')
	}
}

// 生命周期
onMounted(() => {
	if (props.duration > 0) {
		timer = setTimeout(() => {
			close()
		}, props.duration)
	}
})

onBeforeUnmount(() => {
	if (timer) {
		clearTimeout(timer)
	}
})
</script>

<style lang="scss" scoped>
.tips-container {
	margin: 20rpx 0;
	border-radius: 16rpx;
	overflow: hidden;
	
	&.info {
		background-color: rgba(64, 158, 255, 0.1);
	}
	
	&.success {
		background-color: rgba(103, 194, 58, 0.1);
	}
	
	&.warning {
		background-color: rgba(230, 162, 60, 0.1);
	}
	
	&.error {
		background-color: rgba(245, 108, 108, 0.1);
	}
	
	// 可点击样式
	&.clickable {
		cursor: pointer;
		transition: all 0.3s ease;
		
		&:hover {
			opacity: 0.8;
			transform: translateY(-2rpx);
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
		}
		
		&:active {
			transform: translateY(0);
		}
	}
}

.tips-content {
	display: flex;
	align-items: center;
	padding: 15rpx 22rpx;
	font-size: 28rpx;
	line-height: 1.2;
	color: #606266;
}

.tips-icon {
	margin-right: 8rpx;
	font-size: 30rpx;
	
	.icon-info {
		color: #409EFF;
	}
	
	.icon-success {
		color: #67C23A;
	}
	
	.icon-warning {
		color: #E6A23C;
	}
	
	.icon-error {
		color: #F56C6C;
	}
}

.tips-text {
	flex: 1;
}

.tips-close {
	margin-left: 8px;
	padding: 2px;
	cursor: pointer;
	
	.icon-close {
		color: #909399;
		font-size: 30rpx;
	}
}

/* 基础图标样式*/
.iconfont {
	font-family: "iconfont";
}


.icon-success::before {
	content: "✓";
}

.icon-warning::before {
	content: "⚠";
}

.icon-error::before {
	content: "✕";
}

.icon-close::before {
	content: "×";
}
</style>