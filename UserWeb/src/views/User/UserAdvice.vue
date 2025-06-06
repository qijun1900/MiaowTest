<template>
    <div class="page-container">
        <TopBack 
            title="意见反馈" 
            navBarIconColor="#000000" />
        <div class="container">
            <div class="icon">
                <UserAdviceSimleIcon size="100" />
            </div>
            <div>
                <Divider 
                title="具体建议*"
                dividerFontSize="18px"
                borderColor="#a0c9ff"/>
                <div class="useradvice">
                    <van-cell-group inset>
                        <van-field
                            v-model="useradvice"
                            rows="2"
                            autosize
                            type="textarea"
                            maxlength="120"
                            placeholder="请具体描述您的建议与问题，您的建议和反馈是我最大的动力!"
                            show-word-limit
                        />
                    </van-cell-group>
                </div>
                <Divider 
                title="联系方式"
                dividerFontSize="18px"
                borderColor="#a0c9ff"/>
                <div class="useradvice">
                    <van-cell-group inset>
                        <van-field 
                            autosize
                            size="large"
                            v-model="userinfo"  
                            placeholder="输请入您的手机号/QQ/邮箱，方便联系您" />
                    </van-cell-group>
                </div>
                <div class="but">
                    <van-button 
                        icon="checked" 
                        type="primary" 
                        plain 
                        round
                        size="large"
                        @click="handSendInfo">
                        按钮
                    </van-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import TopBack from '@/components/FuntionComponents/TopBack.vue';
import UserAdviceSimleIcon from '@/components/icons/UserAdviceSimleIcon.vue';
import Divider from '@/components/FuntionComponents/Divider.vue';
import { ref } from 'vue';
import postUserAdvice from '@/API/psotUserAdvice';
import {  showFailToast,showToast  } from 'vant';
 
const useradvice = ref(''); // 具体建议
const userinfo = ref(''); // 联系方式
const IsShowSuccessIcon = ref(false); 

const handSendInfo = async () => {
    try {
        if (useradvice.value === '') {
            showFailToast('请输入具体建议');
            return; // 提前返回避免嵌套
        }
        
        const data = {
            useradvice: useradvice.value,
            userinfo: userinfo.value,
            type:1// 1 表示用户反馈
        };
        
        const res = await postUserAdvice(data);

        if (res.code === 200) {
            showToast({
                message: '提交成功，感谢您的反馈！',
                icon: 'like-o',
            });
            // 提交成功后清空表单
            useradvice.value = '';
            userinfo.value = '';
        } else {
            showFailToast(res.message || '提交失败，请稍后重试');
        }
    } catch (error) {
        showFailToast('网络错误，请检查网络后重试');
        console.error('Error sending data:', error);
    }
}

</script>
<style scoped>
.page-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f7fcff;
    z-index: -1;
}
.icon{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin-top: 25px;
}
.useradvice{
    margin-top: 8px;
    padding: 6px;
    margin-bottom: 30px;
}
.but{
    display: flex;
    justify-content: center;
    align-items: center; 
    margin-left: 20px;
    margin-right: 20px;

}
</style>