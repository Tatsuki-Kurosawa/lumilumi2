import { supabase } from './supabaseClient';
import { PostWithDetails } from '../types';

export interface RankingItem {
  id: number;
  title: string;
  thumbnail_url: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    university: string;
    status: 'student' | 'ob' | 'og';
    avatar_url?: string;
  };
  likes: number; // likesテーブルのcountの合計
  views: number; // page_viewsテーブルの行数
  points: number; // いいね×5 + PV×1
  tags: Array<{ id: number; name: string }>;
  rank: number;
}

// ランキング用のサービス
export class RankingService {
  // 指定されたタイプ（manga/illustration）のランキングを取得
  static async getRankingByType(
    type: 'manga' | 'illustration',
    limit: number = 20
  ): Promise<{ items: RankingItem[]; error?: string }> {
    try {
      // 1. 指定されたタイプの投稿を全て取得
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          thumbnail_url,
          author:profiles!posts_author_id_fkey(
            id,
            username,
            display_name,
            university,
            status,
            avatar_url
          ),
          tags:post_tags(
            tag:tags(
              id,
              name
            )
          )
        `)
        .eq('type', type);

      if (postsError) {
        console.error('投稿取得エラー:', postsError);
        return { items: [], error: postsError.message };
      }

      if (!posts || posts.length === 0) {
        return { items: [] };
      }

      const postIds = posts.map((post: any) => post.id);

      // 2. いいね数を取得（post_like_countsテーブルのtotal_likes）
      const { data: likeCounts, error: likeError } = await supabase
        .from('post_like_counts')
        .select('post_id, total_likes')
        .in('post_id', postIds);

      if (likeError) {
        console.error('いいね数取得エラー:', likeError);
      }

      // 3. PV数を取得（post_view_countsテーブルのtotal_views）
      const { data: viewCounts, error: viewError } = await supabase
        .from('post_view_counts')
        .select('post_id, total_views')
        .in('post_id', postIds);

      if (viewError) {
        console.error('PV数取得エラー:', viewError);
      }

      // 4. Mapに変換して高速アクセス
      const likeCountsMap = new Map<number, number>();
      (likeCounts || []).forEach((item: any) => {
        likeCountsMap.set(item.post_id, item.total_likes || 0);
      });

      const viewCountsMap = new Map<number, number>();
      (viewCounts || []).forEach((item: any) => {
        viewCountsMap.set(item.post_id, item.total_views || 0);
      });

      // 5. ランキングアイテムを作成
      const rankingItems: RankingItem[] = posts
        .filter((post: any) => post.author) // authorが存在する投稿のみ
        .map((post: any) => {
          const likes = likeCountsMap.get(post.id) || 0;
          const views = viewCountsMap.get(post.id) || 0;
          const points = likes * 5 + views * 1; // いいね×5pt + PV×1pt

          return {
            id: post.id,
            title: post.title || '',
            thumbnail_url: post.thumbnail_url || '',
            author: post.author,
            likes,
            views,
            points,
            tags: (post.tags || []).map((tag: any) => tag.tag).filter(Boolean),
            rank: 0 // 後で設定
          };
        });

      // 6. ポイント順にソート
      rankingItems.sort((a, b) => b.points - a.points);

      // 7. ランクを設定し、上位limit件のみ返す
      const topItems = rankingItems.slice(0, limit).map((item, index) => ({
        ...item,
        rank: index + 1
      }));

      return { items: topItems };
    } catch (error) {
      console.error('ランキング取得中にエラーが発生:', error);
      return {
        items: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // マンガランキングを取得
  static async getMangaRanking(limit: number = 20): Promise<{ items: RankingItem[]; error?: string }> {
    return this.getRankingByType('manga', limit);
  }

  // イラストランキングを取得
  static async getIllustrationRanking(limit: number = 20): Promise<{ items: RankingItem[]; error?: string }> {
    return this.getRankingByType('illustration', limit);
  }

  // 指定されたタイプ（manga/illustration）で、特定のタグが付いている作品数を取得
  static async getTagPostCount(
    tagName: string,
    type: 'manga' | 'illustration'
  ): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('post_tags')
        .select('*, post:posts!inner(type)', { count: 'exact', head: true })
        .eq('post.type', type)
        .eq('tag:tags.name', tagName);

      if (error) {
        console.error('タグ作品数取得エラー:', error);
        // 別の方法で取得を試みる
        const { data, error: dataError } = await supabase
          .from('post_tags')
          .select(`
            post:posts!inner(type),
            tag:tags(name)
          `)
          .eq('post.type', type);

        if (dataError) {
          return { count: 0, error: dataError.message };
        }

        // データからタグ名でフィルタリングしてカウント
        const filtered = (data || []).filter((item: any) => item.tag?.name === tagName);
        return { count: filtered.length };
      }

      return { count: count || 0 };
    } catch (error) {
      console.error('タグ作品数取得中にエラーが発生:', error);
      return {
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 複数のタグの作品数を一括取得
  static async getTagPostCounts(
    tagNames: string[],
    type: 'manga' | 'illustration'
  ): Promise<Map<string, number>> {
    const tagCountsMap = new Map<string, number>();

    if (tagNames.length === 0) {
      return tagCountsMap;
    }

    try {
      // WorksPage.tsxと同じアプローチを使用
      const { data, error } = await supabase
        .from('post_tags')
        .select(`
          post_id,
          tag:tags(name),
          post:posts!inner(id, type)
        `)
        .eq('post.type', type);

      if (error) {
        console.error('タグ作品数一括取得エラー:', error);
        tagNames.forEach(name => tagCountsMap.set(name, 0));
        return tagCountsMap;
      }

      // タグ名の出現回数をカウント（ユニークな投稿をカウントするため、投稿IDでグループ化）
      const postIdsByTag = new Map<string, Set<number>>();
      tagNames.forEach(name => postIdsByTag.set(name, new Set()));

      // まず投稿IDを取得するためのマップを作成
      const postIdMap = new Map<number, { tagName: string }[]>();
      
      (data || []).forEach((item: any) => {
        const tagName = item.tag?.name;
        const postId = item.post_id || item.post?.id;
        
        if (tagName && postId && tagNames.includes(tagName)) {
          if (!postIdMap.has(postId)) {
            postIdMap.set(postId, []);
          }
          postIdMap.get(postId)?.push({ tagName });
        }
      });

      // 各投稿について、タグごとにカウント（同じ投稿に同じタグが複数回付いている場合も1回としてカウント）
      postIdMap.forEach((tags, postId) => {
        const uniqueTagNames = new Set(tags.map(t => t.tagName));
        uniqueTagNames.forEach(tagName => {
          if (postIdsByTag.has(tagName)) {
            postIdsByTag.get(tagName)?.add(postId);
          }
        });
      });

      // Mapに変換（ユニークな投稿IDの数がそのタグの作品数）
      postIdsByTag.forEach((postIds, tagName) => {
        tagCountsMap.set(tagName, postIds.size);
      });

      // データが存在しないタグは0を設定
      tagNames.forEach(name => {
        if (!tagCountsMap.has(name)) {
          tagCountsMap.set(name, 0);
        }
      });

      return tagCountsMap;
    } catch (error) {
      console.error('タグ作品数一括取得中にエラーが発生:', error);
      tagNames.forEach(name => tagCountsMap.set(name, 0));
      return tagCountsMap;
    }
  }
}

