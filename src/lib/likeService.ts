import { supabase } from './supabaseClient';
import { NotificationService } from './notificationService';

export interface LikeStats {
  available: number;
  used: number;
  remaining: number;
}

// 期間別のいいね数を取得する型定義
export interface LikeCountsByPeriod {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
}

// いいね機能のサービス
export class LikeService {
  // ユーザーのいいね権限を取得
  static async getUserLikeStats(userId: string): Promise<{ stats: LikeStats | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_likes_available, total_likes_used')
        .eq('id', userId)
        .single();

      if (error) {
        return { stats: null, error: error.message };
      }

      const stats: LikeStats = {
        available: data.total_likes_available || 20,
        used: data.total_likes_used || 0,
        remaining: (data.total_likes_available || 20) - (data.total_likes_used || 0)
      };

      return { stats };
    } catch (error) {
      return { stats: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // いいねを追加（1作品につき1回のみ）
  static async addLike(postId: number, userId: string): Promise<{ success: boolean; error?: string; currentCount?: number }> {
    try {
      // 既存のいいねをチェック
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('count')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return { success: false, error: checkError.message };
      }

      if (existingLike) {
        // 既にいいねしている場合は、エラーを返す
        return { success: false, error: 'この作品には既にいいねしています' };
      }

      // 新規レコード作成
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId,
          count: 1,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      // 投稿の作者に通知を送る
      const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (post && post.author_id) {
        await NotificationService.createNotification(
          post.author_id,
          'like',
          userId,
          postId
        );
      }

      return { success: true, currentCount: 1 };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // いいねを削除
  static async removeLike(postId: number, userId: string): Promise<{ success: boolean; error?: string; currentCount?: number }> {
    try {
      // 既存のいいねをチェック
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('count')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (checkError) {
        return { success: false, error: 'いいねが見つかりません' };
      }

      // レコードを削除
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      return { success: true, currentCount: 0 };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ユーザーがその作品に何回いいねしたかを取得
  static async getUserLikeCountForPost(postId: number, userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('count')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { count: 0, error: error.message };
      }

      return { count: data?.count || 0 };
    } catch (error) {
      return { count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ユーザーがいいねしているかチェック
  static async checkUserLike(postId: number, userId: string): Promise<{ isLiked: boolean; count: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('count')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { isLiked: false, count: 0, error: error.message };
      }

      return { isLiked: !!data, count: data?.count || 0 };
    } catch (error) {
      return { isLiked: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 投稿のいいね数を取得
  static async getLikeCount(postId: number): Promise<{ count: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_like_counts')
        .select('total_likes')
        .eq('post_id', postId)
        .single();

      if (error) {
        // レコードが存在しない場合（PGRST116）は0を返す
        if (error.code === 'PGRST116') {
          return { count: 0 };
        }
        return { count: 0, error: error.message };
      }

      return { count: data?.total_likes || 0 };
    } catch (error) {
      return { count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 特定の投稿の期間別いいね数を取得
  static async getLikeCountsByPeriod(postId: number): Promise<{ counts: LikeCountsByPeriod | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_like_counts')
        .select('daily_likes, weekly_likes, monthly_likes, total_likes')
        .eq('post_id', postId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // レコードが存在しない場合は全て0を返す
          return { counts: { daily: 0, weekly: 0, monthly: 0, total: 0 } };
        }
        console.error('期間別いいね数取得エラー:', error);
        return { counts: null, error: error.message };
      }

      return {
        counts: {
          daily: data?.daily_likes || 0,
          weekly: data?.weekly_likes || 0,
          monthly: data?.monthly_likes || 0,
          total: data?.total_likes || 0
        }
      };
    } catch (error) {
      console.error('期間別いいね数取得中にエラーが発生:', error);
      return { counts: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 複数の投稿の期間別いいね数を一括取得
  static async getLikeCountsByPeriodForPosts(
    postIds: number[],
    period: 'daily' | 'weekly' | 'monthly' | 'total' = 'total'
  ): Promise<Map<number, number>> {
    const likeCountsMap = new Map<number, number>();
    
    if (postIds.length === 0) {
      return likeCountsMap;
    }

    try {
      const fieldName = period === 'daily' ? 'daily_likes' :
                        period === 'weekly' ? 'weekly_likes' :
                        period === 'monthly' ? 'monthly_likes' :
                        'total_likes';

      const { data, error } = await supabase
        .from('post_like_counts')
        .select(`post_id, ${fieldName}`)
        .in('post_id', postIds);

      if (error) {
        console.error(`期間別いいね数一括取得エラー (${period}):`, error);
        postIds.forEach(id => likeCountsMap.set(id, 0));
        return likeCountsMap;
      }

      // Mapに変換
      (data || []).forEach((item: any) => {
        const count = item[fieldName] || 0;
        likeCountsMap.set(item.post_id, count);
      });

      // データが存在しない投稿は0を設定
      postIds.forEach(id => {
        if (!likeCountsMap.has(id)) {
          likeCountsMap.set(id, 0);
        }
      });

      return likeCountsMap;
    } catch (error) {
      console.error(`期間別いいね数一括取得中にエラーが発生 (${period}):`, error);
      postIds.forEach(id => likeCountsMap.set(id, 0));
      return likeCountsMap;
    }
  }
}
