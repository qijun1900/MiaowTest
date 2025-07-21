<template>
    <el-row :gutter="30">
        <el-col v-for="(item, index) in filterConfig" :key="index" :span="7">
            <el-form-item :label="item.label" style="margin-bottom: 0;">
                <el-input
                    v-if="item.type === 'input'"
                    v-model="searchFilters[item.field]"
                    style="width: 270px"
                    :placeholder="item.placeholder"
                    clearable/>
                <el-select
                    v-else-if="item.type === 'select'"
                    v-model="searchFilters[item.field]"
                    style="width: 270px"
                    :placeholder="item.placeholder"
                    clearable>
                    <el-option
                        v-for="opt in item.options"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"/>
                </el-select>
            </el-form-item>
        </el-col>
        <el-col :span="3">
                <Tooltip content="搜索内容">
                <template #description>
                    <el-button 
                    type="primary" 
                    :icon="Search" 
                    circle 
                    @click="handleSearch" />
                </template>
            </Tooltip>
            <Tooltip content="重置条件">
                <template #description>
                    <el-button 
                        type="danger" 
                        :icon="CloseBold" 
                        circle   
                        @click="handleReset"/>  
                </template>
            </Tooltip>                  
        </el-col>
    </el-row>
</template>
<script setup>
import { reactive } from 'vue'
import Tooltip from '@/components/ReuseComponents/Tooltip.vue'
import useSearchFilter from '@/util/SearchFilter'
import { Search, CloseBold } from '@element-plus/icons-vue'

const props = defineProps({
    Data: {
        type: Array,
        required: true
    },
    filterConfig: {
        type: Array,
        default: () => [
            { 
                type: 'input', 
                label: '用户搜索', 
                placeholder: '请输入关键词',
                field: 'inputFilter',  // 存储值的字段名
                fields: ['username', 'nickname', 'email'] // 多字段搜索
            },
            { 
                type: 'select',
                label: '状态',
                placeholder: '请选择状态',
                field: 'selectFilter1',  // 存储值的字段名
                fields: ['status1'],  // 实际搜索字段
                options: [
                    { label: '启用', value: 1 },
                    { label: '禁用', value: 2 }
                ]
            },
            { 
                type: 'select',
                label: '状态',
                placeholder: '请选择状态',
                field: 'selectFilter2',  // 存储值的字段名
                fields: ['status2'],  // 实际搜索字段
                options: [
                    { label: '启用', value: 1 },
                    { label: '禁用', value: 2 }
                ]
            }
        ]
    }
})
const emit = defineEmits(['onsearch'])

// 初始化搜索条件对象, 用于存储搜索条件
const searchFilters = reactive({})
// 初始化搜索条件, 确保每个字段都有初始值,值为空字符串
props.filterConfig.forEach(item => {
    searchFilters[item.field] = ''
})
//bug,value为0，不能过滤
// 搜索方法
const handleSearch = () => {
    // 初始化为原始数据
    let filteredData = [...props.Data];
    
    // 遍历所有过滤条件
    props.filterConfig.forEach(item => {
        if (searchFilters[item.field]) {
            filteredData = useSearchFilter(
                filteredData, 
                searchFilters[item.field],  
                item.fields || item.field  // 支持单字段和多字段配置
            ).value
        }
    });
    emit('onsearch', filteredData)
};

// 重置方法, 清空所有搜索条件
const handleReset = () => {
    props.filterConfig.forEach(item => {
        searchFilters[item.field] = ''
    });
};
</script>