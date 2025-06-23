import postTranslateWorld from '@/API/postTranslateWord';
import { createApp, h, ref } from 'vue';
import { Notify,Icon } from 'vant';
import TranslateIcon from '@/components/icons/TranslateIcon.vue';

export default {
    mounted(el) {
        let lastTouchTime = 0;

        const handleTouchStart = async (event) => {
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastTouchTime;
            
            if (timeDiff < 300) {
                try {
                    const touch = event.touches[0] || event.changedTouches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    const word = getWordAtPoint(element, touch.clientX, touch.clientY);
                    
                    if (word) {
                        const result = await postTranslateWorld(word);
                        if(result.code === 200) {
                            showCustomNotify(`${word}: ${result.data.Aidata}`);
                        } else {
                            console.error('翻译API返回错误:', result);
                        }
                    }
                } catch (error) {
                    console.error('翻译过程中出错:', error);
                }
            }
            
            lastTouchTime = currentTime;
        };

        el._translateTouchHandler = handleTouchStart;
        el.addEventListener('touchstart', handleTouchStart);
    },
    
    unmounted(el) {
        if (el._translateTouchHandler) {
            el.removeEventListener('touchstart', el._translateTouchHandler);
            delete el._translateTouchHandler;
        }
    }
};

function showCustomNotify(message) {
    const show = ref(true);
    const notifyApp = createApp({
        setup() {
            return () => h(Notify, {
                show: show.value,
                color: '#006eff',
                background: '#CFF2FF',
                duration: 4000,
                style: { 
                    position: 'fixed', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }
            }, () => [
                h('div', { 
                    style: 'display: flex; flex-grow:1; justify-content: center; align-items: center;' // 添加flex-grow和居中
                }, [
                    h(TranslateIcon, {
                        size: 18,
                        color: '#5372ff',
                        style: 'margin-right: 8px;'
                    }),
                    h('span', message)
                ]),
                h(Icon, {
                    name: 'cross',
                    style: 'margin-left: 20px;',
                    onClick: () => {
                        show.value = false;
                        notifyApp.unmount();
                        if (document.body.contains(container)) { // 添加存在性检查
                            document.body.removeChild(container);
                        }
                        isRemoved = true; // 标记已清理
                    }
                })
            ])
        }
    });
    
    const container = document.createElement('div');
    document.body.appendChild(container);
    notifyApp.mount(container);
    
    // 新增清理标记
    let isRemoved = false;
    
    setTimeout(() => {
        if (!isRemoved) {
            show.value = false;
            setTimeout(() => {
                notifyApp.unmount();
                if (document.body.contains(container)) { // 添加存在性检查
                    document.body.removeChild(container);
                }
                isRemoved = true;
            }, 500);
        }
    }, 5000);
    
    // 修改关闭按钮点击处理
    h(Icon, {
        name: 'cross',
        style: 'margin-left: 20px;',
        onClick: () => {
            show.value = false;
            notifyApp.unmount();
            if (document.body.contains(container)) { // 添加存在性检查
                document.body.removeChild(container);
            }
            isRemoved = true; // 标记已清理
        }
    })
};

const getWordAtPoint = (element, x, y) => {
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return null;
    range.expand('word');
    return range.toString().trim();
};
