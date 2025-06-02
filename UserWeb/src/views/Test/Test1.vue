<template>
    <div>
        <TopBack title="test" :iconSize="27">
        </TopBack>
        <div>
            <Flex gap="middle" vertical>
                <Bubble 
                    placement="start" 
                    :content="content1"
                    :typing="{ step:1 ,interval: 50,suffix: `<>💗</>`}"
                    variant="shadow"
                    >
                    <template #avatar>
                        <Avatar :icon="h(UserOutlined)" :style="fooAvatar" />
                    </template>
                </Bubble>

                <Bubble 
                    placement="end" 
                    :content="content2"
                    :typing="{ step:1 ,interval: 50,}">
                    <template #avatar>
                        <Avatar :icon="h(UserOutlined)" :style="barAvatar" />
                    </template>
                </Bubble>
            </Flex>
            <Bubble placement="start" content="loading..." :loading=loading>
                <template #avatar>
                    <Avatar :icon="h(UserOutlined)" :style="barAvatar" />
                </template>
            </Bubble>
            Loading state:
            <Switch v-model:checked=loading />
        </div>
        <div class="test">
            <van-field v-model="UserInput" label="文本" placeholder="请输入问题" >
                <template #button>
                    <van-button size="small" type="primary" @click="handleSend">发送问题</van-button>
                </template>
            </van-field>
                <Bubble 
                    placement="start" 
                    :content="Aidata"
                    :typing="{ step:1 ,interval: 50,suffix: `<>💗</>`}"
                    variant="shadow"
                    >
                    <template #avatar>
                        <Avatar :icon="h(UserOutlined)" :style="fooAvatar" />
                    </template>
                </Bubble>
        </div>
    </div>
</template>
<script setup>
import TopBack from '@/components/FuntionComponents/TopBack.vue';
import { Bubble } from 'ant-design-x-vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { Flex, Avatar, Switch } from 'ant-design-vue';
import { h } from 'vue';
import { ref } from 'vue';
import axios from 'axios';

const loading = ref(true);
const fooAvatar = {
    color: '#f56a00',
    backgroundColor: '#fde3cf',
};

const barAvatar = {
    color: '#fff',
    backgroundColor: '#87d068',
};
const  content1  =  ref('Good morning, how are you?');
const  content2   = ref('Hi, good morning, I\'m fine!');
const Aidata = ref('');

const UserInput = ref('')
const handleSend = () => {
    console.log(UserInput.value);
    sendRequest();
}
const  sendRequest = async () => {
    try {
        const response = await axios.post('/webapi/testapi/chat', { message: UserInput.value });
        console.log(response.data); // 处理响应数据
        Aidata.value = response.data.data;
    } catch (error) {
        console.error(error); // 处理错误
    }
};



</script>
<style scoped></style>