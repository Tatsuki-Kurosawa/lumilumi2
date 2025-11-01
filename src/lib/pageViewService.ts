import { supabase } from './supabaseClient';

// 期間別のPV数を取得する型定義
export interface ViewCountsByPeriod {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
}

// PV数カウント機能のサービス
export class PageViewService {
  // PV数を記録
  static async recordPageView(
    postId: number,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; error?: string; isUnique: boolean }> {
    try {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
      const userAgentValue = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null);

      // 重複チェック（10分以内の重複アクセスを防ぐ）
      let query = supabase
        .from('page_views')
        .select('*')
        .eq('post_id', postId)
        .gte('viewed_at', tenMinutesAgo);

      if (userId) {
        // ログインユーザーの場合：viewer_idで重複チェック
        query = query.eq('viewer_id', userId);
      } else {
        // 未ログインユーザーの場合：IPアドレス + User Agentで重複チェック
        if (ipAddress) {
          query = query.eq('ip_address', ipAddress);
        }
        if (userAgentValue) {
          query = query.eq('user_agent', userAgentValue);
        }
      }

      const { data: recentViews, error: checkError } = await query;

      if (checkError) {
        return { success: false, error: checkError.message, isUnique: false };
      }

      // 10分以内のPVがある場合は重複として扱う
      if (recentViews && recentViews.length > 0) {
        return { success: true, isUnique: false }; // 重複なので成功として扱うが、isUnique=false
      }

      // 新しいPVを記録（is_unique = true）
      const { error: insertError } = await supabase
        .from('page_views')
        .insert({
          post_id: postId,
          viewer_id: userId || null,
          ip_address: ipAddress || null,
          user_agent: userAgentValue || null,
          viewed_at: now.toISOString(),
          is_unique: true
        });

      if (insertError) {
        return { success: false, error: insertError.message, isUnique: false };
      }

      return { success: true, isUnique: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', isUnique: false };
    }
  }

  // 投稿のPV数を取得（post_view_countsテーブルからtotal_viewsを取得）
  static async getViewCount(postId: number): Promise<{ count: number; error?: string }> {
    try {
      const { data: viewCountData, error: viewCountError } = await supabase
        .from('post_view_counts')
        .select('total_views')
        .eq('post_id', postId)
        .single();

      if (viewCountError) {
        // レコードが存在しない場合は0を返す（新規投稿など）
        if (viewCountError.code === 'PGRST116') {
          return { count: 0 };
        }
        console.error('PV数取得エラー:', viewCountError);
        return { count: 0, error: viewCountError.message };
      }

      return { count: viewCountData?.total_views || 0 };
    } catch (error) {
      console.error('PV数取得中にエラーが発生:', error);
      return { count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 複数の投稿のPV数を一括取得（post_view_countsテーブルからtotal_viewsを取得）
  static async getViewCountsForPosts(postIds: number[]): Promise<Map<number, number>> {
    const viewCountsMap = new Map<number, number>();
    
    if (postIds.length === 0) {
      return viewCountsMap;
    }

    try {
      const { data: viewCountsData, error: viewCountsError } = await supabase
        .from('post_view_counts')
        .select('post_id, total_views')
        .in('post_id', postIds);

      if (viewCountsError) {
        console.error('PV数一括取得エラー:', viewCountsError);
        // エラー時は全て0を設定
        postIds.forEach(id => viewCountsMap.set(id, 0));
        return viewCountsMap;
      }

      // Mapに変換
      (viewCountsData || []).forEach((item: any) => {
        viewCountsMap.set(item.post_id, item.total_views || 0);
      });

      // データが存在しない投稿は0を設定（新規投稿など）
      postIds.forEach(id => {
        if (!viewCountsMap.has(id)) {
          viewCountsMap.set(id, 0);
        }
      });

      return viewCountsMap;
    } catch (error) {
      console.error('PV数一括取得中にエラーが発生:', error);
      postIds.forEach(id => viewCountsMap.set(id, 0));
      return viewCountsMap;
    }
  }

  // 特定の投稿の期間別PV数を取得
  static async getViewCountsByPeriod(postId: number): Promise<{ counts: ViewCountsByPeriod | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_view_counts')
        .select('daily_views, weekly_views, monthly_views, total_views')
        .eq('post_id', postId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // レコードが存在しない場合は全て0を返す
          return { counts: { daily: 0, weekly: 0, monthly: 0, total: 0 } };
        }
        console.error('期間別PV数取得エラー:', error);
        return { counts: null, error: error.message };
      }

      return {
        counts: {
          daily: data?.daily_views || 0,
          weekly: data?.weekly_views || 0,
          monthly: data?.monthly_views || 0,
          total: data?.total_views || 0
        }
      };
    } catch (error) {
      console.error('期間別PV数取得中にエラーが発生:', error);
      return { counts: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 複数の投稿の期間別PV数を一括取得
  static async getViewCountsByPeriodForPosts(
    postIds: number[],
    period: 'daily' | 'weekly' | 'monthly' | 'total' = 'total'
  ): Promise<Map<number, number>> {
    const viewCountsMap = new Map<number, number>();
    
    if (postIds.length === 0) {
      return viewCountsMap;
    }

    try {
      const fieldName = period === 'daily' ? 'daily_views' :
                        period === 'weekly' ? 'weekly_views' :
                        period === 'monthly' ? 'monthly_views' :
                        'total_views';

      const { data, error } = await supabase
        .from('post_view_counts')
        .select(`post_id, ${fieldName}`)
        .in('post_id', postIds);

      if (error) {
        console.error(`期間別PV数一括取得エラー (${period}):`, error);
        postIds.forEach(id => viewCountsMap.set(id, 0));
        return viewCountsMap;
      }

      // Mapに変換
      (data || []).forEach((item: any) => {
        const count = item[fieldName] || 0;
        viewCountsMap.set(item.post_id, count);
      });

      // データが存在しない投稿は0を設定
      postIds.forEach(id => {
        if (!viewCountsMap.has(id)) {
          viewCountsMap.set(id, 0);
        }
      });

      return viewCountsMap;
    } catch (error) {
      console.error(`期間別PV数一括取得中にエラーが発生 (${period}):`, error);
      postIds.forEach(id => viewCountsMap.set(id, 0));
      return viewCountsMap;
    }
  }

  // ユーザーのIPアドレスを取得（外部APIを使用）
  static async getUserIP(): Promise<string | null> {
    try {
      // 複数のIP取得サービスを試す（フォールバック）
      const services = [
        { url: 'https://api.ipify.org?format=json', type: 'json' },
        { url: 'https://api.ip.sb/ip', type: 'text' },
        { url: 'https://ifconfig.me/ip', type: 'text' }
      ];

      for (const service of services) {
        try {
          const response = await fetch(service.url, {
            method: 'GET',
            headers: service.type === 'json' ? { 'Accept': 'application/json' } : { 'Accept': 'text/plain' }
          });

          if (response.ok) {
            if (service.type === 'json') {
              const data = await response.json();
              const ip = data.ip || null;
              if (ip && typeof ip === 'string') {
                return ip.trim();
              }
            } else {
              const text = await response.text();
              const ip = text.trim();
              if (ip && /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
                return ip;
              }
            }
          }
        } catch (e) {
          // 次のサービスを試す
          continue;
        }
      }

      // すべてのサービスが失敗した場合
      console.warn('IPアドレス取得に失敗しました。すべてのサービスが利用できません。');
      return null;
    } catch (error) {
      console.error('IPアドレス取得エラー:', error);
      return null;
    }
  }
}
