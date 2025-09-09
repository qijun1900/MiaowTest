<template>
	<fireword-confetti ref="confettiRef"></fireword-confetti>
</template>
<script setup>
	import FirewordConfetti from './fireword-confetti/fireword-confetti.vue'
	// #ifdef VUE3
	import {
		ref
	} from 'vue';
	// #endif
	// #ifndef VUE3
	import {
		ref
	} from '@vue/composition-api';
	// #endif
	const confettiRef = ref(null)

	const handleShowEffect = (params) => {
		const {
			type
		} = params;
		if (type == 'snow') handleShowSnow()
		else if (type == 'schoolpride') handleShowSchoolpride()
		else if (type == 'fireworks') handleShowFireworks()
		else if (type == 'stars') handleShowStars()
		else if (type == 'realistic') handleShowRealistic()
		else if (type == 'all') {
			handleShowSnow()
			handleShowSchoolpride()
			handleShowFireworks()
			handleShowStars()
			handleShowRealistic()
		}
	}

	function randomInRange(min, max) {
		return Math.random() * (max - min) + min;
	}

	function fire(particleRatio, opts) {
		const count = 200;
		const defaults = {
			origin: {
				y: 0.7
			}
		};
		return (Object.assign({}, defaults, opts, {
			particleCount: Math.floor(count * particleRatio)
		}));
	}

	const handleShowRealistic = () => {
		const fire1 = fire(0.25, {
			spread: 26,
			startVelocity: 55,
			ticks: 100, // 添加这个参数来延长粒子显示时间
		});
		const fire2 = fire(0.2, {
			spread: 60,
			ticks: 100, // 添加这个参数来延长粒子显示时间
		});
		const fire3 = fire(0.35, {
			spread: 100,
			decay: 0.91,
			scalar: 0.8,
			ticks: 100, // 添加这个参数来延长粒子显示时间
		});
		const fire4 = fire(0.1, {
			spread: 120,
			startVelocity: 25,
			decay: 0.92,
			scalar: 1.2,
			ticks: 100, // 添加这个参数来延长粒子显示时间
		});
		const fire5 = fire(0.1, {
			spread: 120,
			startVelocity: 45,
			ticks: 100, // 添加这个参数来延长粒子显示时间
		});
		confettiRef.value.play(fire3);
	}

	const handleShowStars = () => {
		const defaults = {
			spread: 360,
			ticks: 50, // 修改这个值来改变每个粒子的持续时间
			gravity: 0,
			decay: 0.94,
			startVelocity: 30,
			shapes: ['star'],
			colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
		};
	
		function shoot() {
			confettiRef.value.play({
				...defaults,
				particleCount: 40,
				scalar: 1.2,
				shapes: ['star']
			});
	
			confettiRef.value.play({
				...defaults,
				particleCount: 10,
				scalar: 0.85,
				shapes: ['circle']
			});
		}
		setTimeout(shoot, 0);
		setTimeout(shoot, 100); // 可以修改这些延迟时间
		setTimeout(shoot, 200); // 可以添加更多的setTimeout调用来延长效果
	}


	const handleShowFireworks = () => {
		const duration = 3 * 1000; // 修改这里的值（单位：毫秒），从15秒减少到12秒
		const animationEnd = Date.now() + duration;
		const defaults = {
			startVelocity: 30,
			spread: 360,
			ticks: 60, // 也可以修改这个值来改变每个粒子的持续时间
			zIndex: 0
		};
	
		const interval = setInterval(function() {
			const timeLeft = animationEnd - Date.now();
			if (timeLeft <= 0) return clearInterval(interval);
			const particleCount = 50 * (timeLeft / duration);
			confettiRef.value.play(Object.assign({}, defaults, {
				particleCount,
				origin: {
					x: randomInRange(0.1, 0.3),
					y: Math.random() - 0.2
				}
			}));
			confettiRef.value.play(Object.assign({}, defaults, {
				particleCount,
				origin: {
					x: randomInRange(0.7, 0.9),
					y: Math.random() - 0.2
				}
			}));
		}, 250);
	}


	const handleShowSnow = () => {
	    let duration = 4 * 1000; // 修改这里的值（单位：毫秒），从15秒减少到4秒
	    let animationEnd = Date.now() + duration;
	    let skew = 1;
	
		(function frame() {
			let timeLeft = animationEnd - Date.now();
			let ticks = Math.max(200, 500 * (timeLeft / duration));
			skew = Math.max(0.8, skew - 0.001);

			confettiRef.value.play({
				particleCount: 1,
				startVelocity: 0,
				ticks: ticks,
				origin: {
					x: Math.random(),
					y: (Math.random() * skew) - 0.2
				},
				colors: ['#bb0000'],
				shapes: ['circle'],
				gravity: randomInRange(0.4, 0.6),
				scalar: randomInRange(0.4, 1),
				drift: randomInRange(-0.4, 0.4)
			});
			if (timeLeft > 0) setTimeout(frame, 100);
		}());
	}

	const handleShowSchoolpride = () => {
	    const end = Date.now() + (2 * 1000); // 修改这里的值（单位：毫秒），从15秒减少到2秒
	    const colors = ['#bb0000', '#ffffff'];
	    (function frame() {
			confettiRef.value.play({
				particleCount: 2,
				angle: 60,
				spread: 55,
				origin: {
					x: 0
				},
				colors: colors
			});
			confettiRef.value.play({
				particleCount: 2,
				angle: 120,
				spread: 55,
				origin: {
					x: 1
				},
				colors: colors
			});
			if (Date.now() < end) setTimeout(frame, 1000 / 30);
		}());
	}

	defineExpose({
		handleShowEffect
	})
</script>
