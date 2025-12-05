import { http } from '../../util/http.js';

/**
 * 生成UUID
 * @returns {string} 生成的UUID
 */
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * 生成当前UTC时间戳（秒）
 * @returns {string} 当前UTC时间戳
 */
const getCurrentTimestamp = () => {
    return Math.floor(Date.now() / 1000).toString();
};

/**
 * 计算输入文本的处理值
 * @param {string} input - 待处理的文本
 * @returns {string} 处理后的文本
 */
const getInput = (input) => {
    if (!input) return '';
    const len = input.length;
    return len <= 20 ? input : `${input.substring(0, 10)}${len}${input.substring(len - 10)}`;
};

/**
 * SHA-256算法实现
 * @param {string} message - 待哈希的消息
 * @returns {string} SHA-256哈希值（十六进制）
 */
const sha256 = (message) => {
    // 常量定义
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    // 辅助函数
    const rotateRight = (n, b) => (n >>> b) | (n << (32 - b));
    const modularAdd = (...args) => args.reduce((a, b) => (a + b) & 0xffffffff, 0);

    // 预处理消息
    const bytes = [];
    for (let i = 0; i < message.length; i++) {
        const code = message.charCodeAt(i);
        bytes.push(code >>> 8, code & 0xff);
    }

    // 添加填充
    bytes.push(0x80);
    while ((bytes.length * 8) % 512 !== 448) {
        bytes.push(0x00);
    }

    // 添加消息长度
    const length = message.length * 8;
    for (let i = 7; i >= 0; i--) {
        bytes.push((length >>> (i * 8)) & 0xff);
    }

    // 初始化哈希值
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    // 处理每个512位块
    for (let i = 0; i < bytes.length; i += 64) {
        const w = [];
        for (let j = 0; j < 16; j++) {
            w[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16) | (bytes[i + j * 4 + 2] << 8) | bytes[i + j * 4 + 3];
        }

        for (let j = 16; j < 64; j++) {
            const s0 = rotateRight(w[j - 15], 7) ^ rotateRight(w[j - 15], 18) ^ (w[j - 15] >>> 3);
            const s1 = rotateRight(w[j - 2], 17) ^ rotateRight(w[j - 2], 19) ^ (w[j - 2] >>> 10);
            w[j] = modularAdd(w[j - 16], s0, w[j - 7], s1);
        }

        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

        for (let j = 0; j < 64; j++) {
            const S1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = modularAdd(h, S1, ch, K[j], w[j]);
            const S0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = modularAdd(S0, maj);

            h = g;
            g = f;
            f = e;
            e = modularAdd(d, temp1);
            d = c;
            c = b;
            b = a;
            a = modularAdd(temp1, temp2);
        }

        h0 = modularAdd(h0, a);
        h1 = modularAdd(h1, b);
        h2 = modularAdd(h2, c);
        h3 = modularAdd(h3, d);
        h4 = modularAdd(h4, e);
        h5 = modularAdd(h5, f);
        h6 = modularAdd(h6, g);
        h7 = modularAdd(h7, h);
    }

    // 转换为十六进制字符串
    const hash = [h0, h1, h2, h3, h4, h5, h6, h7].map(n => {
        const hex = n.toString(16).padStart(8, '0');
        return hex;
    }).join('');

    return hash;
};

/**
 * 生成签名
 * @param {string} appKey - 应用ID
 * @param {string} input - 处理后的待翻译文本
 * @param {string} salt - 随机字符串
 * @param {string} curtime - 当前UTC时间戳
 * @param {string} appSecret - 应用密钥
 * @returns {string} 生成的签名
 */
const generateSign = (appKey, input, salt, curtime, appSecret) => {
    const str = `${appKey}${input}${salt}${curtime}${appSecret}`;
    return sha256(str);
};

/**
 * 文本翻译API
 * @param {string} text - 待翻译文本
 * @param {string} from - 源语言（默认auto，自动检测）
 * @param {string} to - 目标语言（默认zh-CHS，中文）
 * @returns {Promise} 返回翻译结果
 */
export const translateText = async (text, from = 'auto', to = 'zh-CHS') => {
    try {
        if (!text) {
            throw new Error("缺少待翻译文本");
        }
        
        // 应用ID和密钥，需要从有道开放平台获取并配置
        const appKey = '7978759ae9fb8db3'; // 请替换为实际的应用ID
        const appSecret = 'kTDbSn41zQyl5tW4R6YlfFURXAk7L80E'; // 请替换为实际的应用密钥
        
        const salt = generateUUID();
        const curtime = getCurrentTimestamp();
        const input = getInput(text);
        const sign = generateSign(appKey, input, salt, curtime, appSecret);
        
        return await http({
            url: '/youdao/api',
            method: 'POST',
            data: {
                q: text,
                from,
                to,
                appKey,
                salt,
                sign,
                signType: 'v3',
                curtime
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    } catch (error) {
        console.error("翻译失败", error);
        throw error;
    }
};

/**
 * 英语翻译成中文
 * @param {string} text - 待翻译的英语文本
 * @returns {Promise} 返回中文翻译结果
 */
export const translateEnToZh = async (text) => {
    return await translateText(text, 'en', 'zh-CHS');
};