<template>
  <view class="fab-tool">
    <view id="toolfab">
      <slot></slot>
    </view>
    <view class="fab-tool-content" :style="placementStyle" id="placementfab">
      <slot name="content" v-if="visible"></slot>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String,
      default: 'auto' // 'auto' | 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'
    }
  },
  data() {
    return {
      placementHeight: '0',
      placementType: ''
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        const { screenWidth } = uni.getSystemInfoSync()

        this.$nextTick(() => {
          let placementWidth = 0
          uni
            .createSelectorQuery()
            .in(this)
            .select('#placementfab')
            .boundingClientRect((res) => {
              this.placementHeight = -res.height + 'px'
              placementWidth = res.width
            })
            .exec()
          // 开启自动模式后
          if (this.placement == 'auto') {
            uni
              .createSelectorQuery()
              .in(this)
              .select('#toolfab')
              .boundingClientRect((res) => {
                let leftRemain = res.left
                let rightRemain = screenWidth - leftRemain
                if (rightRemain > placementWidth) {
                  this.placementType = 'bottom-start'
                } else if (leftRemain > placementWidth) {
                  this.placementType = 'bottom-end'
                } else {
                  this.placementType = 'bottom-center'
                }
              })
              .exec()
          }
        })
      }
    }
  },
  mounted() {
    this.placementType = this.placement
  },
  computed: {
    placementStyle() {
      let position = {}
      switch (this.placementType) {
        case 'top-start':
          position = {
            top: this.placementHeight,
            left: 0
          }
          break
        case 'top-center':
          position = {
            top: this.placementHeight,
            left: '50%',
            transform: 'translateX(-50%)'
          }
          break
        case 'top-end':
          position = {
            top: this.placementHeight,
            right: 0
          }
          break
        case 'bottom-start':
          position = {
            bottom: this.placementHeight,
            left: 0
          }
          break
        case 'bottom-center':
          position = {
            bottom: this.placementHeight,
            left: '50%',
            transform: 'translateX(-50%)'
          }
          break
        case 'bottom-end':
          position = {
            bottom: this.placementHeight,
            right: 0
          }
          break
        default:
          break
      }
      return position
    }
  },
  methods: {
    //
  }
}
</script>

<style lang="scss">
.fab-tool {
  position: relative;

  .fab-tool-content {
    position: absolute;
    z-index: 999;

    background-color: #ffffff;
    box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05), 2px 2px 4px rgba(0, 0, 0, 0.05);
    border-radius: 12rpx;
    box-sizing: border-box;
  }
}
</style>
