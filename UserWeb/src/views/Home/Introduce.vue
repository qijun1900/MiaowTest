<template>
  <div class="home-page">
    <header class="hero">
        <div class="cat-anim">
           <LogoIcon size="85"/> 
        </div>
      <div class="title-block">
        <h1 class="main-title">题喵喵|MiaoTest</h1>
        <p class="subtitle">基于AI大模型的智能题库与自主题目练习平台</p>
        <a 
          class="github-link"
          href="https://github.com/qijun1900/MiaoTest"
          target="_blank"
        >
          <span class="iconfont"><GithubIcon/></span> 开源地址 @qijun1900/MiaoTest
        </a>
        <Button
            type="text" 
            size="small" 
            :icon="h(CopyOutlined)"
            @click="Copy(`https://github.com/qijun1900/MiaoTest`)"/>
      </div>
    </header>

    <section class="features">
      <h2>核心功能</h2>
      <ul>
        <li>📚 题库管理与分类</li>
        <li>📃多题型在线考试与错题练习</li>
        <li>🤖AI智能解析，题目一键解答</li>
        <li>🎶批量题库管理与导入</li>
        <li>📱多端适配，移动端友好体验</li>
        <li>🙋‍♀️基于AI大语言模型API实现智能集成，响应速度快</li>
        <li>🚩集成多个热门大语言模型可自由选择对话</li>
      </ul>
    </section>

    <section class="tech">
      <h2>技术架构</h2>
      <div class="tech-list">
        <div class="tech-item">Vue3</div>
        <div class="tech-item">Element Plus</div>
        <div class="tech-item">Node.js + Express</div>
        <div class="tech-item">Vant4</div>
        <div class="tech-item">MongoDB</div>
        <div class="tech-item">AI大模型API</div>
        <div class="tech-item">Ant Design X Vue</div>
        <div class="tech-item">Axios</div>
        <div class="tech-item">Vue Router</div>
        <div class="tech-item">前后端分离架构</div>
        <div class="tech-item">Vite</div>
      </div>
    </section>

    <section class="future">
      <h2>未来计划</h2>
      <ul>
        <li>🎨 题库内容丰富化，包括图片/音频题型</li>
        <li>📱 多端平台适配，使用UniApp重构</li>
        <li>📊 数据可视化分析与报表</li>
        <li>🤖 大模型灵活接入与实现后台AI功能</li>
        <li>🚀 后台重构，提升体验与代码可读性</li>
        <li>🗂 加入更多解题辅助功能优化答题</li>
      </ul>
    </section>

    <footer class="footer">
      <p>©MIT 2025 MiaoTest | <a href="https://github.com/qijun1900/MiaoTest" target="_blank"><span class="iconfont"><GithubIcon/></span>开源地址</a></p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted ,h} from 'vue'
import LogoIcon from '@/components/icons/LogoIcon.vue'
import GithubIcon from '@/components/icons/GithubIcon.vue'
import {  Button } from 'ant-design-vue';
import { CopyOutlined, } from '@ant-design/icons-vue';
import Copy from '@/util/Copy';


// 动画效果
onMounted(() => {
  // 修正选择器为.cat-anim
  const cat = document.querySelector('.cat-anim')
  if (cat) {
    cat.animate(
      [
        { transform: 'rotate(-5deg) scale(1.05)' },
        { transform: 'rotate(5deg) scale(1.1)' },
        { transform: 'rotate(-5deg) scale(1.05)' }
      ],
      {
        duration: 2000,
        iterations: Infinity
      }
    )
  }
})
</script>

<style scoped>

.home-page {
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Arial', sans-serif;
  background: linear-gradient(135deg, #fcfcfc 0%, #e1f0fc 100%);
  min-height: 100vh;
  padding-bottom: 60px;
}
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.8rem 1rem 1.5rem 1rem;
  background: linear-gradient(120deg, #ffe7f5 0%, #e2f1ff 100%);
  border-radius: 0 0 2rem 2rem;
  box-shadow: 0 4px 24px 0 rgba(80,160,250,0.09);
  position: relative;
}

.cat-img {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  box-shadow: 0 4px 12px #fff8, 0 0 0 6px #fff3;
  background: #fff8;
  object-fit: cover;
  transition: transform 0.2s;
}
.title-block {
  text-align: center;
}
.main-title {
  font-size: 2rem;
  margin: 0.0rem 0;
  color: #0657c1;
  letter-spacing: 2px;
  font-weight: bold;
}
.subtitle {
  color: #e574ae;
  margin: 0.1rem 0 0.6rem 0;
  font-size: 1.12rem;
  font-weight: 500;
}
.github-link {
  display: inline-block;
  margin-top: 0.4rem;
  color: #5f6e98;
  text-decoration: none;
  background: #f6f8fb;
  border-radius: 2em;
  padding: 0.3em 1.2em;
  font-size: 1rem;
  box-shadow: 0 2px 8px #c7d0e8a5;
  transition: background 0.2s, color 0.15s;
}
.github-link:hover {
  background: #e6eaf7;
  color: #e574ae;
}

.features, .tech, .future {
  margin: 1.5rem 0.7rem;
  background: #fff;
  border-radius: 1.3rem;
  box-shadow: 0 4px 16px #e4eaf9a8;
  padding: 1.2rem 1rem;
  animation: fadeInUp 1s;
}
.features h2, .tech h2, .future h2 {
  font-size: 1.23rem;
  color: #0871d7;
  margin-bottom: 0.6em;
  font-weight: 600;
}
.features ul, .future ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.features li, .future li {
  margin: 0.65em 0;
  font-size: 1.08rem;
  color: #444;
  display: flex;
  align-items: center;
}
.features li i, .future li::before {
  color: #e574ae;
  margin-right: 0.7em;
  font-size: 1.1em;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}
.tech-item {
  padding: 0.4em 1.2em;
  background: #eaeffd;
  border-radius: 1em;
  color: #245ca7;
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.5em;
  box-shadow: 0 2px 8px #e1eafba8;
}

.footer {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  height: 40px;
  background: #f8fafd;
  color: #888;
  text-align: center;
  font-size: 0.97rem;
  line-height: 40px;
  letter-spacing: 1px;
  border-top: 1px solid #eef3fa;
  z-index: 10;
}
.footer a {
  color: #e574ae;
  text-decoration: none;
}


@media (max-width: 600px) {
  .main-title { font-size: 1.32rem; }
  .subtitle { font-size: 0.99rem; }
  .features, .tech, .future { padding: 0.9rem 0.6rem; }
  .cat-img { width: 78px; height: 78px; }
  .tech-list { gap: 0.3rem; }
  .tech-item { font-size: 0.94rem; padding: 0.3em 0.7em; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(34px);}
  to   { opacity: 1; transform: translateY(0);}
}
.cat-anim {
  animation: float 3s ease-in-out infinite;
  transition: all 0.3s ease;
  cursor: pointer;
}

.cat-anim:hover {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 0 8px rgba(229, 116, 174, 0.4));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}
</style>