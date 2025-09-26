<template>
    <view class="editor-section">
        <!-- 工具栏 -->
        <view class="toolbar-container" 
            :class="{ 'toolbar-show': showtoolbar, 'toolbar-hide': !showtoolbar }">
            <view class="toolbar">
                <!-- 撤销/重做 -->
                <view class="toolbar-item" @tap.stop="undo" :class="{ disabled: !canUndo }">
                    <text class="iconfont icon-undo">↶</text>
                </view>
                <view class="toolbar-item" @tap.stop="redo" :class="{ disabled: !canRedo }">
                    <text class="iconfont icon-redo">↷</text>
                </view>

                <view class="toolbar-divider"></view>

                <!-- 基本格式 -->
                <view class="toolbar-item" :class="{ active: currentFormat === 'bold' }" data-format="bold"
                    @tap.stop="formatText" :title="'加粗'">
                    <text class="iconfont icon-bold">B</text>
                </view>
                <view class="toolbar-item" :class="{ active: currentFormat === 'italic' }" data-format="italic"
                    @tap.stop="formatText" :title="'斜体'">
                    <text class="iconfont icon-italic">I</text>
                </view>
                <view class="toolbar-item" :class="{ active: currentFormat === 'underline' }" data-format="underline"
                    @tap.stop="formatText" :title="'下划线'">
                    <text class="iconfont icon-underline">U</text>
                </view>
                <view class="toolbar-item" :class="{ active: currentFormat === 'strike' }" data-format="strike"
                    @tap.stop="formatText" :title="'删除线'">
                    <text class="iconfont icon-strike">S</text>
                </view>

                <view class="toolbar-divider"></view>

                <!-- 对齐方式 -->
                <view class="toolbar-item" :class="{ active: currentFormat === 'alignLeft' }" data-format="align"
                    data-value="left" @tap.stop="formatText" :title="'左对齐'">
                    <text class="iconfont icon-align-left">◀</text>
                </view>
                <view class="toolbar-item" :class="{ active: currentFormat === 'alignCenter' }" data-format="align"
                    data-value="center" @tap.stop="formatText" :title="'居中对齐'">
                    <text class="iconfont icon-align-center">◆</text>
                </view>
                <view class="toolbar-item" :class="{ active: currentFormat === 'alignRight' }" data-format="align"
                    data-value="right" @tap.stop="formatText" :title="'右对齐'">
                    <text class="iconfont icon-align-right">▶</text>
                </view>

                <view class="toolbar-divider"></view>

                <!-- 角标 -->
                <view class="toolbar-item" :class="{ active: currentFormat === 'script-super' }" data-name="script"
                    data-value="super" @tap.stop="formatText" :title="'上角标'">
                    <text class="iconfont icon-superscript">x²</text>
                </view>
                <view class="toolbar-item" :class="{ active: currentFormat === 'script-sub' }" data-name="script"
                    data-value="sub" @tap.stop="formatText" :title="'下角标'">
                    <text class="iconfont icon-subscript">x₂</text>
                </view>

                <view class="toolbar-divider"></view> <!-- 分割线 -->

                <!-- 颜色 -->
                <view class="toolbar-item" @tap.stop="showColorPicker" :title="'字体颜色'">
                    <text class="iconfont icon-color" style="color: #ff0000;">C</text>
                </view>
                <view class="toolbar-item" @tap.stop="showBgColorPicker" :title="'背景颜色'">
                    <text class="iconfont icon-bgcolor" style="background-color: #ffff00;">B</text>
                </view>

                <view class="toolbar-divider"></view>

                <!-- 列表 -->
                <view class="toolbar-item" :class="{ active: currentFormat === 'list' }" data-format="list"
                    @tap.stop="formatText" :title="'无序列表'">
                    <text class="iconfont icon-list">L</text>
                </view>
                <view class="toolbar-item" :class="{ active: currentFormat === 'orderedList' }" data-format="orderedList"
                    @tap.stop="formatText" :title="'有序列表'">
                    <text class="iconfont icon-ordered-list">1.</text>
                </view>

                <view class="toolbar-divider"></view>

                <!-- 清除格式 -->
                <view class="toolbar-item" @tap.stop="clearFormat" :title="'清除格式'">
                    <text class="iconfont icon-clear">✕</text>
                </view>

                <!-- 清空内容 -->
                <view class="toolbar-item" @tap.stop="clearContent" :title="'清空内容'">
                    <text class="iconfont icon-clear-all">⌫</text>
                </view>

                <!-- 字体颜色选择器 -->
                <view class="color-picker" v-if="showColor">
                    <view class="color-option" v-for="color in colors" :key="color" @tap="setFontColor(color)">
                        <view :style="{ backgroundColor: color }" class="color-circle"></view>
                    </view>
                    <view class="custom-color">
                        <input type="color" v-model="customColor" @change="setFontColor(customColor)" />
                    </view>
                </view>

                <!-- 背景颜色选择器 -->
                <view class="color-picker" v-if="showBgColor">
                    <view class="color-option" v-for="color in colors" :key="color" @tap="setBgColor(color)">
                        <view :style="{ backgroundColor: color }" class="color-circle"></view>
                    </view>
                    <view class="custom-color">
                        <input type="color" v-model="customBgColor" @change="setBgColor(customBgColor)" />
                    </view>
                </view>
            </view>
        </view>
        <!-- 编辑器 -->
        <view class="editor-wrapper">
            <editor 
                id="editor" 
                class="editor" 
                :placeholder="props.placeholder" 
                @input="handleInput"
                @ready="handleReady" 
                @focus="hanleFocus"
                @blur="handleBlur"/>
        </view>
    </view>
</template>

<script setup>
import { ref, watch, getCurrentInstance } from 'vue';

// 编辑器上下文
const editorCtx = ref(null);
// 用于标记是否是用户输入
const isUserInput = ref(false);
// 上一次的内容
const lastContent = ref('');
// 当前选中的格式
const currentFormat = ref('');
// 撤销/重做状态
const canUndo = ref(false);
const canRedo = ref(false);
// 历史记录栈,先进后出
const historyStack = ref([]);
const historyIndex = ref(-1);

// 字体颜色选择器
const showColor = ref(false);
const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
const customColor = ref('#000000');

// 背景颜色选择器
const showBgColor = ref(false);
const customBgColor = ref('#ffffff');

// 字体大小选择器
const showFontSize = ref(false);

// 工具栏显示
const showtoolbar = ref(false);
// 延迟隐藏定时器
const hideTimer = ref(null);

// 获取当前组件实例
const { proxy } = getCurrentInstance();

// 定义组件属性
const props = defineProps({
    modelValue: {// 双向绑定的内容
        type: String,
        default: ''
    },
    placeholder: {// 编辑器占位符
        type: String,
        default: '请输入内容...'
    },
    height: {// 编辑器高度
        type: String,
        default: '400rpx'
    },
});

//工具栏显示
const hanleFocus = () => {
    showtoolbar.value = true;
    // 清除可能存在的隐藏定时器
    if (hideTimer.value) {
        clearTimeout(hideTimer.value);
        hideTimer.value = null;
    }
}

const handleBlur = () => {
    // 延迟隐藏工具栏，给用户时间点击工具栏按钮
    hideTimer.value = setTimeout(() => {
        showtoolbar.value = false;
    }, 300); // 300ms延迟，用户有足够时间点击工具栏
}

// 定义事件
const emit = defineEmits(['update:modelValue']);

// 保存历史记录
const saveHistory = (content) => {
    // 如果当前不在历史记录的末尾，则删除当前位置之后的所有记录
    if (historyIndex.value < historyStack.value.length - 1) {
        historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
    }

    // 添加新的历史记录
    historyStack.value.push(content);
    historyIndex.value = historyStack.value.length - 1;

    // 限制历史记录的最大长度
    if (historyStack.value.length > 50) {
        historyStack.value.shift();
        historyIndex.value--;
    }

    // 更新撤销/重做状态
    updateUndoRedoStatus();
};

// 更新撤销/重做状态
const updateUndoRedoStatus = () => {
    canUndo.value = historyIndex.value > 0;
    canRedo.value = historyIndex.value < historyStack.value.length - 1;
};

// 处理输入事件
const handleInput = (e) => {
    isUserInput.value = true;
    const html = e.detail.html;
    lastContent.value = html;
    emit('update:modelValue', html);

    // 保存历史记录
    saveHistory(html);
};

// 编辑器准备就绪
const handleReady = () => {
    // 获取编辑器上下文
    uni.createSelectorQuery()
        .in(proxy)
        .select('#editor')
        .context((res) => {
            editorCtx.value = res.context;
            // 编辑器就绪后，如果modelValue有值，设置到编辑器中
            if (props.modelValue) {
                lastContent.value = props.modelValue;
                editorCtx.value.setContents({
                    html: props.modelValue
                });

                // 初始化历史记录
                historyStack.value = [props.modelValue];
                historyIndex.value = 0;
                updateUndoRedoStatus();
            } else {
                // 初始化空内容的历史记录
                historyStack.value = [''];
                historyIndex.value = 0;
                updateUndoRedoStatus();
            }
        })
        .exec();
};

// 监听modelValue变化，同步到编辑器
watch(() => props.modelValue, (newValue) => {
    // 如果是用户输入导致的modelValue变化，不重新设置内容
    if (isUserInput.value) {
        isUserInput.value = false;
        return;
    }

    // 如果内容没有变化，不重新设置
    if (newValue === lastContent.value) {
        return;
    }

    if (editorCtx.value && newValue !== undefined) {
        lastContent.value = newValue;
        editorCtx.value.setContents({
            html: newValue
        });

        // 保存历史记录
        saveHistory(newValue);
    }
});

// 显示字体颜色选择器
const showColorPicker = () => {
    showColor.value = !showColor.value;
    showBgColor.value = false;
    showFontSize.value = false;
};

// 显示背景颜色选择器
const showBgColorPicker = () => {
    showBgColor.value = !showBgColor.value;
    showColor.value = false;
    showFontSize.value = false;
};

// 设置字体颜色
const setFontColor = (color) => {
    if (editorCtx.value) {
        editorCtx.value.format('color', color);
        showColor.value = false;
        customColor.value = color;

        // 格式化后获取当前内容并保存历史记录
        setTimeout(() => {
            editorCtx.value.getContents({
                success: (res) => {
                    saveHistory(res.html);
                }
            });
        }, 100);
    }
};

// 设置背景颜色
const setBgColor = (color) => {
    if (editorCtx.value) {
        editorCtx.value.format('backgroundColor', color);
        showBgColor.value = false;
        customBgColor.value = color;

        // 格式化后获取当前内容并保存历史记录
        setTimeout(() => {
            editorCtx.value.getContents({
                success: (res) => {
                    saveHistory(res.html);
                }
            });
        }, 100);
    }
};

// 撤销
const undo = () => {
    if (canUndo.value && editorCtx.value) {
        // 移动到上一个历史记录
        historyIndex.value--;

        // 恢复内容
        const content = historyStack.value[historyIndex.value];
        editorCtx.value.setContents({
            html: content
        });

        // 更新状态
        lastContent.value = content;
        emit('update:modelValue', content);
        updateUndoRedoStatus();
    }
};

// 重做
const redo = () => {
    if (canRedo.value && editorCtx.value) {
        // 移动到下一个历史记录
        historyIndex.value++;

        // 恢复内容
        const content = historyStack.value[historyIndex.value];
        editorCtx.value.setContents({
            html: content
        });

        // 更新状态
        lastContent.value = content;
        emit('update:modelValue', content);
        updateUndoRedoStatus();
    }
};

// 清除格式
const clearFormat = () => {
    if (editorCtx.value) {
        editorCtx.value.removeFormat();
        currentFormat.value = '';

        // 清除格式后获取当前内容并保存历史记录
        setTimeout(() => {
            editorCtx.value.getContents({
                success: (res) => {
                    saveHistory(res.html);
                }
            });
        }, 100);
    }
};

// 清空内容
const clearContent = () => {
    if (editorCtx.value) {
        uni.showModal({
            title: '提示',
            content: '确定要清空所有内容吗？',
            success: (res) => {
                if (res.confirm) {
                    editorCtx.value.setContents({
                        html: ''
                    });
                    lastContent.value = '';
                    emit('update:modelValue', '');

                    // 保存历史记录
                    saveHistory('');
                }
            }
        });
    }
};

// 格式化文本
const formatText = (e) => {
    const name = e.currentTarget.dataset.name;
    const format = e.currentTarget.dataset.format;
    const value = e.currentTarget.dataset.value;

    if ((!name && !format) || !editorCtx.value) return;

    // 处理角标特殊逻辑
    if (name === 'script') {
        const formatKey = `script-${value}`;
        // 如果点击的是当前已选中的格式，则取消选中
        if (currentFormat.value === formatKey) {
            currentFormat.value = '';
            // 取消角标格式
            editorCtx.value.format('script', false);
        } else {
            currentFormat.value = formatKey;
            // 设置角标格式
            editorCtx.value.format('script', value);
        }

        // 格式化后获取当前内容并保存历史记录
        setTimeout(() => {
            editorCtx.value.getContents({
                success: (res) => {
                    saveHistory(res.html);
                }
            });
        }, 100);
        return;
    }

    // 处理对齐方式
    if (format === 'align') {
        const formatKey = `align${value.charAt(0).toUpperCase() + value.slice(1)}`;
        // 如果点击的是当前已选中的格式，则取消选中
        if (currentFormat.value === formatKey) {
            currentFormat.value = '';
            // 取消对齐格式
            editorCtx.value.format('align', 'left');
        } else {
            currentFormat.value = formatKey;
            // 设置对齐格式
            editorCtx.value.format('align', value);
        }

        // 格式化后获取当前内容并保存历史记录
        setTimeout(() => {
            editorCtx.value.getContents({
                success: (res) => {
                    saveHistory(res.html);
                }
            });
        }, 100);
        return;
    }

    // 处理其他格式...
    const targetFormat = name || format;

    // 如果点击的是当前已选中的格式，则取消选中
    if (currentFormat.value === targetFormat) {
        currentFormat.value = '';
    } else {
        currentFormat.value = targetFormat;
    }

    if (targetFormat === 'list') {
        editorCtx.value.format('list', 'unordered');
    } else if (targetFormat === 'orderedList') {
        editorCtx.value.format('list', 'ordered');
    } else {
        // 普通格式处理
        editorCtx.value.format(targetFormat, value || true);
    }

    // 格式化后获取当前内容并保存历史记录
    setTimeout(() => {
        editorCtx.value.getContents({
            success: (res) => {
                saveHistory(res.html);
            }
        });
    }, 100);
};
</script>

<style scoped>
.editor-section {
    margin-bottom: 20rpx;
    border: 1rpx solid #e5e5e5;
    border-radius: 8rpx;
    overflow: hidden;
    position: relative;
}

.toolbar-container {
    overflow: hidden;
    transition: all 0.3s ease;
}

.toolbar-hide {
    max-height: 0; /* 隐藏时设置最大高度为0 */
    opacity: 0; /* 隐藏时设置透明度为0 */
    transform: translateY(-10px); /* 向上移动 */
}

.toolbar-show {
    max-height: 200rpx;     /* 显示时设置最大高度 */
    opacity: 1;
    transform: translateY(0); /* 恢复原始位置 */
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    background-color: #f8f8f8;
    padding: 10rpx;
    border-bottom: 1rpx solid #e5e5e5;
}

.toolbar-item {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5rpx;
    border-radius: 4rpx;
    position: relative;
}

.toolbar-item:active {
    background-color: #e0e0e0;
}

.toolbar-item.active {
    background-color: #007aff;
}

.toolbar-item.active .iconfont {
    color: #ffffff;
}

.toolbar-item.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.toolbar-divider {
    width: 1rpx;
    height: 40rpx;
    background-color: #ddd;
    margin: 10rpx 5rpx;
}

.color-picker {
    position: absolute;
    top: 80rpx;
    left: 10rpx;
    background-color: #fff;
    border: 1rpx solid #e5e5e5;
    border-radius: 8rpx;
    padding: 10rpx;
    z-index: 100;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    display: flex;
    flex-wrap: wrap;
    max-width: 400rpx;
}

.color-option {
    width: 40rpx;
    height: 40rpx;
    margin: 5rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.color-circle {
    width: 30rpx;
    height: 30rpx;
    border-radius: 50%;
    border: 1rpx solid #e5e5e5;
}

.custom-color {
    width: 100%;
    margin-top: 10rpx;
    padding-top: 10rpx;
    border-top: 1rpx solid #e5e5e5;
}

.custom-color input {
    width: 100%;
    height: 40rpx;
    border: none;
    outline: none;
}

.font-size-picker {
    position: absolute;
    top: 80rpx;
    left: 10rpx;
    background-color: #fff;
    border: 1rpx solid #e5e5e5;
    border-radius: 8rpx;
    padding: 10rpx;
    z-index: 100;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    min-width: 120rpx;
}

.font-size-option {
    padding: 10rpx;
    text-align: center;
    border-bottom: 1rpx solid #f0f0f0;
}

.font-size-option:last-child {
    border-bottom: none;
}

.font-size-option:active {
    background-color: #f0f0f0;
}

.editor-wrapper {
    height: v-bind('props.height');
}

.editor {
    height: 100%;
    padding: 20rpx;
    background-color: #fff;
    line-height: 1.5;
    font-size: 28rpx;
    color: #333;
}

.iconfont {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
}
</style>