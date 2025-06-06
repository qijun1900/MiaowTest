import { showNotify } from 'vant';
import useClipboard from 'vue-clipboard3';
const { toClipboard } = useClipboard()

const Copy = async (text) => {
    try {
        await toClipboard(text);
        showNotify({ 
            type: 'success',
            message: '您已复制成功☺️' 
        });
    } catch (e) {
        console.error(e);
        console.error('复制失败');
    }
};
export default Copy;
