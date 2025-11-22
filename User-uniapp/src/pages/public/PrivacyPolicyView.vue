<template>
  <view class="privacy-policy-container">
    <view class="header">
      <text class="title">题喵喵小程序隐私保护指引</text>
    </view>
    
    <view class="content">
      <view class="section">
        <text class="section-title">本指引是题喵喵小程序开发者 （以下简称"开发者"）为处理你的个人信息而制定。</text>
      </view>

      <view class="section">
        <text class="section-header">开发者处理的信息</text>
        <text class="section-content">根据法律规定，开发者仅处理实现小程序功能所必要的信息。</text>
      </view>

      <view class="section">
        <text class="section-header">开发者将在获取你的明示同意后，收集你的手机号，用途是【在必要时和用户联系】</text>
      </view>

      <view class="section">
        <text class="section-header">开发者收集你的邮箱，用于在必要时和用户联系。</text>
      </view>

      <view class="section">
        <text class="section-header">未成年人保护</text>
        <text class="section-content">
          根据相关法律法规的规定，若你是14周岁以下的未成年人，你需要和你的监护人共同仔细阅读本指引，并在征得监护人明示同意后继续使用小程序服务。开发者将根据相关法律法规的规定及本指引内容，处理经监护人同意而收集的未成年人用户信息，并通过【本指引你的权益部分】披露的内容保障未成年人在个人信息处理活动中的各项权利。
        </text>
      </view>

      <view class="section">
        <text class="section-header">你的权益</text>
        <text class="section-content">
          关于你的个人信息，你可以通过以下方式与开发者联系，行使查阅、复制、更正、删除等法定权利。
        </text>
        <text class="section-content">
          若你在小程序中注册了账号，你可以通过以下方式与开发者联系，申请注销你在小程序中使用的账号。在受理你的申请后，开发者承诺在十五个工作日内完成核查和处理，并按照法律法规要求处理你的相关信息。
        </text>
        <text class="contact-info">电话: 18756810208</text>
      </view>

      <view class="section">
        <text class="section-header">开发者对信息的存储</text>
        <text class="section-content">
          开发者承诺，除法律法规另有规定外，开发者对你的信息的保存期限应当为实现处理目的所必要的最短时间。
        </text>
      </view>

      <view class="section">
        <text class="section-header">信息的使用规则</text>
        <text class="section-content">
          开发者将会在本指引所明示的用途内使用收集的信息
        </text>
        <text class="section-content">
          如开发者使用你的信息超出本指引目的或合理范围，开发者必须在变更使用目的或范围前，再次以公告方式告知并征得你的明示同意。
        </text>
      </view>

      <view class="section">
        <text class="section-header">信息对外提供</text>
        <text class="section-content">
          开发者承诺，不会主动共享或转让你的信息至任何第三方，如存在确需共享或转让时，开发者应当直接征得或确认第三方征得你的单独同意。
        </text>
        <text class="section-content">
          开发者承诺，不会对外公开披露你的信息，如必须公开披露时，开发者应当向你告知公开披露的目的、披露信息的类型及可能涉及的信息，并征得你的单独同意。
        </text>
      </view>

      <view class="section">
        <text class="section-content">
          你认为开发者未遵守上述约定，或有其他的投诉建议、或未成年人个人信息保护相关问题，可通过以下方式与开发者联系；或者向微信进行投诉。
        </text>
        <text class="contact-info">电话: 18756810208</text>
      </view>

      <view class="section">
        <text class="update-date">更新日期：2025-11-22</text>
      </view>

      <view class="section">
        <text class="section-content">
          本小程序已对用户的信息处理进行了逐一、如实的说明，并保证如有变更会及时更新指引。
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
// 隐私政策页面
</script>

<style scoped>
.privacy-policy-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
  padding: 30rpx 0;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1.4;
}

.content {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eeeeee;
}

.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  line-height: 1.6;
  display: block;
  margin-bottom: 20rpx;
}

.section-header {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  line-height: 1.5;
  display: block;
  margin-bottom: 16rpx;
}

.section-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  display: block;
  margin-bottom: 16rpx;
  text-align: justify;
}

.contact-info {
  font-size: 28rpx;
  color: #007aff;
  font-weight: 500;
  line-height: 1.5;
  display: block;
  margin: 20rpx 0;
  text-align: center;
  background-color: #f0f7ff;
  padding: 16rpx;
  border-radius: 8rpx;
}

.update-date {
  font-size: 26rpx;
  color: #999999;
  text-align: center;
  display: block;
  margin: 20rpx 0;
  font-weight: 500;
}
</style>