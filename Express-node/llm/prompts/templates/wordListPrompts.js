/**
 * 单词本工具相关 Prompt 模板
 */

/**
 * AI 查询单词 — 返回音标、释义、例句（JSON 格式）
 * @param {string} word - 要查询的英文单词
 * @returns {string}
 */
const wordLookupPrompt = (word) =>
  `You are an English-Chinese dictionary. For the word "${word}", return ONLY a JSON object. No markdown, no code block, no extra text outside the JSON.

The JSON must have exactly 3 fields:
1. "phonetic" — IPA phonetic transcription only (e.g. "/rʌn/"). Nothing else.
2. "meaning" — Chinese definitions only, grouped by part of speech. No phonetic, no example, no English.
3. "example" — One natural English example sentence using the word's most common meaning.

Rules for "meaning":
- Start each part of speech on a new line: "n. 释义" then "v. 释义" etc.
- Use concise Chinese translations, like a dictionary entry
- Use "；" to separate multiple senses under the same part of speech
- DO NOT include phonetic symbols, English words, or example sentences in this field

Example for "run":
{"phonetic":"/rʌn/","meaning":"v. 跑；运行；经营\nn. 奔跑；路程；一段时间","example":"I run five kilometers every morning."}

Example for "abandon":
{"phonetic":"/əˈbændən/","meaning":"v. 放弃；抛弃\nn. 放纵；无拘无束","example":"He abandoned his plan to travel abroad."}

If not found: {"phonetic":"","meaning":"未找到该单词","example":""}`;

/**
 * AI 从文本中提取单词 — 返回单词+释义数组（JSON 格式）
 * @param {string} text - 用户输入的文本（自动截取前 3000 字符）
 * @returns {string}
 */
const wordExtractPrompt = (text) =>
  `You are an English vocabulary extractor. Extract all important English words from the following text. For each word, provide a concise Chinese meaning.
Return ONLY a JSON array (no markdown, no code block) with this format:
[{"word":"example","meaning":"示例"}]

Rules:
- Extract only meaningful vocabulary words (nouns, verbs, adjectives, adverbs)
- Skip common stop words (the, is, at, which, etc.)
- Skip proper nouns and numbers
- Maximum 50 words
- Use base/lemma form (e.g., "abandon" not "abandoned")

Text:
${text.slice(0, 3000)}`;

/**
 * AI 生成单词扩展信息（Markdown 格式）
 * @param {string} word - 要分析的英文单词
 * @param {string} [type='all'] - 生成类型: 'all' | 'mnemonic' | 'root' | 'synonyms'
 * @returns {string}
 */
const wordDetailPrompt = (word, type = "all") => {
  const base = `You are an English vocabulary teacher. For the word "${word}", `;
  const suffix = `\nFormat your response in Markdown. Be concise but helpful. Use Chinese for explanations. Do NOT wrap your response in a code block (no triple backticks). Just return the raw Markdown directly.`;

  const parts = {
    all: `${base}provide the following:

1. **助记法** - A creative mnemonic or memory trick to remember this word (Chinese explanation)
2. **词根分析** - Break down the word into roots, prefixes, suffixes and explain each part (Chinese explanation)
3. **近义词辨析** - List 3-5 English words with similar meanings. For each: the word, its Chinese meaning, and how it differs from "${word}" in usage
4. **形近词** - List 3-5 English words that look similar in spelling but have different meanings. For each: the word, its Chinese meaning, and a tip to distinguish it from "${word}"${suffix}`,
    mnemonic: `${base}provide a creative mnemonic or memory trick to help remember this word. Use Chinese for the explanation. Be creative and memorable.${suffix}`,
    root: `${base}break down the word into its roots, prefixes, and suffixes. Explain the origin and meaning of each part in Chinese. Show how the parts combine to form the word's meaning.${suffix}`,
    synonyms: `${base}list 3-5 English words that have similar meanings. For each word, provide:
1. The word itself
2. Its Chinese meaning
3. A brief explanation of how it differs from "${word}" in usage, formality, or context

Use this format for each synonym:
**word** — 中文释义
区别：与"${word}"的用法差异说明

Focus on practical differences that help a learner choose the right word in context.${suffix}`,
    similar: `${base}list 3-5 English words that look similar in spelling to "${word}" but have different meanings. These are words that learners often confuse or mix up. For each word, provide:
1. The word itself
2. Its Chinese meaning
3. A tip to help distinguish it from "${word}" (e.g. a mnemonic, different root, or context clue)

Use this format for each word:
**word** — 中文释义
区分：如何与"${word}"区分

Focus on words that are commonly confused due to similar spelling.${suffix}`,
  };

  return parts[type] || parts.all;
};

module.exports = {
  wordLookupPrompt,
  wordExtractPrompt,
  wordDetailPrompt,
};
