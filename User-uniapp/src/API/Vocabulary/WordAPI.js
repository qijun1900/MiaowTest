/**
 * @description  播放单词读音
    美音 king 发音（点击链接）：
    @URl http://dict.youdao.com/dictvoice?type=0&audio=king
    
    英音 king 发音（点击链接）：
    @URl http://dict.youdao.com/dictvoice?type=1&audio=king
 * @param {string} word - 单词
 * @param {number} type - 0:美音, 1:英音
 */
export function playWordPronunciation(word, type = 0) {
    const audioUrl = `http://dict.youdao.com/dictvoice?type=${type}&audio=${word}`;
    
    // #ifdef H5
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error("播放失败", error);
    });
    // #endif
    
    // #ifdef MP-WEIXIN
    const innerAudioContext = uni.createInnerAudioContext();
    innerAudioContext.src = audioUrl;
    innerAudioContext.onError((error) => {
        console.error("播放失败", error);
    });
    innerAudioContext.play();
    // #endif
}