import { supabase } from './supabaseClient';
import { PostWithDetails, User } from '../types';

// UserProfilePage用のサービス関数
export class UserProfileService {
  // 特定のユーザーのプロフィール情報を取得（usernameベース）
  static async getUserProfileByUsername(username: string): Promise<{ user: User | null; error?: string }> {
    try {
      console.log('getUserProfileByUsername 呼び出し:', username);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('ユーザープロフィール取得エラー:', error);
        return { user: null, error: error.message };
      }

      console.log('プロフィール取得成功:', data);
      return { user: data };
    } catch (error) {
      console.error('ユーザープロフィール取得中にエラーが発生:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特定のユーザーのプロフィール情報を取得（IDベース - 後方互換性のため保持）
  static async getUserProfile(userId: string): Promise<{ user: User | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('ユーザープロフィール取得エラー:', error);
        return { user: null, error: error.message };
      }

      return { user: data };
    } catch (error) {
      console.error('ユーザープロフィール取得中にエラーが発生:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特定のユーザーの投稿作品を取得
  static async getUserPosts(userId: string, limit = 20, offset = 0): Promise<{ posts: PostWithDetails[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(
            id,
            username,
            display_name,
            university,
            status,
            avatar_url,
            bio,
            is_creator,
            created_at
          ),
          images:post_images(
            id,
            post_id,
            image_url,
            display_order
          ),
          tags:post_tags(
            tag:tags(
              id,
              name
            )
          )
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('ユーザー投稿取得エラー:', error);
        return { posts: [], error: error.message };
      }

      // データを整形
      const formattedPosts: PostWithDetails[] = (data || []).map((post: any) => ({
        id: post.id,
        author_id: post.author_id,
        type: post.type,
        title: post.title,
        thumbnail_url: post.thumbnail_url,
        is_r18: post.is_r18,
        created_at: post.created_at,
        author: post.author,
        images: (post.images || []).sort((a: any, b: any) => a.display_order - b.display_order),
        tags: (post.tags || []).map((tag: any) => tag.tag).filter(Boolean),
        like_count: 0, // 後で実装
        view_count: 0  // 後で実装
      }));

      return { posts: formattedPosts };
    } catch (error) {
      console.error('ユーザー投稿取得中にエラーが発生:', error);
      return {
        posts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ユーザーの統計情報を取得
  static async getUserStats(userId: string): Promise<{ 
    worksCount: number; 
    followersCount: number; 
    followingCount: number;
    totalLikes: number;
    totalViews: number;
    error?: string 
  }> {
    try {
      const [worksResult, followersResult, followingResult] = await Promise.all([
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId)
      ]);

      // いいね数と閲覧数の取得（仮実装）
      const totalLikes = 0; // 後で実装
      const totalViews = 0; // 後で実装

      return {
        worksCount: worksResult.count || 0,
        followersCount: followersResult.count || 0,
        followingCount: followingResult.count || 0,
        totalLikes,
        totalViews
      };
    } catch (error) {
      console.error('ユーザー統計取得中にエラーが発生:', error);
      return {
        worksCount: 0,
        followersCount: 0,
        followingCount: 0,
        totalLikes: 0,
        totalViews: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // フォロー状態を確認（usernameベース）
  static async checkFollowStatusByUsername(followerId: string, targetUsername: string): Promise<{ isFollowing: boolean; error?: string }> {
    try {
      // まずusernameからユーザーIDを取得
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', targetUsername)
        .single();

      if (userError || !targetUser) {
        return { isFollowing: false, error: 'ユーザーが見つかりません' };
      }

      // フォロー状態を確認
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', followerId)
        .eq('following_id', targetUser.id)
        .maybeSingle();

      if (error) {
        console.error('フォロー状態確認エラー:', error);
        return { isFollowing: false, error: error.message };
      }

      return { isFollowing: !!data };
    } catch (error) {
      console.error('フォロー状態確認中にエラーが発生:', error);
      return {
        isFollowing: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // フォロー機能（usernameベース）
  static async followUserByUsername(followerId: string, targetUsername: string): Promise<{ success: boolean; error?: string }> {
    try {
      // まずusernameからユーザーIDを取得
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', targetUsername)
        .single();

      if (userError || !targetUser) {
        return { success: false, error: 'ユーザーが見つかりません' };
      }

      // フォローを実行
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: targetUser.id
        });

      if (error) {
        console.error('フォローエラー:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('フォロー中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // アンフォロー機能（usernameベース）
  static async unfollowUserByUsername(followerId: string, targetUsername: string): Promise<{ success: boolean; error?: string }> {
    try {
      // まずusernameからユーザーIDを取得
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', targetUsername)
        .single();

      if (userError || !targetUser) {
        return { success: false, error: 'ユーザーが見つかりません' };
      }

      // アンフォローを実行
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', targetUser.id);

      if (error) {
        console.error('アンフォローエラー:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('アンフォロー中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
