<template>
	<view v-if="!isDestroy" class="canvas-content">
		<canvas class="canvas-item" canvas-id="canvasId" id="canvasId" type="2d"></canvas>
	</view>
</template>
<script setup lang="ts">
	// #ifdef VUE3
	import {
		getCurrentInstance,
		watch,
		onUnmounted
	} from 'vue';
	// #endif
	// #ifndef VUE3
	import {
		getCurrentInstance,
		watch,
		onUnmounted
	} from '@vue/composition-api';
	// #endif
	import {
		useCanvas
	} from './useCanvas';
	import {
		Confetti
	} from './confetti';
	const emits = defineEmits(['done']);
	const app = getCurrentInstance();
	const canvas = useCanvas(`#canvasId`, {
		context: app.proxy
	})
	let isDestroy = false
	let confetti = null
	watch(canvas, (v) => {
		if (v) {
			confetti = new Confetti(canvas.value, {
				resize: false,
				done: emits('done')
			})
		}
	}, {
		immediate: true
	});
	onUnmounted(() => {
		isDestroy = true
		confetti = null
	})
	defineExpose({
		play: (options) => confetti.play(options)
	})
</script>
<style lang="scss">
	.canvas-content {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		pointer-events: none;
		
		.canvas-item{
			width: 100%;
			height: 100%;
		}
	}
</style>
