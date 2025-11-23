/**
 * テキストユーティリティ関数
 */

/**
 * ひらがなをカタカナに変換
 */
export const hiraganaToKatakana = (str: string): string => {
  return str.replace(/[ぁ-ゖ]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) + 0x60);
  });
};

/**
 * カタカナをひらがなに変換
 */
export const katakanaToHiragana = (str: string): string => {
  return str.replace(/[ァ-ヶ]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0x60);
  });
};

/**
 * 検索用にテキストを正規化（ひらがなとカタカナの両方のパターンを生成）
 */
export const normalizeSearchQuery = (query: string): string[] => {
  const normalized = query.trim();
  if (!normalized) return [];

  const patterns: string[] = [normalized];
  
  // ひらがなが含まれている場合はカタカナ版も追加
  if (/[ぁ-ゖ]/.test(normalized)) {
    patterns.push(hiraganaToKatakana(normalized));
  }
  
  // カタカナが含まれている場合はひらがな版も追加
  if (/[ァ-ヶ]/.test(normalized)) {
    patterns.push(katakanaToHiragana(normalized));
  }

  // 重複を除去
  return Array.from(new Set(patterns));
};

/**
 * テキストが検索クエリに一致するかチェック（ひらがな・カタカナ互換）
 */
export const matchesSearchQuery = (text: string, query: string): boolean => {
  if (!query.trim()) return true;
  
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedText = text.toLowerCase();
  
  // 直接一致
  if (normalizedText.includes(normalizedQuery)) return true;
  
  // ひらがな・カタカナ変換版でチェック
  const queryPatterns = normalizeSearchQuery(normalizedQuery);
  const textHiragana = katakanaToHiragana(normalizedText);
  const textKatakana = hiraganaToKatakana(normalizedText);
  
  return queryPatterns.some(pattern => {
    const patternHiragana = katakanaToHiragana(pattern);
    const patternKatakana = hiraganaToKatakana(pattern);
    
    return textHiragana.includes(patternHiragana) ||
           textKatakana.includes(patternKatakana) ||
           normalizedText.includes(pattern);
  });
};

