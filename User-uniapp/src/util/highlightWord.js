/**
 * 生成单词的所有可能变形形式
 * @param {string} word - 原始单词
 * @returns {string[]} 变形形式数组
 */
const generateWordForms = (word) => {
  if (!word || word.length < 2) return [word];
  
  const forms = new Set([word]);
  const lowerWord = word.toLowerCase();
  
  // 1. 基础后缀
  forms.add(lowerWord + 's');
  forms.add(lowerWord + 'es');
  forms.add(lowerWord + 'ed');
  forms.add(lowerWord + 'ing');
  forms.add(lowerWord + 'er');
  forms.add(lowerWord + 'est');
  forms.add(lowerWord + 'd');
  
  // 2. 去e加ing/ed (make -> making, love -> loved)
  if (lowerWord.endsWith('e') && !lowerWord.endsWith('ee') && !lowerWord.endsWith('ie')) {
    const withoutE = lowerWord.slice(0, -1);
    forms.add(withoutE + 'ing');
    forms.add(withoutE + 'ed');
  }
  
  // 3. y变i加ed/es (study -> studied, study -> studies)
  if (lowerWord.endsWith('y')) {
    const withoutY = lowerWord.slice(0, -1) + 'i';
    forms.add(withoutY + 'ed');
    forms.add(withoutY + 'es');
  }
  
  // 4. 双写最后一个字母加ing/ed (run -> running, stop -> stopped)
  // 规则：辅音字母+单个元音字母+单个辅音字母结尾
  if (lowerWord.length >= 3) {
    const vowels = 'aeiou';
    const lastChar = lowerWord.slice(-1);
    const secondLast = lowerWord.slice(-2, -1);
    const thirdLast = lowerWord.slice(-3, -2);
    
    if (!vowels.includes(lastChar) && 
        vowels.includes(secondLast) && 
        !vowels.includes(thirdLast) &&
        !lowerWord.endsWith('e')) {
      forms.add(lowerWord + lastChar + 'ing');
      forms.add(lowerWord + lastChar + 'ed');
      forms.add(lowerWord + lastChar + 'er');
    }
  }
  
  // 5. ie变y加ing (die -> dying)
  if (lowerWord.endsWith('ie')) {
    forms.add(lowerWord.slice(0, -2) + 'ying');
  }
  
  return Array.from(forms);
};

const highlightWord = {
  /**
   * 格式化例句，高亮目标单词及其变形形式
   * @param {string} sentence - 例句文本
   * @param {string} word - 需要高亮的单词
   * @returns {Array<{text: string, highlight: boolean}>} 分割后的文本片段数组，每个片段包含文本和高亮标记
   */
  formatExampleSentence(sentence, word) {
    if (!sentence || !word) return [{ text: sentence || '', highlight: false }];
    
    const wordForms = generateWordForms(word);
    const pattern = wordForms.map(w => `\\b${w}\\b`).join('|');
    const regex = new RegExp(pattern, 'gi');
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(sentence)) !== null) {
      parts.push({ text: sentence.slice(lastIndex, match.index), highlight: false });
      parts.push({ text: match[0], highlight: true });
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < sentence.length) {
      parts.push({ text: sentence.slice(lastIndex), highlight: false });
    }
    return parts;
  }
};

export default highlightWord;
