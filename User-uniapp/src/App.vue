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
::-webkit-scrollbar {  
    display: none;  
    width: 0 !important;  
    height: 0 !important;  
    -webkit-appearance: none;  
    background: transparent;  
}
</style>
