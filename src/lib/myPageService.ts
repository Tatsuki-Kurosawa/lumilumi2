import { supabase } from './supabaseClient';
import { PostWithDetails, User } from '../types';
import { PostsService } from './postsService';
import { PageViewService } from './pageViewService';

// MyPage用のサービス関数
export class MyPageService {
  // ユーザーの投稿作品を取得
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

  // ユーザーがいいねした作品を取得
  static async getUserLikedPosts(userId: string, limit = 20, offset = 0): Promise<{ posts: PostWithDetails[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select(`
          post_id,
          posts!likes_post_id_fkey(
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
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('いいね作品取得エラー:', error);
        return { posts: [], error: error.message };
      }

      // データを整形（最初にpostsを抽出）
      const posts = (data || [])
        .map((like: any) => like.posts)
        .filter(Boolean);

      // 投稿IDリストを取得
      const postIds = posts.map((post: any) => post.id);
      
      // いいね数とPV数を一括取得
      const [likeCountsMap, viewCountsMap] = await Promise.all([
        PostsService.getLikeCountsForPosts(postIds),
        PageViewService.getViewCountsForPosts(postIds)
      ]);

      // データを整形
      const formattedPosts: PostWithDetails[] = posts.map((post: any) => ({
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
      console.error('いいね作品取得中にエラーが発生:', error);
      return {
        posts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // フォロー中のユーザーを取得
  static async getFollowingUsers(userId: string, limit = 20, offset = 0): Promise<{ users: (User & { isFollowingBack: boolean })[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          following:profiles!follows_following_id_fkey(
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
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('フォロー中ユーザー取得エラー:', error);
        return { users: [], error: error.message };
      }

      const followingProfiles: User[] = (data || [])
        .map(follow => follow.following)
        .filter(Boolean);

      const followingIds = followingProfiles.map(profile => profile.id);
      let followBackSet = new Set<string>();

      if (followingIds.length > 0) {
        const { data: followBackData, error: followBackError } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', userId)
          .in('follower_id', followingIds);

        if (followBackError) {
          console.error('フォロー相互状態取得エラー:', followBackError);
        } else if (followBackData) {
          followBackSet = new Set(followBackData.map(record => record.follower_id));
        }
      }

      // データを整形
      const formattedUsers: (User & { isFollowingBack: boolean })[] = followingProfiles.map(profile => ({
        ...profile,
        isFollowingBack: followBackSet.has(profile.id)
      }));

      return { users: formattedUsers };
    } catch (error) {
      console.error('フォロー中ユーザー取得中にエラーが発生:', error);
      return {
        users: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getFollowerUsers(userId: string, limit = 20, offset = 0): Promise<{ users: (User & { isFollowingBack: boolean })[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          follower:profiles!follows_follower_id_fkey(
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
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('フォロワー取得エラー:', error);
        return { users: [], error: error.message };
      }

      const followerProfiles: User[] = (data || [])
        .map(follow => follow.follower)
        .filter(Boolean);

      const followerIds = followerProfiles.map(profile => profile.id);
      let followBackSet = new Set<string>();

      if (followerIds.length > 0) {
        const { data: followBackData, error: followBackError } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)
          .in('following_id', followerIds);

        if (followBackError) {
          console.error('フォロー相互状態取得エラー:', followBackError);
        } else if (followBackData) {
          followBackSet = new Set(followBackData.map(record => record.following_id));
        }
      }

      const formattedUsers: (User & { isFollowingBack: boolean })[] = followerProfiles.map(profile => ({
        ...profile,
        isFollowingBack: followBackSet.has(profile.id)
      }));

      return { users: formattedUsers };
    } catch (error) {
      console.error('フォロワー取得中にエラーが発生:', error);
      return {
        users: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // フォロワー数を取得
  static async getFollowerCount(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) {
        console.error('フォロワー数取得エラー:', error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0 };
    } catch (error) {
      console.error('フォロワー数取得中にエラーが発生:', error);
      return {
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // フォロー数を取得
  static async getFollowingCount(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) {
        console.error('フォロー数取得エラー:', error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0 };
    } catch (error) {
      console.error('フォロー数取得中にエラーが発生:', error);
      return {
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ユーザーの作品数を取得
  static async getUserPostCount(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      if (error) {
        console.error('作品数取得エラー:', error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0 };
    } catch (error) {
      console.error('作品数取得中にエラーが発生:', error);
      return {
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ユーザーの統計情報を取得（総いいね数・総閲覧数含む）
  static async getUserStats(userId: string): Promise<{ 
    worksCount: number; 
    followersCount: number; 
    followingCount: number;
    totalLikes: number;
    totalViews: number;
    error?: string 
  }> {
    try {
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
          .select('total_like_counts, total_view_counts')
          .eq('id', userId)
          .maybeSingle()
      ]);

      const totalLikes = profileTotals?.data?.total_like_counts !== undefined && profileTotals?.data?.total_like_counts !== null
        ? Number(profileTotals.data.total_like_counts)
        : 0;

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

  // フォロー機能
  static async followUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId
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

  // アンフォロー機能
  static async unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

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

  // フォロー状態を確認
  static async checkFollowStatus(followerId: string, followingId: string): Promise<{ isFollowing: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
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
}
