import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

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
  signUp: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<{ error: AuthError | null; autoLogin?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; success?: boolean }>;
  signOut: () => Promise<void>;
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
    // 現在のセッションを取得
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ユーザープロフィールの取得
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('プロフィール取得エラー:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('プロフィール取得中にエラーが発生:', error);
    }
  };



  // サインアップ
  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // プロフィールテーブルにユーザー情報を挿入
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: profileData.username || email.split('@')[0],
              display_name: profileData.display_name || profileData.username || email.split('@')[0],
              university: profileData.university || '東京大学',
              status: profileData.status || 'student',
              bio: profileData.bio || '',
              is_creator: profileData.is_creator || false
            }
          ]);

        if (profileError) {
          console.error('プロフィール作成エラー:', profileError);
          // プロフィール作成に失敗した場合でも、認証ユーザーは作成されている
          // 後でプロフィールを更新できるようにする
        }

        // セッションが作成された場合は自動ログイン
        if (data.session) {
          console.log('✅ 新規登録成功：自動ログイン完了');
          return { error: null, autoLogin: true };
        } else {
          // メール確認が必要な場合
          // ずっとここで401エラーなどが起きていた
          console.log('📧 新規登録成功：メール確認待ち');
          return { 
            error: { 
              message: 'アカウントが作成されました。メールを確認してログインしてください。',
              code: 'EMAIL_CONFIRMATION_REQUIRED'
            } as AuthError,
            autoLogin: false
          };
        }
      }



      return { error: null };
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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('サインアウト中にエラーが発生:', error);
    }
  };

  // プロフィール更新
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: { message: 'ユーザーが認証されていません' } as AuthError };
    }

    try {
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
