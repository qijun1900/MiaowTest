<template>
    <view class="container">
        <!-- 使用PageHead组件 -->
        <PageHead ref="pageHeadRef" title="所有工具" />
        <!-- 工具列表区域 -->
        <ToolsList
            :toolsList="toolsList"
            :paddingTop="pageHeadRef?.contentPaddingTop + 10 + 'px'"
            @toolClick="handleToolClick"
            @orderChange="handleOrderChange"
        />
    </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import PageHead from "../../components/core/PageHead.vue";
import ToolsList from "../../components/modules/tools/ToolsList.vue";
import showShareMenu from "../../util/wechatShare.js";
import checkLogin from "../../util/checkLogin.js";

const pageHeadRef = ref();
const TOOLS_ORDER_STORAGE_KEY = "tools:list:order";

// 工具列表配置
const defaultToolsList = [
    {
        title: "计时器",
        desc: "精确计时，支持倒计时和正计时模式",
        icon: "/static/tools/tools-timer.png",
        path: "/pages/tools/TimerToolView",
        needLogin: false,
    },
    {
        title: "TODO",
        desc: "记录待办事项，管理学习任务，制定学习计划",
        icon: "/static/tools/tools-todo.png",
        path: "/pages/tools/TodoToolView",
        needLogin: true,
    },
    // {
    //   title: '喵喵单词',
    //   desc: '单词记忆工具，帮助你快速学习单词',
    //   icon: '/static/tools/tools-words.png',
    //   path: '/pages/tools/WordsToolView',
    //   needLogin: true
    // },
    // {
    //   title: '喵喵笔记',
    //   desc: '笔记工具，帮助你快速记录和管理笔记',
    //   icon: '/static/tools/tools-notes.png',
    //   path: '/pages/tools/NotesToolView',
    //   needLogin: true
    // } ,
    {
        title: "喵喵错题本",
        desc: "错题记录工具，帮助你快速记录和管理错题",
        icon: "/static/tools/tools-wrong.png",
        path: "/pages/tools/WrongBookToolView",
        needLogin: true,
    },
];

const toolsList = ref([...defaultToolsList]);

const applySavedOrder = (savedPaths) => {
    if (!Array.isArray(savedPaths) || !savedPaths.length) {
        return [...defaultToolsList];
    }

    const pathToolMap = new Map();
    defaultToolsList.forEach((tool) => {
        pathToolMap.set(tool.path, tool);
    });

    const sortedTools = [];
    savedPaths.forEach((path) => {
        const tool = pathToolMap.get(path);
        if (tool) {
            sortedTools.push(tool);
            pathToolMap.delete(path);
        }
    });

    pathToolMap.forEach((tool) => {
        sortedTools.push(tool);
    });

    return sortedTools;
};

const loadToolsOrder = () => {
    try {
        const savedPaths = uni.getStorageSync(TOOLS_ORDER_STORAGE_KEY);
        toolsList.value = applySavedOrder(savedPaths);
    } catch (error) {
        console.warn("读取工具排序失败，使用默认顺序:", error);
        toolsList.value = [...defaultToolsList];
    }
};

const persistToolsOrder = (list) => {
    try {
        const pathOrder = list.map((tool) => tool.path).filter(Boolean);
        uni.setStorageSync(TOOLS_ORDER_STORAGE_KEY, pathOrder);
    } catch (error) {
        console.warn("保存工具排序失败:", error);
    }
};

const handleOrderChange = (newList) => {
    if (!Array.isArray(newList) || !newList.length) return;
    toolsList.value = [...newList];
    persistToolsOrder(toolsList.value);
};

// 统一的工具点击处理函数
const handleToolClick = async (tool) => {
    if (tool.needLogin) {
        const isLoggedIn = await checkLogin("请登录后再操作");
        if (!isLoggedIn) return;
    }

    if (tool.path) {
        uni.navigateTo({
            url: tool.path,
        });
    }
};

// 页面加载时执行
onMounted(() => {
    loadToolsOrder();
    //#ifdef MP-WEIXIN
    showShareMenu();
    //#endif
});
</script>

<style scoped>
.container {
    min-height: 100vh;
    height: 100vh;
    overflow-y: auto;
    background: linear-gradient(to bottom, #deeeff 0%, #ffffff 100%);
    position: relative;
}
</style>
