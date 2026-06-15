// #ifdef VUE3
import { computed, onMounted, ref } from 'vue';
// #endif
// #ifndef VUE3
import { computed, onMounted, ref } from '@vue/composition-api';
// #endif

export function getRect(selector: string, options: any = {}) {
	const typeDefault = 'boundingClientRect'
	const { context, type = typeDefault } = options
	return new Promise<any>((resolve, reject) => {
		const dom = uni.createSelectorQuery().in(context).select(selector);
		const result = (rect) => {
			if (rect) resolve(rect)
			else reject()
		}
		if (type == typeDefault) {
			dom[type](result).exec()
		} else {
			dom[type]({
				node: true,
				size: true,
				rect: true
			}, result).exec()
		}
	});
};

export function useCanvas(selector: string, options) {
	const { context } = options
	const canCanvas2d = getCanUseCanvas2d()
	const canvas = ref<any>()
	onMounted(() => {
		if (canCanvas2d) {
			getRect(selector, { context, type: 'fields' }).then((res) => {
				if (res) {
					const { pixelRatio } = uni.getSystemInfoSync()
					const { bottom, width, height, left, node } = res
					node.width = width * pixelRatio
					node.height = height * pixelRatio

					const context = node.getContext('2d')
					context.scale(pixelRatio, pixelRatio)
					canvas.value = {
						bottom, width, height, left,
						getContext: () => context,
						requestAnimationFrame: node.requestAnimationFrame,
						cancelAnimationFrame: node.cancelAnimationFrame,
					}
				}
			})
		} else {
			getRect(selector, { context }).then(res => {
				if (res) {
					const ctx = uni.createCanvasContext(selector.replace('#', ''), context)
					const { bottom, width, height, left } = res
					canvas.value = {
						bottom, width, height, left,
						getContext: () => uni.createCanvasContext(selector.replace('#', ''), context),
					}
				}
			})
		}
	})
	return computed(() => canvas.value)
}

export function getCanUseCanvas2d() {
	// #ifdef H5
	return false
	// #endif
	// #ifndef H5
	return true
	// #endif

}