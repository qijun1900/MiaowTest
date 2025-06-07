<template>
    <div class="page-container">
        <TopBack 
            title="意见反馈" 
            navBarIconColor="#000000" 
            navBarBackground="#f7fcff"/>
        <div>
            <div class="icon" :class="{'success-animation': IsShowSuccessIcon}">
                <UserAdviceSimleIcon size="100" />
            </div>
            <div v-show="!IsShowSuccessIcon">
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
                        提交
                    </van-button>
                </div>
            </div>
            <div class="thank-page" v-show="IsShowSuccessIcon">
                <span class="thank-font">谢谢，已经收到您的反馈！</span>
                <div class="tank-but">
                    <van-button 
                        icon="revoke" 
                        type="primary" 
                        round
                        plain
                        size="large"
                        @click="handBack">
                        返回首页
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
import {  showFailToast  } from 'vant';
import RouterBack from '@/util/RouterBack';
 
const useradvice = ref(''); // 具体建议
const userinfo = ref(''); // 联系方式
const IsShowSuccessIcon = ref(false); 

const handSendInfo = async () => {
    try {
        if (useradvice.value === '') {
            showFailToast('请输入具体建议');
            return; // 提前返回，不执行后续逻辑
        }
        
        const data = {
            useradvice: useradvice.value,
            userinfo: userinfo.value,
            type:1// 1 表示用户反馈
        };
        
        const res = await postUserAdvice(data);

        if (res.code === 200) {
            IsShowSuccessIcon.value = true;
            // 提交成功后清空表单
            useradvice.value = '';
            userinfo.value = '';
            setTimeout(() => {
                RouterBack(); // 调用返回函数
            }, 3000);
        } else {
            showFailToast(res.message || '提交失败，请稍后重试');
        }
    } catch (error) {
        showFailToast('网络错误，请检查网络后重试');
        console.error('Error sending data:', error);
    }
}
const handBack = () => {
    RouterBack(); 
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
    transition: all 0.5s ease;
}

.success-animation {
    animation: bounce 1s ease infinite;
}

@keyframes bounce {
    0% {
        transform: scale(1) rotate(0deg);
    }
    25% {
        transform: scale(1.1) rotate(5deg);
    }
    50% {
        transform: scale(1.2) rotate(0deg);
    }
    75% {
        transform: scale(1.1) rotate(-5deg);
    }
    100% {
        transform: scale(1) rotate(0deg);
    }
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
.thank-page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;/* 垂直方向布局 */
}
.thank-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.thank-font {
    font-size: 25px;
    color: #000000;
    font-weight: 800;
    margin-bottom: 30px;
}
.tank-but {
    width: 75%;  /* 控制按钮宽度 */
    margin: 0 auto; /* 水平居中 */
}

.tank-but .van-button {
    height: 50px; /* 增加高度 */
    font-size: 20px; /* 增大字体 */
    line-height: 50px; /* 保持文字垂直居中 */
    font-weight: 700;
}
</style>