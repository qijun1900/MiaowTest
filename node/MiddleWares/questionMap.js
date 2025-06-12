const QuestionMap = (data,Type) => {
    if(Type===1){//单选题
        const conciseText = `[${data.题目类型}] ${data.题干} ${data.选项} 正确答案:${data.正确答案}`;
        return conciseText;
    }else if(Type===2){//多选题
        const conciseText = `[${data.题目类型}] ${data.题干} ${data.填空项}`;
        return conciseText;
    }else if(Type===3){//判断题
        const conciseText = `[${data.题目类型}] ${data.题干} 正确答案:${data.正确答案}`;
        return conciseText;
    }else if(Type===4){//简答题
        const conciseText = `[${data.题目类型}] ${data.题干} 参考答案:${data.参考答案}`;    
        return conciseText;
    }


}
module.exports = QuestionMap
