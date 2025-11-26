<template>
	<view class="sp-editor" :style="{ '--icon-size': iconSize, '--icon-columns': iconColumns }">
		<view class="sp-editor-toolbar" v-if="!readOnly" @tap="format">
			<!-- 标题栏 -->
			<fab-tool v-if="toolbarList.includes('header')" :visible="curFab == 'header'">
				<view
					:class="formats.header ? 'ql-active' : ''"
					class="iconfont icon-header"
					title="标题"
					data-name="header"
					@click.stop="fabTap('header')"
				></view>
				<template #content>
					<view class="fab-tools" @click.stop="fabTapSub($event, 'header')">
						<view v-for="item in fabTools.header" :key="item.value">
							<view
								v-if="toolbarList.includes(item.name)"
								class="fab-sub"
								:class="[formats.header === item.value ? 'ql-active' : '', item.icon ? 'iconfont' : '', item.icon]"
								:title="item.title"
								data-name="header"
								:data-value="item.value"
							></view>
						</view>
					</view>
				</template>
			</fab-tool>
			<view
				v-if="toolbarList.includes('bold')"
				:class="formats.bold ? 'ql-active' : ''"
				class="iconfont icon-zitijiacu"
				title="加粗"
				data-name="bold"
			></view>
			<view
				v-if="toolbarList.includes('italic')"
				:class="formats.italic ? 'ql-active' : ''"
				class="iconfont icon-zitixieti"
				title="斜体"
				data-name="italic"
			></view>
			<view
				v-if="toolbarList.includes('underline')"
				:class="formats.underline ? 'ql-active' : ''"
				class="iconfont icon-zitixiahuaxian"
				title="下划线"
				data-name="underline"
			></view>
			<view
				v-if="toolbarList.includes('strike')"
				:class="formats.strike ? 'ql-active' : ''"
				class="iconfont icon-zitishanchuxian"
				title="删除线"
				data-name="strike"
			></view>
			<!-- 对齐方式 -->
			<fab-tool v-if="toolbarList.includes('align')" :visible="curFab == 'align'">
				<view
					:class="formats.align ? 'ql-active' : ''"
					class="iconfont icon-zuoyouduiqi"
					title="对齐方式"
					data-name="align"
					@click.stop="fabTap('align')"
				></view>
				<template #content>
					<view class="fab-tools" @click.stop="fabTapSub($event, 'align')">
						<view v-for="item in fabTools.align" :key="item.value">
							<view
								v-if="toolbarList.includes(item.name)"
								class="fab-sub"
								:class="[formats.align === item.value ? 'ql-active' : '', item.icon ? 'iconfont' : '', item.icon]"
								:title="item.title"
								data-name="align"
								:data-value="item.value"
							></view>
						</view>
					</view>
				</template>
			</fab-tool>
			<!-- 行间距 -->
			<fab-tool v-if="toolbarList.includes('lineHeight')" :visible="curFab == 'lineHeight'">
				<view
					:class="formats.lineHeight ? 'ql-active' : ''"
					class="iconfont icon-line-height"
					title="行间距"
					data-name="lineHeight"
					@click.stop="fabTap('lineHeight')"
				></view>
				<template #content>
					<view class="fab-tools" @click.stop="fabTapSub($event, 'lineHeight')">
						<view v-for="item in fabTools.lineHeight" :key="item.value">
							<view
								class="fab-sub"
								:class="[formats.lineHeight === item.value ? 'ql-active' : '', item.icon ? 'iconfont' : '', item.icon]"
								:title="item.title"
								data-name="lineHeight"
								:data-value="item.value"
							>
								{{ item.name }}
							</view>
						</view>
					</view>
				</template>
			</fab-tool>
			<!-- 字间距 -->
			<fab-tool v-if="toolbarList.includes('letterSpacing')" :visible="curFab == 'letterSpacing'">
				<view
					:class="formats.letterSpacing ? 'ql-active' : ''"
					class="iconfont icon-Character-Spacing"
					title="字间距"
					data-name="letterSpacing"
					@click.stop="fabTap('letterSpacing')"
				></view>
				<template #content>
					<view class="fab-tools" @click.stop="fabTapSub($event, 'letterSpacing')">
						<view v-for="item in fabTools.space" :key="item.value">
							<view
								class="fab-sub"
								:class="[
									formats.letterSpacing === item.value ? 'ql-active' : '',
									item.icon ? 'iconfont' : '',
									item.icon
								]"
								:title="item.title"
								data-name="letterSpacing"
								:data-value="item.value"
							>
								{{ item.name }}
							</view>
						</view>
					</view>
				</template>
			</fab-tool>
			<!-- 段前距 -->
			<fab-tool v-if="toolbarList.includes('marginTop')" :visible="curFab == 'marginTop'">
				<view
					:class="formats.marginTop ? 'ql-active' : ''"
					class="iconfont icon-722bianjiqi_duanqianju"
					title="段前距"
					data-name="marginTop"
					@click.stop="fabTap('marginTop')"
				></view>
				<template #content>
					<view class="fab-tools" @click.stop="fabTapSub($event, 'marginTop')">
						<view v-for="item in fabTools.space" :key="item.value">
							<view
								class="fab-sub"
								:class="[formats.marginTop === item.value ? 'ql-active' : '', item.icon ? 'iconfont' : '', item.icon]"
								:title="item.title"
								data-name="marginTop"
								:data-value="item.value"
							>
								{{ item.name }}
							</view>
						</view>
					</view>
				</template>
			</fab-tool>
			<!-- 段后距 -->
			<fab-tool v-if="toolbarList.includes('marginBottom')" :visible="curFab == 'marginBottom'">
				<view
					:class="formats.marginBottom ? 'ql-active' : ''"
					class="iconfont icon-723bianjiqi_duanhouju"
					title="段后距"
					data-name="marginBottom"
					@click.stop="fabTap('marginBottom')"
				></view>
				<template #content>
					<view class="fab-tools" @click.stop="fabTapSub($event, 'marginBottom')">
						<view v-for="item in fabTools.space" :key="item.value">
							<view
								class="fab-sub"
								:class="[
									formats.marginBottom === item.value ? 'ql-active' : '',
									item.icon ? 'iconfont' : '',
									item.icon
								]"
								:title="item.title"
								data-name="marginBottom"
								:data-value="item.value"
							>
								{{ item.name }}
							</view>
						</view>
					</view>
				</template>
			</fab-tool>
			<!-- 字体栏 -->
			<fab-tool v-if="toolbarList.includes('fontFamily')" :visible="curFab == 'fontFamily'">
				<view
					:class="formats.fontFamily ? 'ql-active' : ''"
					class="iconfont icon-font"
					title="字体"
					data-name="fontFamily"
					@click.stop="fabTap('fontFamily')"
				></view>
				<template #content>
					<view class="fab-tools" @click.stop="fabTapSub($event, 'fontFamily')">
						<view v-for="item in fabTools.fontFamily" :key="item.value">
							<view
								class="fab-sub"
								:class="[formats.fontFamily === item.value ? 'ql-active' : '', item.icon ? 'iconfont' : '', item.icon]"
								:title="item.title"
								data-name="fontFamily"
								:data-value="item.value"
							>
								{{ item.name }}
							</view>
						</view>
					</view>
				</template>
			</fab-tool>
			<!-- 字体大小栏 -->
			<fab-tool v-if="toolbarList.includes('fontSize')" :visible="curFab == 'fontSize'">
				<view
					:class="formats.fontSize ? 'ql-active' : ''"
					class="iconfont icon-fontsize"
					title="字号"
					data-name="fontSize"
					@click.stop="fabTap('fontSize')"
				></view>
				<template #content>
					<view class="fab-tools" @click.stop="fabTapSub($event, 'fontSize')">
						<view v-for="item in fabTools.fontSize" :key="item.value">
							<view
								class="fab-sub"
								:class="[formats.fontSize === item.value ? 'ql-active' : '', item.icon ? 'iconfont' : '', item.icon]"
								:title="item.title"
								data-name="fontSize"
								:data-value="item.value"
							>
								{{ item.name }}
							</view>
						</view>
					</view>
				</template>
			</fab-tool>
			<view
				v-if="toolbarList.includes('color')"
				:style="{ color: formats.color ? textColor : 'initial' }"
				class="iconfont icon-text_color"
				title="文字颜色"
				data-name="color"
				:data-value="textColor"
			></view>
			<view
				v-if="toolbarList.includes('backgroundColor')"
				:style="{ color: formats.backgroundColor ? backgroundColor : 'initial' }"
				class="iconfont icon-fontbgcolor"
				title="背景颜色"
				data-name="backgroundColor"
				:data-value="backgroundColor"
			></view>
			<view v-if="toolbarList.includes('date')" class="iconfont icon-date" title="日期" @tap="insertDate"></view>
			<view
				v-if="toolbarList.includes('listCheck')"
				class="iconfont icon--checklist"
				title="待办"
				data-name="list"
				data-value="check"
			></view>
			<view
				v-if="toolbarList.includes('listOrdered')"
				:class="formats.list === 'ordered' ? 'ql-active' : ''"
				class="iconfont icon-youxupailie"
				title="有序列表"
				data-name="list"
				data-value="ordered"
			></view>
			<view
				v-if="toolbarList.includes('listBullet')"
				:class="formats.list === 'bullet' ? 'ql-active' : ''"
				class="iconfont icon-wuxupailie"
				title="无序列表"
				data-name="list"
				data-value="bullet"
			></view>
			<view
				v-if="toolbarList.includes('divider')"
				class="iconfont icon-fengexian"
				title="分割线"
				@click="insertDivider"
			></view>
			<view
				v-if="toolbarList.includes('indentDec')"
				class="iconfont icon-outdent"
				title="减少缩进"
				data-name="indent"
				data-value="-1"
			></view>
			<view
				v-if="toolbarList.includes('indentInc')"
				class="iconfont icon-indent"
				title="增加缩进"
				data-name="indent"
				data-value="+1"
			></view>
			<view
				v-if="toolbarList.includes('scriptSub')"
				:class="formats.script === 'sub' ? 'ql-active' : ''"
				class="iconfont icon-zitixiabiao"
				title="下标"
				data-name="script"
				data-value="sub"
			></view>
			<view
				v-if="toolbarList.includes('scriptSuper')"
				:class="formats.script === 'super' ? 'ql-active' : ''"
				class="iconfont icon-zitishangbiao"
				title="上标"
				data-name="script"
				data-value="super"
			></view>
			<view
				v-if="toolbarList.includes('direction')"
				:class="formats.direction === 'rtl' ? 'ql-active' : ''"
				class="iconfont icon-direction-rtl"
				title="文本方向"
				data-name="direction"
				data-value="rtl"
			></view>
			<view
				v-if="toolbarList.includes('image')"
				class="iconfont icon-charutupian"
				title="图片"
				@tap="insertImage"
			></view>
			<view v-if="toolbarList.includes('video')" class="iconfont icon-video" title="视频" @tap="insertVideo"></view>
			<view
				v-if="toolbarList.includes('link')"
				class="iconfont icon-charulianjie"
				title="超链接"
				@tap="insertLink"
			></view>
			<view v-if="toolbarList.includes('undo')" class="iconfont icon-undo" title="撤销" @tap="undo"></view>
			<view v-if="toolbarList.includes('redo')" class="iconfont icon-redo" title="重做" @tap="redo"></view>
			<view
				v-if="toolbarList.includes('removeFormat')"
				class="iconfont icon-clearedformat"
				title="清除格式"
				@tap="removeFormat"
			></view>
			<view v-if="toolbarList.includes('clear')" class="iconfont icon-shanchu" title="清空" @tap="clear"></view>
			<view v-if="toolbarList.includes('export')" class="iconfont icon-baocun" title="导出" @tap="exportHtml"></view>
		</view>

		<!-- 自定义功能组件 -->
		<!-- 调色板 -->
		<color-picker
			v-if="toolbarList.includes('color') || toolbarList.includes('backgroundColor')"
			ref="colorPickerRef"
			:color="defaultColor"
			@confirm="confirmColor"
		></color-picker>
		<!-- 添加链接的操作弹窗 -->
		<link-edit v-if="toolbarList.includes('link') && !readOnly" ref="linkEditRef" @confirm="confirmLink"></link-edit>
		<view class="sp-editor-wrapper" @longpress="eLongpress">
			<editor
				:id="editorId"
				class="ql-editor editor-container"
				:class="{ 'ql-image-overlay-none': readOnly }"
				show-img-size
				show-img-toolbar
				show-img-resize
				:placeholder="placeholder"
				:read-only="readOnly"
				@statuschange="onStatusChange"
				@ready="onEditorReady"
				@input="onEditorInput"
			></editor>
		</view>
	</view>
</template>

<script>
import ColorPicker from './color-picker.vue'
import LinkEdit from './link-edit.vue'
import FabTool from './fab-tool.vue'
import { addLink, linkFlag } from '../../utils'

export default {
	components: {
		ColorPicker,
		LinkEdit,
		FabTool
	},
	props: {
		// 编辑器id可传入，以便循环组件使用，防止id重复
		editorId: {
			type: String,
			default: 'editor'
		},
		placeholder: {
			type: String,
			default: '写点什么吧 ~'
		},
		// 是否只读
		readOnly: {
			type: Boolean,
			default: false
		},
		// 最大字数限制，-1不限
		maxlength: {
			type: Number,
			default: -1
		},
		// 工具栏配置
		toolbarConfig: {
			type: Object,
			default: () => {
				return {
					keys: [], // 要显示的工具，优先级最大
					excludeKeys: [], // 除这些指定的工具外，其他都显示
					iconSize: '18px', // 工具栏字体大小
					iconColumns: 10 // 工具栏列数
				}
			}
		}
	},
	watch: {
		toolbarConfig: {
			deep: true,
			immediate: true,
			handler(newToolbar) {
				/**
				 * 若工具栏配置中keys存在，则以keys为准
				 * 否则以excludeKeys向toolbarAllList中排查
				 * 若keys与excludeKeys皆为空，则以toolbarAllList为准
				 */
				if (newToolbar.keys?.length > 0) {
					this.toolbarList = newToolbar.keys
				} else {
					this.toolbarList =
						newToolbar.excludeKeys?.length > 0
							? this.toolbarAllList.filter((item) => !newToolbar.excludeKeys.includes(item))
							: this.toolbarAllList
				}
				this.iconSize = newToolbar.iconSize || '18px'
				this.iconColumns = newToolbar.iconColumns || 10
			}
		}
	},
	data() {
		return {
			formats: {},
			curFab: '', // 当前悬浮工具栏
			fabXY: {},
			textColor: '',
			backgroundColor: '',
			curColor: '',
			defaultColor: { r: 0, g: 0, b: 0, a: 1 }, // 调色板默认颜色
			iconSize: '20px', // 工具栏图标字体大小
			iconColumns: 10, // 工具栏列数
			toolbarList: [],
			toolbarAllList: [
				'header', // 标题
				'H1', // 一级标题
				'H2', // 二级标题
				'H3', // 三级标题
				'H4', // 四级标题
				'H5', // 五级标题
				'H6', // 六级标题
				'bold', // 加粗
				'italic', // 斜体
				'underline', // 下划线
				'strike', // 删除线
				'align', // 对齐方式
				'alignLeft', // 左对齐
				'alignCenter', // 居中对齐
				'alignRight', // 右对齐
				'alignJustify', // 两端对齐
				'lineHeight', // 行间距
				'letterSpacing', // 字间距
				'marginTop', // 段前距
				'marginBottom', // 段后距
				'fontFamily', // 字体
				'fontSize', // 字号
				'color', // 文字颜色
				'backgroundColor', // 背景颜色
				'date', // 日期
				'listCheck', // 待办
				'listOrdered', // 有序列表
				'listBullet', // 无序列表
				'indentInc', // 增加缩进
				'indentDec', // 减少缩进
				'divider', // 分割线
				'scriptSub', // 下标
				'scriptSuper', // 上标
				'direction', // 文本方向
				'image', // 图片
				'video', // 视频
				'link', // 超链接
				'undo', // 撤销
				'redo', // 重做
				'removeFormat', // 清除格式
				'clear', // 清空
				'export' // 导出
			],
			fabTools: {
				header: [
					{ title: '一级标题', name: 'H1', value: 1, icon: 'icon-format-header-1' },
					{ title: '二级标题', name: 'H2', value: 2, icon: 'icon-format-header-2' },
					{ title: '三级标题', name: 'H3', value: 3, icon: 'icon-format-header-3' },
					{ title: '四级标题', name: 'H4', value: 4, icon: 'icon-format-header-4' },
					{ title: '五级标题', name: 'H5', value: 5, icon: 'icon-format-header-5' },
					{ title: '六级标题', name: 'H6', value: 6, icon: 'icon-format-header-6' }
				],
				fontFamily: [
					{ title: '宋体', name: '宋', value: '宋体', icon: '' },
					{ title: '黑体', name: '黑', value: '黑体', icon: '' },
					{ title: '楷体', name: '楷', value: '楷体', icon: '' },
					{ title: '仿宋', name: '仿', value: '仿宋', icon: '' },
					{ title: '华文隶书', name: '隶', value: 'STLiti', icon: '' },
					{ title: '华文行楷', name: '行', value: 'STXingkai', icon: '' },
					{ title: '幼圆', name: '圆', value: 'YouYuan', icon: '' }
				],
				fontSize: [
					{ title: '12', name: '12', value: '12px', icon: '' },
					{ title: '14', name: '14', value: '14px', icon: '' },
					{ title: '16', name: '16', value: '16px', icon: '' },
					{ title: '18', name: '18', value: '18px', icon: '' },
					{ title: '20', name: '20', value: '20px', icon: '' },
					{ title: '22', name: '22', value: '22px', icon: '' },
					{ title: '24', name: '24', value: '24px', icon: '' }
				],
				align: [
					{ title: '左对齐', name: 'alignLeft', value: 'left', icon: 'icon-zuoduiqi' },
					{ title: '居中对齐', name: 'alignCenter', value: 'center', icon: 'icon-juzhongduiqi' },
					{ title: '右对齐', name: 'alignRight', value: 'right', icon: 'icon-youduiqi' },
					{ title: '两端对齐', name: 'alignJustify', value: 'justify', icon: 'icon-zuoyouduiqi' }
				],
				lineHeight: [
					{ title: '1倍', name: '1', value: '1', icon: '' },
					{ title: '1.5倍', name: '1.5', value: '1.5', icon: '' },
					{ title: '2倍', name: '2', value: '2', icon: '' },
					{ title: '2.5倍', name: '2.5', value: '2.5', icon: '' },
					{ title: '3倍', name: '3', value: '3', icon: '' }
				],
				// 字间距/段前距/段后距
				space: [
					{ title: '0.5倍', name: '0.5', value: '0.5em', icon: '' },
					{ title: '1倍', name: '1', value: '1em', icon: '' },
					{ title: '1.5倍', name: '1.5', value: '1.5em', icon: '' },
					{ title: '2倍', name: '2', value: '2em', icon: '' },
					{ title: '2.5倍', name: '2.5', value: '2.5em', icon: '' },
					{ title: '3倍', name: '3', value: '3em', icon: '' }
				]
			}
		}
	},
	methods: {
		onEditorReady() {
			uni
				.createSelectorQuery()
				.in(this)
				.select('#' + this.editorId)
				.context((res) => {
					this.editorCtx = res.context
					this.$emit('init', this.editorCtx, this.editorId)
				})
				.exec()
		},
		undo() {
			this.editorCtx.undo()
		},
		redo() {
			this.editorCtx.redo()
		},
		format(e) {
			let { name, value } = e.target.dataset
			if (!name) return
			switch (name) {
				case 'color':
				case 'backgroundColor':
					this.curColor = name
					this.showPicker()
					break
				default:
					this.editorCtx.format(name, value)
					break
			}
		},
		// 悬浮工具点击
		fabTap(fabType) {
			if (this.curFab != fabType) {
				this.curFab = fabType
			} else {
				this.curFab = ''
			}
		},
		// 悬浮工具子集点击
		fabTapSub(e, fabType) {
			this.format(e)
			this.fabTap(fabType)
		},
		showPicker() {
			switch (this.curColor) {
				case 'color':
					this.defaultColor = this.textColor
						? this.$refs.colorPickerRef.hex2Rgb(this.textColor)
						: { r: 0, g: 0, b: 0, a: 1 }
					break
				case 'backgroundColor':
					this.defaultColor = this.backgroundColor
						? this.$refs.colorPickerRef.hex2Rgb(this.backgroundColor)
						: { r: 0, g: 0, b: 0, a: 0 }
					break
			}
			this.$refs.colorPickerRef.open()
		},
		confirmColor(e) {
			switch (this.curColor) {
				case 'color':
					this.textColor = e.hex
					this.editorCtx.format('color', this.textColor)
					break
				case 'backgroundColor':
					this.backgroundColor = e.hex
					this.editorCtx.format('backgroundColor', this.backgroundColor)
					break
			}
		},
		onStatusChange(e) {
			if (e.detail.color) {
				this.textColor = e.detail.color
			}
			if (e.detail.backgroundColor) {
				this.backgroundColor = e.detail.backgroundColor
			}
			this.formats = e.detail
		},
		insertDivider() {
			this.editorCtx.insertDivider()
		},
		clear() {
			uni.showModal({
				title: '清空编辑器',
				content: '确定清空编辑器吗？',
				success: ({ confirm }) => {
					if (confirm) {
						this.editorCtx.clear()
					}
				}
			})
		},
		removeFormat() {
			uni.showModal({
				title: '文本格式化',
				content: '确定要清除所选择部分文本块格式吗？',
				showCancel: true,
				success: ({ confirm }) => {
					if (confirm) {
						this.editorCtx.removeFormat()
					}
				}
			})
		},
		insertDate() {
			const date = new Date()
			const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
			this.editorCtx.insertText({ text: formatDate })
		},
		insertLink() {
			this.$refs.linkEditRef.open()
		},
		/**
		 * 确认添加链接
		 * @param {Object} e { text: '链接描述', href: '链接地址' }
		 */
		confirmLink(e) {
			this.$refs.linkEditRef.close()
			addLink(this.editorCtx, e, () => {
				// 修复添加超链接后，不触发input更新当前最新内容的bug，这里做一下手动更新
				this.editorCtx.getContents({
					success: (res) => {
						this.$emit('input', { html: res.html, text: res.text }, this.editorId)
					}
				})
			})
			this.$emit('addLink', e, this.editorId)
		},
		insertImage() {
			// #ifdef APP-PLUS || H5
			uni.chooseImage({
				// count: 1, // 默认9
				success: (res) => {
					const { tempFiles } = res
					// 将文件和编辑器示例抛出，由开发者自行上传和插入图片
					this.$emit('upinImage', tempFiles, this.editorCtx, this.editorId)
				},
				fail() {
					uni.showToast({
						title: '未授权访问相册权限，请授权后使用',
						icon: 'none'
					})
				}
			})
			// #endif

			// #ifdef MP-WEIXIN
			// 微信小程序从基础库 2.21.0 开始， wx.chooseImage 停止维护，请使用 uni.chooseMedia 代替。
			uni.chooseMedia({
				// count: 1, // 默认9
				mediaType: ['image'],
				success: (res) => {
					// 同上chooseImage处理
					const { tempFiles } = res
					this.$emit('upinImage', tempFiles, this.editorCtx, this.editorId)
				},
				fail() {
					uni.showToast({
						title: '未授权访问相册权限，请授权后使用',
						icon: 'none'
					})
				}
			})
			// #endif
		},
		insertVideo() {
			uni.chooseVideo({
				sourceType: ['camera', 'album'],
				success: (res) => {
					const { tempFilePath } = res
					// 将文件和编辑器示例抛出，由开发者自行上传和插入图片
					this.$emit('upinVideo', tempFilePath, this.editorCtx, this.editorId)
				},
				fail() {
					uni.showToast({
						title: '未授权访问媒体权限，请授权后使用',
						icon: 'none'
					})
				}
			})
		},
		onEditorInput(e) {
			// 注意不要使用getContents获取html和text，会导致重复触发onStatusChange从而失去toolbar工具的高亮状态
			// 复制粘贴的时候detail会为空，此时应当直接return
			if (Object.keys(e.detail).length <= 0) return
			const { html, text } = e.detail
			// 识别到标识立即return
			if (text.indexOf(linkFlag) !== -1) return

			const maxlength = parseInt(this.maxlength)
			const textStr = text.replace(/[ \t\r\n]/g, '')
			if (textStr.length > maxlength && maxlength != -1) {
				uni.showModal({
					content: `超过${maxlength}字数啦~`,
					confirmText: '确定',
					showCancel: false,
					success: () => {
						this.$emit('overMax', { html, text }, this.editorId)
					}
				})
			} else {
				this.$emit('input', { html, text }, this.editorId)
			}
		},
		// 导出
		exportHtml() {
			this.editorCtx.getContents({
				success: (res) => {
					this.$emit('exportHtml', res.html, this.editorId)
				}
			})
		},
		eLongpress() {
			/**
			 * 微信小程序官方editor的长按事件有bug，需要重写覆盖，不需做任何逻辑，可见下面小程序社区问题链接
			 * @tutorial https://developers.weixin.qq.com/community/develop/doc/000c04b3e1c1006f660065e4f61000
			 */
		}
	}
}
</script>

<style lang="scss">
@import '@/uni_modules/sp-editor/icons/editor-icon.css';
@import '@/uni_modules/sp-editor/icons/custom-icon.css';

.sp-editor {
	height: 100%;
	display: flex;
	flex-direction: column;
	position: relative;
}

.sp-editor-toolbar {
	box-sizing: border-box;
	padding: calc(var(--icon-size) / 4) 0;
	border-bottom: 1px solid #e4e4e4;
	font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
	display: grid;
	grid-template-columns: repeat(var(--icon-columns), 1fr);
}

.iconfont {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: calc(var(--icon-size) * 1.8);
	cursor: pointer;
	font-size: var(--icon-size);
}

.sp-editor-wrapper {
	flex: 1;
	overflow: hidden;
	position: relative;
}

.editor-container {
	padding: 8rpx 16rpx;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	font-size: 16px;
	line-height: 1.5;
}

.ql-image-overlay-none {
	::v-deep .ql-image-overlay {
		pointer-events: none;
		opacity: 0;
	}
}

::v-deep .ql-editor.ql-blank::before {
	font-style: normal;
	color: #cccccc;
}

::v-deep .ql-container {
	min-height: unset;
}

.ql-active {
	color: #66ccff;
}

.fab-tools {
	display: flex;
	padding: 0 10rpx;
	box-sizing: border-box;

	.fab-sub {
		width: auto;
		height: auto;
		margin: 10rpx;
	}
}
</style>
