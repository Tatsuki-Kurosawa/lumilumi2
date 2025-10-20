import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseのURLとanonキーを取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数の検証を強化
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません。.env.localファイルを確認してください。');
  console.error('VITE_SUPABASE_URL:', supabaseUrl || '未設定');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
  
  // 開発環境での警告
  if (import.meta.env.DEV) {
    console.warn('⚠️ 開発環境では.env.localファイルが必要です');
    console.warn('📁 プロジェクトルートに.env.localファイルを作成してください');
    console.warn('🔑 Supabase Dashboardから正しいURLとanon keyを取得してください');
  }
}

// Supabaseクライアントを作成（環境変数が設定されている場合のみ）
let supabase: any = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    console.log('supabaseUrl', supabaseUrl);
    console.log('supabaseAnonKey', supabaseAnonKey);
    supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true
      }
    });
    console.log('✅ Supabaseクライアントが正常に作成されました');
  } else {
    console.error('❌ Supabaseクライアントの作成に失敗しました');
  }
} catch (error) {
  console.error('❌ Supabaseクライアント作成中にエラーが発生:', error);
}

console.log('✅ Supabaseクライアント作成完了');
console.log('クライアントの型:', typeof supabase);
console.log('from関数存在:', typeof supabase.from);
console.log('auth存在:', typeof supabase.auth);

// クライアントの状態を確認する関数
export const isSupabaseReady = (): boolean => {
  console.log('isSupabaseReady内で呼ばれている');
  console.log(supabase);
  console.log(supabaseUrl);
  console.log(supabaseAnonKey);
  console.log(supabase !== null && supabaseUrl && supabaseAnonKey);
  return !!(supabase !== null && supabaseUrl && supabaseAnonKey);
};

// 接続テスト用の関数
export const testSupabaseConnection = async () => {
  if (!isSupabaseReady()) {
    return { 
      success: false, 
      error: 'Supabaseクライアントが初期化されていません。環境変数を確認してください。' 
    };
  }

  try {
    const { data, error } = await supabase.from('universities').select('*').limit(1);
    
    if (error) {
      console.error('Supabase接続エラー:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase接続成功！');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Supabase接続テスト中にエラーが発生:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// データベーススキーマの確認用関数
export const checkDatabaseSchema = async () => {
  if (!isSupabaseReady()) {
    return { 
      success: false, 
      error: 'Supabaseクライアントが初期化されていません。環境変数を確認してください。' 
    };
  }

  try {
    // 新規登録に必要なテーブルの存在確認
    const tables = ['profiles', 'universities', 'posts', 'page_views'];
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
    
    console.log('📊 データベーススキーマ確認結果:', results);
    return { success: true, results };
  } catch (err) {
    console.error('❌ スキーマ確認中にエラーが発生:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// 認証状態の確認用関数
export const checkAuthStatus = async () => {
  if (!isSupabaseReady()) {
    return { 
      success: false, 
      error: 'Supabaseクライアントが初期化されていません。環境変数を確認してください。' 
    };
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('認証状態確認エラー:', error);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      isAuthenticated: !!session,
      user: session?.user || null 
    };
  } catch (err) {
    console.error('❌ 認証状態確認中にエラーが発生:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// 環境変数の状態を確認する関数
export const checkEnvironmentVariables = () => {
  return {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
    isReady: isSupabaseReady(),
    url: supabaseUrl || '未設定',
    key: supabaseAnonKey ? '設定済み' : '未設定'
  };
};

// メインのsupabaseクライアントをエクスポート
export { supabase };