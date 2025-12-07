import { supabase } from './supabaseClient';

/**
 * 大学名をuniversitiesテーブルに追加（存在しない場合のみ）
 * @param universityName 大学名
 * @returns エラー情報
 */
export const ensureUniversityExists = async (
  universityName: string
): Promise<{ error: string | null }> => {
  if (!universityName || !universityName.trim()) {
    return { error: '大学名が空です' };
  }

  try {
    // 既に存在するか確認
    const { data: existing, error: checkError } = await supabase
      .from('universities')
      .select('id, name')
      .eq('name', universityName.trim())
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116は「データが見つからない」エラーなので無視
      console.error('大学名確認エラー:', checkError);
      return { error: checkError.message };
    }

    // 既に存在する場合は何もしない
    if (existing) {
      return { error: null };
    }

    // 存在しない場合は追加
    // 最大のdisplay_orderを取得して、その次に設定
    const { data: maxOrderData } = await supabase
      .from('universities')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextDisplayOrder = maxOrderData?.display_order 
      ? maxOrderData.display_order + 1 
      : 1;

    const { error: insertError } = await supabase
      .from('universities')
      .insert({
        name: universityName.trim(),
        display_order: nextDisplayOrder
      });

    if (insertError) {
      // UNIQUE制約違反の場合は既に存在している（競合状態）
      if (insertError.code === '23505') {
        console.log('大学名は既に存在します（競合状態）:', universityName);
        return { error: null };
      }
      console.error('大学名追加エラー:', insertError);
      return { error: insertError.message };
    }

    console.log('✅ 大学名を追加しました:', universityName);
    return { error: null };
  } catch (error) {
    console.error('大学名確保中にエラーが発生:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

