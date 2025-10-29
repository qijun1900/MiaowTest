<script>
export default {
	onLaunch: function () {
		//#ifdef MP-WEIXIN
		wx.cloud.init()
		//#endif
	},


}
</script>

<style>
/*每个页面公共css */
uni-modal {
	z-index: 19999 !important;
}
</style>
