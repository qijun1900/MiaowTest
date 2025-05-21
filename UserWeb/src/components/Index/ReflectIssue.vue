<template>
<van-action-sheet v-model:show="localShow" :title="props.issuetitle">
  <div class="content">
    <template v-if="!isSubmitted">
      <div class="icon">
          <simleIcon size="80"/>
      </div>
      <div class="lable">
          <el-check-tag 
              :checked="checked === item.value"
              type="success" 
              v-for="item in TagInfo1" 
              :key="item.value"
              @change="onChange(item.value)">
              {{ item.label }}
          </el-check-tag>
      </div>
       <van-button 
            type="primary" 
            size="large" 
            icon="success" 
            round
            @click="handleSubmit">
            提交问题
        </van-button>
    </template>
    <template v-else>
      <div class="success-content">
            <div class="success-icon">
                <SuccessSimleIcon size="100"/>
            </div>
            <br>
            <div>
                <span class="success-text">
                    谢谢，您对的问题已经提交成功!
                </span>
            </div>
      </div>
    </template>
  </div>
</van-action-sheet>
</template>
<script setup>
import { ref, watch } from 'vue';
import simleIcon from '../icons/simleIcon.vue';
import TagInfo1 from '@/util/TagInfo';
import { useRoute } from 'vue-router';
import postUserExamIssuse from '@/API/postUserExamIssuse';
import SuccessSimleIcon from '../icons/SuccessSimleIcon.vue';
import { showFailToast } from 'vant';
const route = useRoute();
const props = defineProps({
    Isshow: {
        type: Boolean,
        default: false
    },
    issuetitle: {
        type: String,
        default: "标题"
    },
})
const checked = ref(null);
const localShow = ref(props.Isshow);
const isSubmitted = ref(false); // 新增提交状态

const emit = defineEmits(['update:Isshow']);

const onChange = (value) => {
    checked.value = value
}
const handleSubmit = async () => {
    try {
        if (!checked.value) {
            return showFailToast('请选择问题类型') ; 
        }
        const res = await postUserExamIssuse(route.params.id, checked.value);
        if (res.code === 200) {
            isSubmitted.value = true; // 提交成功后更新状态
            setTimeout(() => { // 延时关闭弹窗
                localShow.value = false;
            }, 5000);
        }
    } catch (err) {
        console.log(err);
    }
}
watch(localShow, (newVal) => {
    emit('update:Isshow', newVal);
});

watch(() => props.Isshow, (newVal) => {
    localShow.value = newVal;
});

</script>
<style scoped>
.content {
    height: 370px;
    width: 100%;
}

.icon {
    display: flex;
    justify-content: center;
    align-items: center;
}

.lable {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    /* 修改为150px最小宽度 */
    gap: 10px;
    padding: 10px;
}

.el-check-tag {
    font-size: 15px;
    text-align: center;
    transition: all 0.3s;
    margin: 2px;
    padding: 12px 10px;
    /* 调整内边距 */
    border-radius: 20px;
    transition: transform 0.2s;
    white-space: nowrap;
    overflow: hidden;
    /* 新增防止溢出 */
    text-overflow: ellipsis;
    /* 文字过长显示省略号 */
    max-width: 100%;
    /* 确保不超过容器宽度 */
}
.el-check-tag:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.success-content{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.success-icon{
    margin-top: 25px;
    margin-bottom: 20px;
}
.success-text{
    font-size: 22px;
    color: #181c1e;
    font-weight: bold;
}
</style>