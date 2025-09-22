import { supabase } from './supabaseClient';

// いいね機能のサービス
export class LikeService {
  // いいねを追加
  static async addLike(postId: number, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 既存のいいねをチェック
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116は「データが見つからない」エラー
        return { success: false, error: checkError.message };
      }

      if (existingLike) {
        return { success: false, error: '既にいいねしています' };
      }

      // いいねを追加
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      // postsテーブルのlike_countを更新
      const { error: updateError } = await supabase.rpc('increment_like_count', {
        post_id: postId
      });

      if (updateError) {
        console.warn('like_countの更新に失敗:', updateError);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // いいねを削除
  static async removeLike(postId: number, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // いいねを削除
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      // postsテーブルのlike_countを更新
      const { error: updateError } = await supabase.rpc('decrement_like_count', {
        post_id: postId
      });

      if (updateError) {
        console.warn('like_countの更新に失敗:', updateError);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ユーザーがいいねしているかチェック
  static async checkUserLike(postId: number, userId: string): Promise<{ isLiked: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { isLiked: false, error: error.message };
      }

      return { isLiked: !!data };
    } catch (error) {
      return { isLiked: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 投稿のいいね数を取得
  static async getLikeCount(postId: number): Promise<{ count: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('like_count')
        .eq('id', postId)
        .single();

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: data?.like_count || 0 };
    } catch (error) {
      return { count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
