const mongoose = require('mongoose')

// 计数器集合,用来记录各种类型的自增ID
// 例如：用户注册的自增ID，考试的自增ID，收藏的自增ID等等
// 这样可以保证每个ID都是唯一的，并且可以方便地进行查询和排序

const CounterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        default: 0
    },
    description: {  // 添加描述字段，便于管理
        type: String,
        default: ''
    }
});

const CounterModel = mongoose.model('counter', CounterSchema);

/** 
 * 获取下一个用户注册顺序号 
 * 使用MongoDB的原子操作确保在高并发情况下的唯一性 
 */ 
const getNextUserCount = async () => {
    try {
        const counter = await CounterModel.findOneAndUpdate(
            { _id: 'userRegisterCount' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        return counter.seq;
    } catch (error) {
        console.error('获取用户注册顺序号失败:', error);
        throw new Error('注册顺序号生成失败');
    }
};

module.exports = {
    CounterModel,
    getNextUserCount
};
