import { supabase } from './supabaseClient';
import { PostWithDetails } from '../types';
import { PageViewService } from './pageViewService';
import { NotificationService } from './notificationService';

// 投稿データを取得するサービス
export class PostsService {
  // 複数の投稿のいいね数を一括取得
  static async getLikeCountsForPosts(postIds: number[]): Promise<Map<number, number>> {
    const likeCountsMap = new Map<number, number>();
    
    if (postIds.length === 0) {
      return likeCountsMap;
    }

    try {
      // post_like_countsテーブルから一括取得
      const { data, error } = await supabase
        .from('post_like_counts')
        .select('post_id, total_likes')
        .in('post_id', postIds);

      if (error) {
        console.error('いいね数一括取得エラー:', error);
        // エラー時は0を返す
        postIds.forEach(id => likeCountsMap.set(id, 0));
        return likeCountsMap;
      }

      // Mapに変換
      (data || []).forEach((item: any) => {
        likeCountsMap.set(item.post_id, item.total_likes || 0);
      });

      // データが存在しない投稿は0を設定
      postIds.forEach(id => {
        if (!likeCountsMap.has(id)) {
          likeCountsMap.set(id, 0);
        }
      });

      return likeCountsMap;
    } catch (error) {
      console.error('いいね数一括取得中にエラーが発生:', error);
      // エラー時は0を返す
      postIds.forEach(id => likeCountsMap.set(id, 0));
      return likeCountsMap;
    }
  }
  // 全ての投稿を取得（最新順）
  static async getAllPosts(limit = 20, offset = 0): Promise<{ posts: PostWithDetails[]; error?: string }> {
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
        .eq('is_r18', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('投稿データ取得エラー:', error);
        return { posts: [], error: error.message };
      }

      // 投稿IDリストを取得
      const postIds = (data || []).map((post: any) => post.id);
      
      // いいね数とPV数を一括取得
      const [likeCountsMap, viewCountsMap] = await Promise.all([
        this.getLikeCountsForPosts(postIds),
        PageViewService.getViewCountsForPosts(postIds)
      ]);

      // データを整形
      const formattedPosts: PostWithDetails[] = (data || []).map((post: any) => ({
        id: post.id,
        author_id: post.author_id,
        type: post.type,
        title: post.title,
        description: post.description,
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
        .eq('type', category)
        .eq('is_r18', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error(`${category}投稿データ取得エラー:`, error);
        return { posts: [], error: error.message };
      }

      // 投稿IDリストを取得
      const postIds = (data || []).map((post: any) => post.id);
      
      // いいね数とPV数を一括取得
      const [likeCountsMap, viewCountsMap] = await Promise.all([
        this.getLikeCountsForPosts(postIds),
        PageViewService.getViewCountsForPosts(postIds)
      ]);

      // データを整形
      const formattedPosts: PostWithDetails[] = (data || []).map((post: any) => ({
        id: post.id,
        author_id: post.author_id,
        type: post.type,
        title: post.title,
        description: post.description,
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
      console.error(`${category}投稿データ取得中にエラーが発生:`, error);
      return {
        posts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // おすすめ投稿を取得（仮実装：最新順）
  static async getRecommendedPosts(limit = 8, offset = 0): Promise<{ posts: PostWithDetails[]; error?: string }> {
    return this.getAllPosts(limit, offset);
  }

  // トレンド投稿を取得（仮実装：最新順）
  static async getTrendingPosts(limit = 8, offset = 0): Promise<{ posts: PostWithDetails[]; error?: string }> {
    return this.getAllPosts(limit, offset);
  }

  // 新着投稿を取得
  static async getLatestPosts(limit = 8, offset = 0): Promise<{ posts: PostWithDetails[]; error?: string }> {
    return this.getAllPosts(limit, offset);
  }

  // 特定のカテゴリのおすすめ投稿を取得
  static async getRecommendedPostsByCategory(
    category: 'manga' | 'illustration',
    limit = 8,
    offset = 0
  ): Promise<{ posts: PostWithDetails[]; error?: string }> {
    // おすすめは8件目以降から取得（新着の次の投稿群）
    return this.getPostsByCategory(category, limit, offset + 8);
  }

  // 特定のカテゴリのトレンド投稿を取得
  static async getTrendingPostsByCategory(
    category: 'manga' | 'illustration',
    limit = 8,
    offset = 0
  ): Promise<{ posts: PostWithDetails[]; error?: string }> {
    // 急上昇は16件目以降から取得（新着とおすすめの次の投稿群）
    return this.getPostsByCategory(category, limit, offset + 16);
  }

  // 特定のカテゴリの新着投稿を取得
  static async getLatestPostsByCategory(
    category: 'manga' | 'illustration',
    limit = 8,
    offset = 0
  ): Promise<{ posts: PostWithDetails[]; error?: string }> {
    // 新着は最新の投稿から取得
    return this.getPostsByCategory(category, limit, offset);
  }

  // R18作品を取得（タイプ別）
  static async getR18PostsByType(
    type: 'manga' | 'illustration' | 'all',
    limit = 20,
    offset = 0
  ): Promise<{ posts: PostWithDetails[]; error?: string }> {
    try {
      let query = supabase
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
        .eq('is_r18', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type !== 'all') {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('R18投稿データ取得エラー:', error);
        return { posts: [], error: error.message };
      }

      // 投稿IDリストを取得
      const postIds = (data || []).map((post: any) => post.id);
      
      // いいね数とPV数を一括取得
      const [likeCountsMap, viewCountsMap] = await Promise.all([
        this.getLikeCountsForPosts(postIds),
        PageViewService.getViewCountsForPosts(postIds)
      ]);

      // データを整形
      const formattedPosts: PostWithDetails[] = (data || []).map((post: any) => ({
        id: post.id,
        author_id: post.author_id,
        type: post.type,
        title: post.title,
        description: post.description,
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
      console.error('R18投稿データ取得中にエラーが発生:', error);
      return {
        posts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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

      // いいね数とPV数を取得
      const [likeCountsMap, viewCountsMap] = await Promise.all([
        this.getLikeCountsForPosts([data.id]),
        PageViewService.getViewCountsForPosts([data.id])
      ]);
      const likeCount = likeCountsMap.get(data.id) || 0;
      const viewCount = viewCountsMap.get(data.id) || 0;

      // データを整形
      const formattedPost: PostWithDetails = {
        id: data.id,
        author_id: data.author_id,
        type: data.type,
        title: data.title,
        description: data.description,
        thumbnail_url: data.thumbnail_url,
        is_r18: data.is_r18,
        created_at: data.created_at,
        author: data.author,
        images: (data.images || []).sort((a: any, b: any) => a.display_order - b.display_order),
        tags: (data.tags || []).map((tag: any) => tag.tag).filter(Boolean),
        like_count: likeCount,
        view_count: viewCount
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
    const authorDisplayName = `${post.author.display_name}@${post.author.university}`;
    const authorUsername = post.author.username;

    return {
      id: post.id.toString(),
      title: post.title,
      thumbnail: post.thumbnail_url,
      authorDisplayName: authorDisplayName, // 表示用
      authorUsername: authorUsername,       // リンク用
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

  // 統計情報を取得
  static async getStatistics(): Promise<{
    userCount: number;
    postCount: number;
    totalLikes: number;
    totalViews: number;
    error?: string;
  }> {
    try {
      // 並列で全ての統計情報を取得
      const [usersResult, postsResult, likesResult, viewsResult] = await Promise.all([
        // 登録ユーザー数
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true }),

        // 投稿作品数
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true }),

        // 総いいね数（post_like_countsテーブルから合計）
        supabase
          .from('post_like_counts')
          .select('total_likes'),

        // 総閲覧数（post_view_countsテーブルから合計）
        supabase
          .from('post_view_counts')
          .select('total_views')
      ]);

      // エラーチェック
      if (usersResult.error || postsResult.error || likesResult.error || viewsResult.error) {
        const errorMsg = usersResult.error?.message || postsResult.error?.message ||
                        likesResult.error?.message || viewsResult.error?.message;
        console.error('統計情報取得エラー:', errorMsg);
        return {
          userCount: 0,
          postCount: 0,
          totalLikes: 0,
          totalViews: 0,
          error: errorMsg
        };
      }

      // 総いいね数を計算（post_like_countsのtotal_likesを合計）
      const totalLikes = (likesResult.data || []).reduce((sum, item) => sum + (item.total_likes || 0), 0);

      // 総閲覧数を計算（post_view_countsのtotal_viewsを合計）
      const totalViews = (viewsResult.data || []).reduce((sum, item) => sum + (item.total_views || 0), 0);

      return {
        userCount: usersResult.count || 0,
        postCount: postsResult.count || 0,
        totalLikes: totalLikes,
        totalViews: totalViews
      };
    } catch (error) {
      console.error('統計情報取得中にエラーが発生:', error);
      return {
        userCount: 0,
        postCount: 0,
        totalLikes: 0,
        totalViews: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 投稿を更新（タイトル、説明、タグ、固定状態）
  static async updatePost(
    postId: number,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
      is_pinned?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 投稿の所有者確認
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (fetchError || !post) {
        return { success: false, error: '投稿が見つかりません' };
      }

      if (post.author_id !== userId) {
        return { success: false, error: '編集する権限がありません' };
      }

      // 投稿情報を更新
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.is_pinned !== undefined) updateData.is_pinned = updates.is_pinned;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('posts')
          .update(updateData)
          .eq('id', postId);

        if (updateError) {
          console.error('投稿更新エラー:', updateError);
          return { success: false, error: updateError.message };
        }
      }

      // タグを更新
      if (updates.tags !== undefined) {
        // 既存のタグを削除
        const { error: deleteTagsError } = await supabase
          .from('post_tags')
          .delete()
          .eq('post_id', postId);

        if (deleteTagsError) {
          console.error('タグ削除エラー:', deleteTagsError);
          return { success: false, error: deleteTagsError.message };
        }

        // 新しいタグを追加
        if (updates.tags.length > 0) {
          // タグが存在するか確認し、存在しない場合は作成
          const tagIds: number[] = [];
          for (const tagName of updates.tags) {
            // タグを取得または作成
            let { data: existingTag } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName)
              .single();

            if (!existingTag) {
              // タグが存在しない場合は作成
              const { data: newTag, error: createError } = await supabase
                .from('tags')
                .insert({ name: tagName })
                .select('id')
                .single();

              if (createError) {
                console.error('タグ作成エラー:', createError);
                continue;
              }
              tagIds.push(newTag.id);
            } else {
              tagIds.push(existingTag.id);
            }
          }

          // post_tagsテーブルに追加
          if (tagIds.length > 0) {
            const postTagsData = tagIds.map(tagId => ({
              post_id: postId,
              tag_id: tagId
            }));

            const { error: insertTagsError } = await supabase
              .from('post_tags')
              .insert(postTagsData);

            if (insertTagsError) {
              console.error('タグ追加エラー:', insertTagsError);
              return { success: false, error: insertTagsError.message };
            }
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('投稿更新中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 投稿を削除
  static async deletePost(postId: number, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 投稿の所有者確認
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('author_id, images:post_images(image_url)')
        .eq('id', postId)
        .single();

      if (fetchError || !post) {
        return { success: false, error: '投稿が見つかりません' };
      }

      if (post.author_id !== userId) {
        return { success: false, error: '削除する権限がありません' };
      }

      // Storageから画像を削除
      if (post.images && post.images.length > 0) {
        const imagePaths = post.images.map((img: any) => {
          const url = new URL(img.image_url);
          const path = url.pathname.split('/storage/v1/object/public/posts/')[1];
          return path;
        }).filter(Boolean);

        if (imagePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('posts')
            .remove(imagePaths);

          if (storageError) {
            console.error('画像削除エラー:', storageError);
            // 画像削除に失敗しても続行
          }
        }
      }

      // 投稿を削除（関連データはCASCADE削除される）
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (deleteError) {
        console.error('投稿削除エラー:', deleteError);
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('投稿削除中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}