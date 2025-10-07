import { supabase } from './supabaseClient';

// PV数カウント機能のサービス
export class PageViewService {
  // PV数を記録
  static async recordPageView(postId: number, userId?: string, ipAddress?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 重複チェック（同じユーザー/IPからの短時間での重複アクセスを防ぐ）
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

      let query = supabase
        .from('page_views')
        .select('*')
        .eq('post_id', postId)
        .gte('viewed_at', fiveMinutesAgo);

      if (userId) {
        query = query.eq('viewer_id', userId);
      } else if (ipAddress) {
        query = query.eq('ip_address', ipAddress);
      }

      const { data: recentViews, error: checkError } = await query;

      if (checkError) {
        return { success: false, error: checkError.message };
      }

      // 最近のPVがある場合は記録しない
      if (recentViews && recentViews.length > 0) {
        return { success: true }; // 重複なので成功として扱う
      }

      // PVを記録
      const { error: insertError } = await supabase
        .from('page_views')
        .insert({
          post_id: postId,
          viewer_id: userId || null,
          ip_address: ipAddress || null,
          user_agent: navigator.userAgent,
          viewed_at: now.toISOString(),
          is_unique: true
        });

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      // postsテーブルのview_countを更新
      const { error: updateError } = await supabase.rpc('increment_view_count', {
        post_id: postId
      });

      if (updateError) {
        console.warn('view_countの更新に失敗:', updateError);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 投稿のPV数を取得
  static async getViewCount(postId: number): Promise<{ count: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', postId)
        .single();

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: data?.view_count || 0 };
    } catch (error) {
      return { count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ユーザーのIPアドレスを取得（簡易版）
  static async getUserIP(): Promise<string | null> {
    try {
      // 実際のIPアドレス取得はサーバーサイドで行う必要があります
      // ここでは簡易的にnullを返します
      return null;
    } catch (error) {
      console.error('IPアドレス取得エラー:', error);
      return null;
    }
  }
}