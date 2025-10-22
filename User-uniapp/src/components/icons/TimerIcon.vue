<template>
    <!-- 图标来自https://uiverse.io -->
  <view class="loader">
    <view class="wrapper">
      <view class="catContainer">
        <!-- 猫身体 - 使用图片替代SVG -->
        <view class="catbody" :style="{ width: (160 * size) + 'rpx', height: (160 * size) + 'rpx' }">
          <!-- H5环境使用SVG，小程序使用图片 -->
          <!-- #ifdef H5 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 733 673"
            class="cat-svg"
          >
            <path
              fill="#212121"
              d="M111.002 139.5C270.502 -24.5001 471.503 2.4997 621.002 139.5C770.501 276.5 768.504 627.5 621.002 649.5C473.5 671.5 246 687.5 111.002 649.5C-23.9964 611.5 -48.4982 303.5 111.002 139.5Z"
            ></path>
            <path fill="#212121" d="M184 9L270.603 159H97.3975L184 9Z"></path>
            <path fill="#212121" d="M541 0L627.603 150H454.397L541 0Z"></path>
          </svg>
          <!-- #endif -->
          
          <!-- #ifdef MP-WEIXIN -->
          <image 
            class="cat-image" 
            :style="{ width: (160 * size) + 'rpx', height: (160 * size) + 'rpx' }"
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA3MzMgNjczIj4KICA8cGF0aCBmaWxsPSIjMjEyMTIxIiBkPSJNMTExLjAwMiAxMzkuNUMyNzAuNTAyIC0yNC41MDAxIDQ3MS41MDMgMi40OTk3IDYyMS4wMDIgMTM5LjVDNzcwLjUwMSAyNzYuNSA3NjguNTA0IDYyNy41IDYyMS4wMDIgNjQ5LjVDNDczLjUgNjcxLjUgMjQ2IDY4Ny41IDExMS4wMDIgNjQ5LjVDLTIzLjk5NjQgNjExLjUgLTQ4LjQ5ODIgMzAzLjUgMTExLjAwMiAxMzkuNVoiPjwvcGF0aD4KICA8cGF0aCBmaWxsPSIjMjEyMTIxIiBkPSJNMTg0IDlMMjcwLjYwMyAxNTlIOTcuMzk3NUwxODQgOVoiPjwvcGF0aD4KICA8cGF0aCBmaWxsPSIjMjEyMTIxIiBkPSJNNTQxIDBMNjI3LjYwMyAxNTBINDU0LjM5N0w1NDEgMFoiPjwvcGF0aD4KPC9zdmc+"
          />
          <!-- #endif -->
        </view>
        
        <!-- 猫尾巴 - 使用图片替代SVG -->
        <view class="tail" :style="{ width: (34 * size) + 'rpx', height: (120 * size) + 'rpx' }">
          <!-- #ifdef H5 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 158 564"
            class="tail-svg"
          >
            <path
              fill="#191919"
              d="M5.97602 76.066C-11.1099 41.6747 12.9018 0 51.3036 0V0C71.5336 0 89.8636 12.2558 97.2565 31.0866C173.697 225.792 180.478 345.852 97.0691 536.666C89.7636 553.378 73.0672 564 54.8273 564V564C16.9427 564 -5.4224 521.149 13.0712 488.085C90.2225 350.15 87.9612 241.089 5.97602 76.066Z"
            ></path>
          </svg>
          <!-- #endif -->
          
          <!-- #ifdef MP-WEIXIN -->
          <image 
            class="tail-image" 
            :style="{ width: (34 * size) + 'rpx', height: (120 * size) + 'rpx' }"
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAxNTggNTY0Ij4KICA8cGF0aCBmaWxsPSIjMTkxOTE5IiBkPSJNNS45NzYwMiA3Ni4wNjZDLTExLjEwOTkgNDEuNjc0NyAxMi45MDE4IDAgNTEuMzAzNiAwVjBDNzEuNTMzNiAwIDg5Ljg2MzYgMTIuMjU1OCA5Ny4yNTY1IDMxLjA4NjZDMTczLjY5NyAyMjUuNzkyIDE4MC40NzggMzQ1Ljg1MiA5Ny4wNjkxIDUzNi42NjZDODkuNzYzNiA1NTMuMzc4IDczLjA2NzIgNTY0IDU0LjgyNzMgNTY0VjU2NEMxNi45NDI3IDU2NCAtNS40MjI0IDUyMS4xNDkgMTMuMDcxMiA0ODguMDg1QzkwLjIyMjUgMzUwLjE1IDg3Ljk2MTIgMjQxLjA4OSA1Ljk3NjAyIDc2LjA2NloiPjwvcGF0aD4KPC9zdmc+"
          />
          <!-- #endif -->
        </view>
        
        <!-- Z字睡眠符号 -->
        <view class="text" :style="{ width: (100 * size) + 'rpx', margin: `0rpx 0rpx ${200 * size}rpx ${240 * size}rpx` }">
          <text class="bigzzz" :style="{ fontSize: (50 * size) + 'rpx', marginLeft: (20 * size) + 'rpx' }">Z</text>
          <text class="zzz" :style="{ fontSize: (30 * size) + 'rpx' }">Z</text>
        </view>
      </view>
      
      <!-- 墙壁线条 - 使用图片替代SVG -->
      <view class="wallContainer" :style="{ marginTop: (20 * size) + 'rpx' }">
        <view class="wall" :style="{ width: (600 * size) + 'rpx', height: (150 * size) + 'rpx' }">
          <!-- #ifdef H5 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 500 126"
            class="wall-svg"
          >
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="3"
              x2="450"
              y1="3"
              x1="50"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="85"
              x2="400"
              y1="85"
              x1="100"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="122"
              x2="375"
              y1="122"
              x1="125"
            ></line>
            <line stroke-width="6" stroke="#7C7C7C" y2="43" x2="500" y1="43"></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="1.99391"
              x2="115.5"
              y1="43.0061"
              x1="115.5"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="2.00002"
              x2="189"
              y1="43.0122"
              x1="189"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="2.00612"
              x2="262.5"
              y1="43.0183"
              x1="262.5"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="2.01222"
              x2="336"
              y1="43.0244"
              x1="336"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="2.01833"
              x2="409.5"
              y1="43.0305"
              x1="409.5"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="43"
              x2="153"
              y1="84.0122"
              x1="153"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="43"
              x2="228"
              y1="84.0122"
              x1="228"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="43"
              x2="303"
              y1="84.0122"
              x1="303"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="43"
              x2="378"
              y1="84.0122"
              x1="378"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="84"
              x2="192"
              y1="125.012"
              x1="192"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="84"
              x2="267"
              y1="125.012"
              x1="267"
            ></line>
            <line
              stroke-width="6"
              stroke="#7C7C7C"
              y2="84"
              x2="342"
              y1="125.012"
              x1="342"
            ></line>
          </svg>
          <!-- #endif -->
          
          <!-- #ifdef MP-WEIXIN -->
          <image 
            class="wall-image" 
            :style="{ width: (600 * size) + 'rpx', height: (150 * size) + 'rpx' }"
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA1MDAgMTI2Ij4KICA8bGluZSBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZT0iIzdDN0M3QyIgeTI9IjMiIHgyPSI0NTAiIHkxPSIzIiB4MT0iNTAiPjwvbGluZT4KICA8bGluZSBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZT0iIzdDN0M3QyIgeTI9Ijg1IiB4Mj0iNDAwIiB5MT0iODUiIHgxPSIxMDAiPjwvbGluZT4KICA8bGluZSBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZT0iIzdDN0M3QyIgeTI9IjEyMiIgeDI9IjM3NSIgeTE9IjEyMiIgeDE9IjEyNSI+PC9saW5lPgogIDxsaW5lIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlPSIjN0M3QzdDIiB5Mj0iNDMiIHgyPSI1MDAiIHkxPSI0MyI+PC9saW5lPgogIDxsaW5lIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlPSIjN0M3QzdDIiB5Mj0iMS45OTM5MSIgeDI9IjExNS41IiB5MT0iNDMuMDA2MSIgeDE9IjExNS41Ij48L2xpbmU+CiAgPGxpbmUgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2U9IiM3QzdDN0MiIHkyPSIyLjAwMDAyIiB4Mj0iMTg5IiB5MT0iNDMuMDEyMiIgeDE9IjE4OSI+PC9saW5lPgogIDxsaW5lIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlPSIjN0M3QzdDIiB5Mj0iMi4wMDYxMiIgeDI9IjI2Mi41IiB5MT0iNDMuMDE4MyIgeDE9IjI2Mi41Ij48L2xpbmU+CiAgPGxpbmUgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2U9IiM3QzdDN0MiIHkyPSIyLjAxMjIyIiB4Mj0iMzM2IiB5MT0iNDMuMDI0NCIgeDE9IjMzNiI+PC9saW5lPgogIDxsaW5lIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlPSIjN0M3QzdDIiB5Mj0iMi4wMTgzMyIgeDI9IjQwOS41IiB5MT0iNDMuMDMwNSIgeDE9IjQwOS41Ij48L2xpbmU+CiAgPGxpbmUgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2U9IiM3QzdDN0MiIHkyPSI0MyIgeDI9IjE1MyIgeTE9Ijg0LjAxMjIiIHgxPSIxNTMiPjwvbGluZT4KICA8bGluZSBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZT0iIzdDN0M3QyIgeTI9IjQzIiB4Mj0iMjI4IiB5MT0iODQuMDEyMiIgeDE9IjIyOCI+PC9saW5lPgogIDxsaW5lIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlPSIjN0M3QzdDIiB5Mj0iNDMiIHgyPSIzMDMiIHkxPSI4NC4wMTIyIiB4MT0iMzAzIj48L2xpbmU+CiAgPGxpbmUgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2U9IiM3QzdDN0MiIHkyPSI0MyIgeDI9IjM3OCIgeTE9Ijg0LjAxMjIiIHgxPSIzNzgiPjwvbGluZT4KICA8bGluZSBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZT0iIzdDN0M3QyIgeTI9Ijg0IiB4Mj0iMTkyIiB5MT0iMTI1LjAxMiIgeDE9IjE5MiI+PC9saW5lPgogIDxsaW5lIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlPSIjN0M3QzdDIiB5Mj0iODQiIHgyPSIyNjciIHkxPSIxMjUuMDEyIiB4MT0iMjY3Ij48L2xpbmU+CiAgPGxpbmUgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2U9IiM3QzdDN0MiIHkyPSI4NCIgeDI9IjM0MiIgeTE9IjEyNS4wMTIiIHgxPSIzNDIiPjwvbGluZT4KPC9zdmc+"
          />
          <!-- #endif -->
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  size: {
    type: Number,
    default: 1
  }
})
</script>

<style scoped>
  .loader {
    width: fit-content;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .wrapper {
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .catContainer {
    width: 100%;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  
  .cat-svg {
    width: 100%;
    height: 100%;
  }
  
  .cat-image {
    width: 100%;
    height: 100%;
  }
  
  .tail {
    position: absolute;
    top: 50%;
    animation: tail 0.5s ease-in infinite alternate-reverse;
    /* 微信小程序兼容性处理 */
    /* #ifdef MP-WEIXIN */
    transform-origin: center top;
    /* #endif */
    /* #ifndef MP-WEIXIN */
    transform-origin: top;
    /* #endif */
  }
  
  .tail-svg {
    width: 100%;
    height: 100%;
  }
  
  .tail-image {
    width: 100%;
    height: 100%;
  }
  
  /* 微信小程序动画兼容性处理 */
  /* #ifdef MP-WEIXIN */
  @keyframes tail {
    0% {
      transform: rotate(60deg);
    }
    50% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(-20deg);
    }
  }
  /* #endif */
  
  /* #ifndef MP-WEIXIN */
  @keyframes tail {
    0% {
      transform: rotateZ(60deg);
    }
    50% {
      transform: rotateZ(0deg);
    }
    100% {
      transform: rotateZ(-20deg);
    }
  }
  /* #endif */
  
  .wallContainer {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .wall-svg {
    width: 100%;
    height: 100%;
  }
  
  .wall-image {
    width: 100%;
    height: 100%;
  }
  
  .text {
    display: flex;
    flex-direction: column;
    position: absolute;
  }
  
  .zzz {
    color: black;
    font-weight: 700;
    animation: zzz 2s linear infinite;
  }
  
  .bigzzz {
    color: black;
    font-weight: 700;
    animation: zzz 2.3s linear infinite;
  }
  
  @keyframes zzz {
    0% {
      color: transparent;
    }
    50% {
      color: black;
    }
    100% {
      color: transparent;
    }
  }
</style>
