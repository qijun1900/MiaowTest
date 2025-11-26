<template>
  <view class="link-edit-container" v-if="showPopup">
    <view class="link-edit">
      <view class="title">添加链接</view>
      <view class="edit">
        <view class="description">
          链接描述：
          <input v-model="descVal" type="text" class="input" placeholder="请输入链接描述" />
        </view>
        <view class="address">
          链接地址：
          <input v-model="addrVal" type="text" class="input" placeholder="请输入链接地址" />
        </view>
      </view>
      <view class="control">
        <view class="cancel" @click="close">取消</view>
        <view class="confirm" @click="onConfirm">确认</view>
      </view>
    </view>
    <view class="mask"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showPopup: false,
      descVal: '',
      addrVal: ''
    }
  },
  methods: {
    open() {
      this.showPopup = true
      this.$emit('open')
    },
    close() {
      this.showPopup = false
      this.descVal = ''
      this.addrVal = ''
      this.$emit('close')
    },
    onConfirm() {
      if (!this.descVal) {
        uni.showToast({
          title: '请输入链接描述',
          icon: 'none'
        })
        return
      }
      if (!this.addrVal) {
        uni.showToast({
          title: '请输入链接地址',
          icon: 'none'
        })
        return
      }
      this.$emit('confirm', {
        text: this.descVal,
        href: this.addrVal
      })
      this.close()
    }
  }
}
</script>

<style lang="scss">
.link-edit-container {
  .link-edit {
    width: 80%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #ffffff;
    box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05), 2px 2px 4px rgba(0, 0, 0, 0.05);
    border-radius: 12rpx;
    box-sizing: border-box;
    z-index: 999;
    font-size: 14px;

    .title {
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .edit {
      padding: 24rpx;
      border-top: 1px solid #eeeeee;
      border-bottom: 1px solid #eeeeee;
      box-sizing: border-box;

      .input {
        flex: 1;
        padding: 4px;
        font-size: 14px;
        border: 1px solid #eeeeee;
        border-radius: 8rpx;

        .uni-input-placeholder {
          color: #dddddd;
        }
      }

      .description {
        display: flex;
        align-items: center;
      }
      .address {
        display: flex;
        align-items: center;
        margin-top: 24rpx;
      }
    }

    .control {
      height: 80rpx;
      display: flex;
      cursor: pointer;

      .cancel {
        flex: 1;
        color: #dd524d;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .confirm {
        border-left: 1px solid #eeeeee;
        flex: 1;
        color: #007aff;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.05);
    z-index: 998;
  }
}
</style>
