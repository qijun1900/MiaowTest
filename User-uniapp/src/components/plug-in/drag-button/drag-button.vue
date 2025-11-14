<template>
	<view>
		<view
			id="_drag_button"
			class="drag"
			:style="'left: ' + left + 'px; top:' + top + 'px;'"
			@touchstart="touchstart"
			@touchmove.stop.prevent="touchmove"
			@touchend="touchend"
			@click.stop.prevent="click"
			:class="{transition: isDock && !isMove }">
			
			<text v-if="!icon && !iconType" class="drag-text">{{ text }}</text>
			<uni-icons 
				v-else-if="iconType" 
				:type="iconType" 
				:size="iconSize || 30" color="#fff">
			</uni-icons>
			<image 
				v-else-if="icon" 
				:src="icon" 
				class="drag-image" 
				mode="aspectFit">
			</image>
		</view>
		
		<!-- 弹出菜单 -->
		<view v-if="popMenu && showMenu" 
			class="pop-menu" 
			:class="[`horizontal-${horizontal}`, `vertical-${vertical}`, `direction-${direction}`]"
			:style="getMenuStyle()">
			<view 
				v-for="(item, index) in content" 
				:key="index" 
				class="menu-item"
				@click.stop="handleMenuItemClick(item, index)">
				<text 
					v-if="!item.icon && !item.iconType" 
					class="menu-text">{{ item.text }}
				</text>
				<uni-icons 
					v-else-if="item.iconType" 
					:type="item.iconType" 
					:size="item.iconSize || 27" color="#fff">
				</uni-icons>
				<image 
					v-else-if="item.icon" 
					:src="item.icon" 
					class="menu-image" 
					mode="aspectFit">
				</image>
			</view>
		</view>
		
		<!-- 遮罩层，用于点击关闭菜单 -->
		<view 
			v-if="popMenu && showMenu" 
			class="menu-mask" 
			@click.stop="closeMenu">
		</view>
	</view>
</template>

<script>
	export default {
		name: 'drag-button',
		props: {
			isDock:{
				type: Boolean,
				default: false
			},
			existTabBar:{
				type: Boolean,
				default: false
			},
			bottomOffset: {
				type: Number,
				default: 10
			},
			// 新增属性
			pattern: {
				type: Object,
				default: () => ({})
			},
			horizontal: {// 水平对齐方式，可选值为 'left' 或 'right'
				type: String,
				default: 'left'
			},
			vertical: { // 垂直对齐方式，可选值为 'top' 或 'bottom'
				type: String,
				default: 'bottom'
			},
			direction: { // 菜单弹出方向，可选值为 'horizontal'-  或 'vertical'- 
				type: String,
				default: 'horizontal'
			},
			popMenu: { // 是否启用弹出菜单
				type: Boolean,
				default: true
			},
			content: { // 菜单内容，数组形式，每个元素包含 text 和可选的 icon 或 iconType 属性
				type: Array,
				default: () => []
			},
			icon: { // 拖拽按钮图标路径，可选
				type: String,
				default: ''
			},
			iconType: { // 拖拽按钮图标类型，用于uni-icons，可选
				type: String,
				default: ''
			},
			iconSize: { // 拖拽按钮图标大小，可选
				type: Number,
				default: 30
			}
		},
		data() {
			return {
				top:0,
				left:0,
				width: 0,
				height: 0,
				offsetWidth: 0,
				offsetHeight: 0,
				windowWidth: 0,
				windowHeight: 0,
				isMove: true,
				edge: 10,
				text: '按钮',
				showMenu: false // 控制菜单显示/隐藏
			}
		},
		mounted() {
			const sys = uni.getSystemInfoSync();
			
			this.windowWidth = sys.windowWidth;
			this.windowHeight = sys.windowHeight;
			
			// #ifdef APP-PLUS
				this.existTabBar && (this.windowHeight -= 50);
			// #endif
			if (sys.windowTop) {
				this.windowHeight += sys.windowTop;
			}
			
			const query = uni.createSelectorQuery().in(this);
			query.select('#_drag_button').boundingClientRect(data => {
				this.width = data.width;
				this.height = data.height;
				this.offsetWidth = data.width / 2;
				this.offsetHeight = data.height / 2;
				this.left = this.windowWidth - this.width - this.edge;
				this.top = this.windowHeight - this.height - this.bottomOffset;
			}).exec();
		},
		methods: {
			click() {
				// 如果启用了弹出菜单，则切换菜单显示状态
				if (this.popMenu && this.content && this.content.length > 0) {
					this.showMenu = !this.showMenu;
				}
				this.$emit('btnClick');
			},
			touchstart(e) {
				this.$emit('btnTouchstart');
			},
			// 获取菜单样式
			getMenuStyle() {
				let style = {};
				
				// 根据水平对齐方式设置left或right
				if (this.horizontal === 'left') {
					style.left = `${this.left + this.width + 10}px`;
				} else {
					style.right = `${this.windowWidth - this.left + 10}px`;
				}
				
				// 根据垂直对齐方式设置top或bottom
				if (this.vertical === 'top') {
					style.top = `${this.top}px`;
				} else {
					style.bottom = `${this.windowHeight - this.top - this.height}px`;
				}
				
				return style;
			},
			// 处理菜单项点击
			handleMenuItemClick(item, index) {
				this.$emit('menuItemClick', item, index);
				this.closeMenu();
			},
			// 关闭菜单
			closeMenu() {
				this.showMenu = false;
			},
			touchmove(e) {
				// 单指触摸
				if (e.touches.length !== 1) {
					return false;
				}
				
				this.isMove = true;
				
				this.left = e.touches[0].clientX - this.offsetWidth;
				
				let clientY = e.touches[0].clientY - this.offsetHeight;
				// #ifdef H5
					clientY += this.height;
				// #endif
				let edgeBottom = this.windowHeight - this.height - this.edge;

				// 上下触及边界
				if (clientY < this.edge) {
					this.top = this.edge;
				} else if (clientY > edgeBottom) {
					this.top = edgeBottom;
				} else {
					this.top = clientY
				}
				
			},
			touchend(e) {
				if (this.isDock) {
					let edgeRigth = this.windowWidth - this.width - this.edge;
					
					if (this.left < this.windowWidth / 2 - this.offsetWidth) {
						this.left = this.edge;
					} else {
						this.left = edgeRigth;
					}
					
				}
				
				this.isMove = false;
				
				this.$emit('btnTouchend');
			},
		}}
</script>

<style lang="scss">
	.drag {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(21, 134, 255, 0.725);
		box-shadow: 0 0 6upx rgba(0, 0, 0, 0.4);
		color: $uni-text-color-inverse;
		width: 100upx;
		height: 100upx;
		border-radius: 50%;
		font-size: $uni-font-size-sm;
		position: fixed;
		z-index: 999999;
		
		.drag-text {
			font-size: $uni-font-size-sm;
		}
		
		.drag-icon {
			font-size: 40upx;
		}
		
		&.transition {
			transition: left .3s ease,top .3s ease;
		}
	}
	
	// 弹出菜单样式
	.pop-menu {
		position: fixed;
		background-color: rgba(255, 255, 255, 0);
		border-radius: 8upx;
		padding: 10upx;
		z-index: 999998;
		display: flex;
		
		// 水平方向展开
		&.direction-horizontal {
			flex-direction: row;
			
			.menu-item {
				margin: 0 5upx;
			}
		}
		
		// 垂直方向展开
		&.direction-vertical {
			flex-direction: column;
			
			.menu-item {
				margin: 5upx 0;
			}
		}
		
		// 水平对齐方式
		&.horizontal-left {
			left: 0;
		}
		
		&.horizontal-right {
			right: 0;
		}
		
		// 垂直对齐方式
		&.vertical-top {
			top: 0;
		}
		
		&.vertical-bottom {
			bottom: 0;
		}
		
		.menu-item {
			background-color: rgba(25, 159, 255, 0.676);
			border-radius: 50%;
			width: 80upx;
			height: 80upx;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #ffffff;
			
			.menu-text {
				font-size: 24upx;
			}
			
			.menu-image {
				width: 30upx;
				height: 30upx;
			}
			
			&:active {
				background-color: rgba(255, 255, 255, 0.4);
			}
		}
	}
	
	// 遮罩层样式
	.menu-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999997;
	}
</style>
