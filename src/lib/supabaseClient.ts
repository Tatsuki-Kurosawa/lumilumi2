import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseのURLとanonキーを取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数の検証
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません。.env.localファイルを確認してください。');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
}

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 接続テスト用の関数
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('universities').select('count').limit(1);
    
    if (error) {
      console.error('Supabase接続エラー:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase接続成功！');
    return { success: true, data };
  } catch (err) {
    console.error('Supabase接続テスト中にエラーが発生:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// データベーススキーマの確認用関数
export const checkDatabaseSchema = async () => {
  try {
    // 主要なテーブルの存在確認
    const tables = ['universities', 'profiles', 'posts', 'page_views'];
    const results: Record<string, { exists: boolean; error?: string; count?: number }> = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results[table] = { exists: false, error: error.message };
        } else {
          results[table] = { exists: true, count: data?.length || 0 };
        }
      } catch (err) {
        results[table] = { exists: false, error: 'Table not found' };
      }
    }
    
    console.log('データベーススキーマ確認結果:', results);
    return { success: true, results };
  } catch (err) {
    console.error('スキーマ確認中にエラーが発生:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};