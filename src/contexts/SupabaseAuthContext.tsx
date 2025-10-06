import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, testSupabaseConnection } from '../lib/supabaseClient';

// ユーザープロフィールの型定義
interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  university: string;
  status: 'student' | 'ob' | 'og';
  avatar_url?: string;
  bio?: string;
  is_creator: boolean;
  created_at: string;
}

// 認証コンテキストの型定義
interface SupabaseAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; autoLogin?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; success?: boolean }>;
  signOut: () => Promise<void>;
  registerProfile: (profileData: Partial<UserProfile>) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  checkEmailConfirmation: (email: string) => Promise<{ error: AuthError | null; success?: boolean; message?: string }>;
  refreshAuthState: () => Promise<{ error: AuthError | null; success?: boolean; user?: User | null }>;
}

// コンテキストの作成
const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

// カスタムフック
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

// プロバイダーのプロパティ
interface SupabaseAuthProviderProps {
  children: ReactNode;
}

// プロバイダーコンポーネント
// Appで呼ばれる
export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // セッションとユーザーの監視
  useEffect(() => {
    // useEffect実行回数をカウント
    if (!window.authEffectCounter) window.authEffectCounter = 0;
    window.authEffectCounter++;
    console.log(`🔄 SupabaseAuthContext useEffect実行回数: ${window.authEffectCounter}`);

    // 現在のセッションを取得
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log("useEffect,getSession内で呼ばれている");
        await fetchProfile(session.user.id);
        console.log('fetchProfile完了');
      }

      // JWTのexpクレーム確認
      // if (session?.access_token)
      // {
      //   const payload = session.access_token.split('.')[1];
      //   const decodedPayload = JSON.parse(atob(payload));
      //   console.log('decodedPayload', decodedPayload);
      //   console.log('decodedPayload.exp', decodedPayload.exp);
      //   const expiry = new Date(decodedPayload.exp * 1000);
      //   console.log('expiry', expiry.toISOString());
      // }
      
      setLoading(false);
    };

    getSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('onAuthStateChange内で呼ばれているevent', event);
        // console.log('onAuthStateChange内で呼ばれているsession情報', session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("useEffect,async内で呼ばれている");
          console.log("session.user.id", session.user.id);
          await fetchProfile(session.user.id);
          console.log('fetchProfile後のprofile', profile);
        } else {
          console.log('sessionがnullの場合に発動した');
          setProfile(null);
        }

        // JWTのexpクレーム確認
        // if (session?.access_token)
        // {
        //   const payload = session.access_token.split('.')[1];
        //   const decodedPayload = JSON.parse(atob(payload));
        //   console.log('decodedPayload', decodedPayload);
        //   console.log('decodedPayload.exp', decodedPayload.exp);
        //   const expiry = new Date(decodedPayload.exp * 1000);
        //   console.log('expiry', expiry.toISOString());
        // }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ログイン処理のために作る必要あり
  // ユーザープロフィールの取得
  const fetchProfile = async (userId: string) => {
    try {
      console.log('fetchProfile呼ばれた');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      console.log('取得完了');
      
      if (error) {
        // プロフィールが存在しない場合は正常な状態として扱う
        if (error.code === 'PGRST116') { // No rows found
          console.log('プロフィール未設定状態 - ユーザーID:', userId);
          setProfile(null);
          return;
        }
        console.error('プロフィール取得エラー:', error);
        return;
      }
      
      console.log('dataの値', data);
      if (data) {
        console.log('fetchProfile内でプロフィール取得成功:', data);
        setProfile(data);
        return;
      }

      return;
    } catch (error) {
      console.error('プロフィール取得中にエラーが発生:', error);
      return;
    }
  };

  // サインアップ
  // 発生したエラーを知らせるのみ
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmation`
        }
      });

      if (error) {
        return { error };
      } else {
        return { error: null };
      }

    } catch (error) {
      console.error('サインアップ中にエラーが発生:', error);
      return { error: { message: 'サインアップ中にエラーが発生しました' } as AuthError };
    }
  };

  // サインイン
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('email:', email);
      console.log('password:', password);

      if (error) {
        return { error };
      }

      if (data.session) {
        console.log('✅ ログイン成功');
        // プロフィール情報を取得
        await fetchProfile(data.user.id);
        return { error: null, success: true };
      }

      return { error: null };
    } catch (error) {
      console.error('サインイン中にエラーが発生:', error);
      return { error: { message: 'サインイン中にエラーが発生しました' } as AuthError };
    }
  };

  // サインアウト
  const signOut = async () => {
    try {
      console.log('signOut呼ばれた');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('サインアウト中にエラーが発生:', error);
    }
  };

  // 初期プロフィール設定
  const registerProfile = async (profileData: Partial<UserProfile>) => {
    try {

      // const { error } = await supabase.from('profiles').insert(profileData);

      // if (error) {
      //   return { error };
      // }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const accessToken = session?.access_token;

      const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': anonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ fetch エラーレスポンス:", errorText);
        // ステータスコード別のエラー分析
        if (response.status === 401) {
          return { error: { message: '認証エラー: アクセストークンが無効です' } as AuthError };
        } else if (response.status === 403) {
          return { error: { message: '権限エラー: プロフィール作成権限がありません' } as AuthError };
        } else if (response.status === 422) {
          return { error: { message: `データエラー: ${errorText}` } as AuthError };
        } else {
          return { error: { message: `HTTPエラー ${response.status}: ${errorText}` } as AuthError };
        }
      }

      const responseText = await response.text();
      console.log("✅ fetch 成功レスポンス:", responseText);
      // 成功時：ローカル状態を更新
      if (profileData && user) {
        const newProfile: UserProfile = {
          id: user.id,
          username: profileData.username || '',
          display_name: profileData.display_name || '',
          university: profileData.university || '',
          status: profileData.status || 'student',
          avatar_url: profileData.avatar_url || '',
          bio: profileData.bio || '',
          is_creator: profileData.is_creator || false,
          created_at: user.created_at
        };
        console.log('✅ プロフィール登録成功 - ローカル状態を更新:', newProfile);
        setProfile(newProfile);
      }
      return { error: null };

    } catch (error) {
      console.error('❌ プロフィール登録中にエラーが発生:', error);
      console.error('❌ エラーの型:', typeof error);
      console.error('❌ エラーの詳細:', error instanceof Error ? error.message : String(error));
      console.error('❌ エラーのスタック:', error instanceof Error ? error.stack : 'スタック情報なし');

      const errorMessage = error instanceof Error ? error.message : 'プロフィール登録中にエラーが発生しました';
      return { error: { message: errorMessage } as AuthError };
    }
  };

  // プロフィール更新
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: { message: 'ユーザーが認証されていません' } as AuthError };
    }

    try {
      // ここに注目
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error: { message: error.message } as AuthError };
      }

      // ローカル状態を更新
      if (profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error: null };
    } catch (error) {
      console.error('プロフィール更新中にエラーが発生:', error);
      return { error: { message: 'プロフィール更新中にエラーが発生しました' } as AuthError };
    }
  };

  // パスワードリセット
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      return { error };
    } catch (error) {
      console.error('パスワードリセット中にエラーが発生:', error);
      return { error: { message: 'パスワードリセット中にエラーが発生しました' } as AuthError };
    }
  };

  // メール確認状態の確認
  const checkEmailConfirmation = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        return { error: { message: error.message } as AuthError };
      }

      return { error: null, success: true, message: '確認メールを再送信しました' };
    } catch (error) {
      console.error('メール確認状態確認中にエラーが発生:', error);
      return { error: { message: 'メール確認状態の確認中にエラーが発生しました' } as AuthError };
    }
  };

  // 認証状態の確認とプロフィール同期
  const refreshAuthState = async () => {
    try {
      // LocalStrageなどにあるセッション情報をとってくる
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('セッション取得エラー:', error);
        return { error: { message: error.message } as AuthError };
      }

      if (session?.user) {
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id);
        return { error: null, success: true, user: session.user };
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        return { error: null, success: false, user: null };
      }
    } catch (error) {
      console.error('認証状態更新中にエラーが発生:', error);
      return { error: { message: '認証状態の更新中にエラーが発生しました' } as AuthError };
    }
  };

  const value: SupabaseAuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    registerProfile,
    updateProfile,
    resetPassword,
    checkEmailConfirmation,
    refreshAuthState
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
