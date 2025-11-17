import { supabase } from './supabaseClient';
import { PostWithDetails, User } from '../types';
import { PostsService } from './postsService';
import { PageViewService } from './pageViewService';
import { NotificationService } from './notificationService';

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

  // 特定のユーザーの投稿数を取得
  static async getUserPostCount(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      if (error) {
        console.error('投稿数取得エラー:', error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0 };
    } catch (error) {
      console.error('投稿数取得中にエラーが発生:', error);
      return {
        count: 0,
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
            cover_image_url,
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

      // 投稿IDリストを取得
      const postIds = (data || []).map((post: any) => post.id);
      
      // いいね数とPV数を一括取得
      const [likeCountsMap, viewCountsMap] = await Promise.all([
        PostsService.getLikeCountsForPosts(postIds),
        PageViewService.getViewCountsForPosts(postIds)
      ]);

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
        like_count: likeCountsMap.get(post.id) || 0,
        view_count: viewCountsMap.get(post.id) || 0
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
      // まず対象ユーザーの投稿IDを取得
      const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select('id')
        .eq('author_id', userId);

      if (postsError) {
        console.error('投稿取得エラー:', postsError);
      }

      const postIds = (userPosts || []).map((post: { id: string }) => post.id);

      // 投稿IDが存在する場合、likesテーブルからcountカラムの合計を取得
      let totalLikes = 0;
      if (postIds.length > 0) {
        const { data: likesData, error: likesError } = await supabase
          .from('likes')
          .select('count')
          .in('post_id', postIds);

        if (likesError) {
          console.error('いいね数取得エラー:', likesError);
        } else {
          // countカラムの合計を計算
          totalLikes = (likesData || []).reduce((sum: number, like: { count: number | null }) => {
            return sum + (Number(like.count) || 0);
          }, 0);
        }
      }

      const [worksResult, followersResult, followingResult, profileTotals] = await Promise.all([
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
          .eq('follower_id', userId),
        supabase
          .from('profiles')
          .select('total_view_counts')
          .eq('id', userId)
          .maybeSingle()
      ]);

      const totalViews = profileTotals?.data?.total_view_counts !== undefined && profileTotals?.data?.total_view_counts !== null
        ? Number(profileTotals.data.total_view_counts)
        : 0;

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

      // フォローされたユーザーに通知を送る
      await NotificationService.createNotification(
        targetUser.id,
        'follow',
        followerId
      );

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
