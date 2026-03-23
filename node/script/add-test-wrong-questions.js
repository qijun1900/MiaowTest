/**
 * @file add-test-wrong-questions.js
 * @description 添加测试错题数据
 * @script node script/add-test-wrong-questions.js
 */
const dbManager = require("../db/db.enhanced").dbManager;
const WrongBookModel = require("../models/WrongBookModel");
const WrongQuestionModel = require("../models/WrongQuestionModel");
const mongoose = require("mongoose");

const testUserId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");

const testWrongQuestions = [
  {
    Type: 1,
    questionSource: "user",
    stem: {
      text: "<p>下列哪个是JavaScript的基本数据类型？</p>",
      images: [],
    },
    options: [
      { content: "Array", isCorrect: false },
      { content: "Object", isCorrect: false },
      { content: "String", isCorrect: true },
      { content: "Function", isCorrect: false },
    ],
    correctAnswer: {
      text: "C",
      images: [],
    },
    wrongAnswer: {
      text: "A",
      images: [],
    },
    analysis: {
      text: "<p>JavaScript的基本数据类型包括：String、Number、Boolean、Null、Undefined、Symbol。Array、Object、Function都是引用类型。</p>",
      images: [],
    },
    tags: ["概念", "JavaScript"],
    difficulty: "easy",
    status: 0,
    reviewCount: 0,
    wrongCount: 1,
  },
  {
    Type: 1,
    questionSource: "user",
    stem: {
      text: "<p>Vue中用于监听数据变化的核心选项是？</p>",
      images: [],
    },
    options: [
      { content: "computed", isCorrect: false },
      { content: "watch", isCorrect: true },
      { content: "methods", isCorrect: false },
      { content: "data", isCorrect: false },
    ],
    correctAnswer: {
      text: "B",
      images: [],
    },
    wrongAnswer: {
      text: "A",
      images: [],
    },
    analysis: {
      text: "<p>watch选项用于监听数据属性的变化，当数据变化时可以执行相应的回调函数。computed用于计算属性，methods用于定义方法，data用于定义响应式数据。</p>",
      images: [],
    },
    tags: ["概念", "Vue"],
    difficulty: "medium",
    status: 0,
    reviewCount: 0,
    wrongCount: 1,
  },
  {
    Type: 2,
    questionSource: "user",
    stem: {
      text: "<p>CSS中用于设置元素为弹性盒子的属性是______。</p>",
      images: [],
    },
    options: [],
    correctAnswer: {
      text: "display: flex",
      images: [],
    },
    wrongAnswer: {
      text: "display: block",
      images: [],
    },
    analysis: {
      text: "<p>使用display: flex可以将元素设置为弹性盒子容器，从而使用flex布局相关的属性来控制子元素的排列方式。</p>",
      images: [],
    },
    tags: ["CSS", "解题方法"],
    difficulty: "easy",
    status: 0,
    reviewCount: 0,
    wrongCount: 1,
  },
  {
    Type: 3,
    questionSource: "user",
    stem: {
      text: "<p>在Python中，列表是不可变的数据类型。</p>",
      images: [],
    },
    options: [],
    correctAnswer: {
      text: "false",
      images: [],
    },
    wrongAnswer: {
      text: "true",
      images: [],
    },
    analysis: {
      text: "<p>Python中列表(list)是可变的，可以添加、删除、修改元素。元组(tuple)才是不可变的。</p>",
      images: [],
    },
    tags: ["概念", "Python"],
    difficulty: "medium",
    status: 0,
    reviewCount: 0,
    wrongCount: 1,
  },
  {
    Type: 4,
    questionSource: "user",
    stem: {
      text: "<p>请简述什么是闭包？</p>",
      images: [],
    },
    options: [],
    correctAnswer: {
      text: "闭包是指能够访问另一个函数作用域中变量的函数。即使外部函数已经返回，内部函数仍然可以访问外部函数的局部变量。",
      images: [],
    },
    wrongAnswer: {
      text: "闭包是一种函数调用方式",
      images: [],
    },
    analysis: {
      text: "<p>闭包有三个特性：</p><p>1. 可以访问外部函数的变量</p><p>2. 即使外部函数已经结束，内部函数仍然可以访问这些变量</p><p>3. 可以用来创建私有变量</p>",
      images: [],
    },
    tags: ["概念", "JavaScript", "解题方法"],
    difficulty: "hard",
    status: 0,
    reviewCount: 0,
    wrongCount: 1,
  },
];

async function addTestData() {
  try {
    console.log("🚀 开始添加测试数据...");

    await dbManager.connect();
    console.log("✅ 数据库连接成功");

    let wrongBook = await WrongBookModel.findOne({
      Uid: testUserId,
      title: "编程错题本",
    });

    if (!wrongBook) {
      wrongBook = await WrongBookModel.create({
        Uid: testUserId,
        title: "编程错题本",
        color: "#ff6b6b",
        count: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ 创建测试错题本: 编程错题本");
    } else {
      console.log("📚 找到现有错题本: 编程错题本");
    }

    const wrongBookId = wrongBook._id;

    for (const question of testWrongQuestions) {
      const questionId = new mongoose.Types.ObjectId();

      const newQuestion = new WrongQuestionModel({
        Uid: testUserId,
        wrongBookId: wrongBookId,
        questionId: questionId,
        ...question,
        addedAt: new Date(),
        lastWrongAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newQuestion.save();
      console.log(
        `✅ 添加错题: ${question.stem.text.replace(/<[^>]*>/g, "").substring(0, 30)}...`,
      );
    }

    await WrongBookModel.updateOne(
      { _id: wrongBookId },
      {
        $inc: { count: testWrongQuestions.length },
        $set: { updatedAt: new Date() },
      },
    );

    console.log(`🎉 成功添加 ${testWrongQuestions.length} 条测试错题！`);
  } catch (error) {
    console.error("❌ 添加测试数据失败:", error.message);
  }
}

if (require.main === module) {
  addTestData()
    .then(() => {
      console.log("🎯 脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 脚本执行失败:", error);
      process.exit(1);
    });
}

module.exports = { addTestData };
