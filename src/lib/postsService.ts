import { supabase } from './supabaseClient';
import { PostWithDetails } from '../types';

// 投稿データを取得するサービス
export class PostsService {
  // 全ての投稿を取得（最新順）
  static async getAllPosts(limit = 20, offset = 0): Promise<{ posts: PostWithDetails[]; error?: string }> {
    try {
      console.log('getAllPostsが呼ばれたよ');
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
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('投稿データ取得エラー:', error);
        return { posts: [], error: error.message };
      }

      // データを整形
      const formattedPosts: PostWithDetails[] = (data || []).map(post => ({
        id: post.id,
        author_id: post.author_id,
        type: post.type,
        title: post.title,
        thumbnail_url: post.thumbnail_url,
        is_r18: post.is_r18,
        created_at: post.created_at,
        author: post.author,
        images: (post.images || []).sort((a, b) => a.display_order - b.display_order),
        tags: (post.tags || []).map(tag => tag.tag).filter(Boolean),
        like_count: 0, // 後で実装
        view_count: 0  // 後で実装
      }));

      return { posts: formattedPosts };
    } catch (error) {
      console.error('投稿データ取得中にエラーが発生:', error);
      return {
        posts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // カテゴリ別の投稿を取得
  static async getPostsByCategory(
    category: 'manga' | 'illustration',
    limit = 20,
    offset = 0
  ): Promise<{ posts: PostWithDetails[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(
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
        .eq('type', category)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error(`${category}投稿データ取得エラー:`, error);
        return { posts: [], error: error.message };
      }

      // データを整形
      const formattedPosts: PostWithDetails[] = (data || []).map(post => ({
        id: post.id,
        author_id: post.author_id,
        type: post.type,
        title: post.title,
        thumbnail_url: post.thumbnail_url,
        is_r18: post.is_r18,
        created_at: post.created_at,
        author: post.author,
        images: (post.images || []).sort((a, b) => a.display_order - b.display_order),
        tags: (post.tags || []).map(tag => tag.tag).filter(Boolean),
        like_count: 0, // 後で実装
        view_count: 0  // 後で実装
      }));

      return { posts: formattedPosts };
    } catch (error) {
      console.error(`${category}投稿データ取得中にエラーが発生:`, error);
      return {
        posts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // おすすめ投稿を取得（仮実装：最新順）
  static async getRecommendedPosts(limit = 8): Promise<{ posts: PostWithDetails[]; error?: string }> {
    console.log('getRecommendedPostsが呼ばれたよ');
    return this.getAllPosts(limit, 0);
  }

  // トレンド投稿を取得（仮実装：最新順）
  static async getTrendingPosts(limit = 8): Promise<{ posts: PostWithDetails[]; error?: string }> {
    return this.getAllPosts(limit, 0);
  }

  // 新着投稿を取得
  static async getLatestPosts(limit = 8): Promise<{ posts: PostWithDetails[]; error?: string }> {
    return this.getAllPosts(limit, 0);
  }

  // 特定のカテゴリのおすすめ投稿を取得
  static async getRecommendedPostsByCategory(
    category: 'manga' | 'illustration',
    limit = 8
  ): Promise<{ posts: PostWithDetails[]; error?: string }> {
    return this.getPostsByCategory(category, limit, 0);
  }

  // 特定のカテゴリのトレンド投稿を取得
  static async getTrendingPostsByCategory(
    category: 'manga' | 'illustration',
    limit = 8
  ): Promise<{ posts: PostWithDetails[]; error?: string }> {
    return this.getPostsByCategory(category, limit, 0);
  }

  // 特定のカテゴリの新着投稿を取得
  static async getLatestPostsByCategory(
    category: 'manga' | 'illustration',
    limit = 8
  ): Promise<{ posts: PostWithDetails[]; error?: string }> {
    return this.getPostsByCategory(category, limit, 0);
  }

  // 特定の投稿を取得
  static async getPostById(postId: string): Promise<{ post: PostWithDetails | null; error?: string }> {
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
        .eq('id', postId)
        .single();

      if (error) {
        console.error('投稿データ取得エラー:', error);
        return { post: null, error: error.message };
      }

      if (!data) {
        return { post: null, error: '投稿が見つかりません' };
      }

      // データを整形
      const formattedPost: PostWithDetails = {
        id: data.id,
        author_id: data.author_id,
        type: data.type,
        title: data.title,
        thumbnail_url: data.thumbnail_url,
        is_r18: data.is_r18,
        created_at: data.created_at,
        author: data.author,
        images: (data.images || []).sort((a, b) => a.display_order - b.display_order),
        tags: (data.tags || []).map(tag => tag.tag).filter(Boolean),
        like_count: 0, // 後で実装
        view_count: 0  // 後で実装
      };

      return { post: formattedPost };
    } catch (error) {
      console.error('投稿データ取得中にエラーが発生:', error);
      return {
        post: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 投稿データをWorkCardコンポーネント用に変換
  static formatPostForWorkCard(post: PostWithDetails) {
    return {
      id: post.id.toString(),
      title: post.title,
      thumbnail: post.thumbnail_url,
      author: `${post.author.display_name}@${post.author.university}`,
      likes: post.like_count,
      views: post.view_count,
      tags: post.tags.map(tag => tag.name)
    };
  }

  // いいね機能

  // 投稿のいいね数を取得
  static async getLikeCount(postId: number): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) {
        console.error('いいね数取得エラー:', error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0 };
    } catch (error) {
      console.error('いいね数取得中にエラーが発生:', error);
      return {
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ユーザーが特定の投稿をいいねしているか確認
  static async checkUserLiked(userId: string, postId: number): Promise<{ liked: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('user_id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();

      if (error) {
        console.error('いいね確認エラー:', error);
        return { liked: false, error: error.message };
      }

      return { liked: !!data };
    } catch (error) {
      console.error('いいね確認中にエラーが発生:', error);
      return {
        liked: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // いいねを追加
  static async addLike(userId: string, postId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(userId);
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: userId,
          post_id: postId
        });

      if (error) {
        console.error('いいね追加エラー:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('いいね追加中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // いいねを削除
  static async removeLike(userId: string, postId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (error) {
        console.error('いいね削除エラー:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('いいね削除中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}