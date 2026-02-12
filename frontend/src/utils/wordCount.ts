/**
 * Count words in text (supports both English and Chinese).
 *
 * For English text: counts words separated by whitespace
 * For Chinese text: counts characters (excluding whitespace and punctuation)
 * For mixed text: combines both methods
 *
 * This implementation matches the backend logic in backend/modules/work/utils.py
 *
 * @param text - The text to count
 * @returns Total word/character count
 *
 * @example
 * countWords("Hello world") // returns 2
 * countWords("你好世界") // returns 4
 * countWords("Hello 世界") // returns 3
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) {
    return 0;
  }

  // Remove extra whitespace
  const trimmed = text.trim();

  // Count Chinese characters (CJK Unified Ideographs)
  const chineseChars = trimmed.match(/[\u4e00-\u9fff]/g);
  const chineseCount = chineseChars ? chineseChars.length : 0;

  // Remove Chinese characters and count English words
  const textWithoutChinese = trimmed.replace(/[\u4e00-\u9fff]/g, '');
  const englishWords = textWithoutChinese.split(/\s+/).filter(word => word.length > 0);
  const englishCount = englishWords.length;

  // Total count
  return chineseCount + englishCount;
}
