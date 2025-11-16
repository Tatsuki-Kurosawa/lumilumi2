/**
 * PostsService のテストコード
 * このファイルは *.test.ts 形式のため、本番ビルドには含まれません
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostsService } from '../postsService';
import { supabase } from '../supabaseClient';
import { PageViewService } from '../pageViewService';
import { NotificationService } from '../notificationService';

// 依存モジュールをモック化
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

vi.mock('../pageViewService');
vi.mock('../notificationService');

describe('PostsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLikeCountsForPosts', () => {
    it('複数の投稿のいいね数を一括取得できる', async () => {
      // Arrange
      const postIds = [1, 2, 3];
      const mockLikeCounts = [
        { post_id: 1, total_likes: 10 },
        { post_id: 2, total_likes: 5 },
        { post_id: 3, total_likes: 0 },
      ];

      const mockIn = vi.fn().mockResolvedValue({ data: mockLikeCounts, error: null });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await PostsService.getLikeCountsForPosts(postIds);

      // Assert
      expect(result.get(1)).toBe(10);
      expect(result.get(2)).toBe(5);
      expect(result.get(3)).toBe(0);
      expect(supabase.from).toHaveBeenCalledWith('post_like_counts');
    });

    it('空の配列を渡すと空のMapを返す', async () => {
      // Act
      const result = await PostsService.getLikeCountsForPosts([]);

      // Assert
      expect(result.size).toBe(0);
    });

    it('データが存在しない投稿は0を返す', async () => {
      // Arrange
      const postIds = [1, 2];
      const mockLikeCounts = [
        { post_id: 1, total_likes: 10 },
        // post_id: 2 のデータなし
      ];

      const mockIn = vi.fn().mockResolvedValue({ data: mockLikeCounts, error: null });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await PostsService.getLikeCountsForPosts(postIds);

      // Assert
      expect(result.get(1)).toBe(10);
      expect(result.get(2)).toBe(0); // データがないので0
    });
  });

  describe('getAllPosts', () => {
    it('全ての投稿を取得できる', async () => {
      // Arrange
      const mockPosts = [
        {
          id: 1,
          author_id: 'user-123',
          type: 'illustration',
          title: 'Test Post',
          description: 'Description',
          thumbnail_url: 'https://example.com/thumb.jpg',
          is_r18: false,
          created_at: '2025-01-16T10:00:00Z',
          author: {
            id: 'user-123',
            username: 'testuser',
            display_name: 'Test User',
            university: 'Test University',
            status: 'student',
            is_creator: false,
            created_at: '2025-01-01T00:00:00Z',
          },
          images: [],
          tags: [],
        },
      ];

      const mockRange = vi.fn().mockResolvedValue({ data: mockPosts, error: null });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      vi.mocked(PageViewService.getViewCountsForPosts).mockResolvedValue(new Map([[1, 100]]));
      vi.spyOn(PostsService, 'getLikeCountsForPosts').mockResolvedValue(new Map([[1, 10]]));

      // Act
      const result = await PostsService.getAllPosts(20, 0);

      // Assert
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('Test Post');
      expect(result.posts[0].like_count).toBe(10);
      expect(result.posts[0].view_count).toBe(100);
    });

    it('投稿が存在しない場合は空配列を返す', async () => {
      // Arrange
      const mockRange = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      vi.mocked(PageViewService.getViewCountsForPosts).mockResolvedValue(new Map());
      vi.spyOn(PostsService, 'getLikeCountsForPosts').mockResolvedValue(new Map());

      // Act
      const result = await PostsService.getAllPosts();

      // Assert
      expect(result.posts).toHaveLength(0);
    });
  });

  describe('getPostsByCategory', () => {
    it('指定したカテゴリの投稿を取得できる', async () => {
      // Arrange
      const mockPosts = [
        {
          id: 1,
          author_id: 'user-123',
          type: 'manga',
          title: 'Manga Post',
          description: 'Manga Description',
          thumbnail_url: 'https://example.com/manga.jpg',
          is_r18: false,
          created_at: '2025-01-16T10:00:00Z',
          author: {
            id: 'user-123',
            username: 'mangaka',
            display_name: 'Manga Artist',
            university: 'Test University',
            status: 'student',
            is_creator: false,
            created_at: '2025-01-01T00:00:00Z',
          },
          images: [],
          tags: [],
        },
      ];

      const mockRange = vi.fn().mockResolvedValue({ data: mockPosts, error: null });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      vi.mocked(PageViewService.getViewCountsForPosts).mockResolvedValue(new Map([[1, 50]]));
      vi.spyOn(PostsService, 'getLikeCountsForPosts').mockResolvedValue(new Map([[1, 5]]));

      // Act
      const result = await PostsService.getPostsByCategory('manga');

      // Assert
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].type).toBe('manga');
      expect(mockEq).toHaveBeenCalledWith('type', 'manga');
    });
  });

  describe('getPostById', () => {
    it('特定の投稿を取得できる', async () => {
      // Arrange
      const mockPost = {
        id: 123,
        author_id: 'user-456',
        type: 'illustration',
        title: 'Specific Post',
        description: 'Specific Description',
        thumbnail_url: 'https://example.com/specific.jpg',
        is_r18: false,
        created_at: '2025-01-16T10:00:00Z',
        author: {
          id: 'user-456',
          username: 'artist',
          display_name: 'Artist Name',
          university: 'Art University',
          status: 'student',
          is_creator: true,
          created_at: '2025-01-01T00:00:00Z',
        },
        images: [
          { id: 1, post_id: 123, image_url: 'https://example.com/img1.jpg', display_order: 1 },
        ],
        tags: [
          { tag: { id: 1, name: 'オリジナル' } },
        ],
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockPost, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      vi.mocked(PageViewService.getViewCountsForPosts).mockResolvedValue(new Map([[123, 200]]));
      vi.spyOn(PostsService, 'getLikeCountsForPosts').mockResolvedValue(new Map([[123, 20]]));

      // Act
      const result = await PostsService.getPostById('123');

      // Assert
      expect(result.post).not.toBeNull();
      expect(result.post?.id).toBe(123);
      expect(result.post?.title).toBe('Specific Post');
      expect(result.post?.like_count).toBe(20);
      expect(result.post?.view_count).toBe(200);
    });

    it('投稿が見つからない場合はnullを返す', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await PostsService.getPostById('999');

      // Assert
      expect(result.post).toBeNull();
      expect(result.error).toBe('投稿が見つかりません');
    });
  });

  describe('getLikeCount', () => {
    it('投稿のいいね数を取得できる', async () => {
      // Arrange
      const mockEq = vi.fn().mockResolvedValue({ count: 15, error: null });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await PostsService.getLikeCount(1);

      // Assert
      expect(result.count).toBe(15);
      expect(supabase.from).toHaveBeenCalledWith('likes');
    });

    it('いいねが0件の場合は0を返す', async () => {
      // Arrange
      const mockEq = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await PostsService.getLikeCount(999);

      // Assert
      expect(result.count).toBe(0);
    });
  });

  describe('checkUserLiked', () => {
    it('ユーザーが投稿をいいねしている場合はtrueを返す', async () => {
      // Arrange
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { user_id: 'user-123' },
        error: null,
      });
      const mockEq2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await PostsService.checkUserLiked('user-123', 1);

      // Assert
      expect(result.liked).toBe(true);
    });

    it('ユーザーが投稿をいいねしていない場合はfalseを返す', async () => {
      // Arrange
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await PostsService.checkUserLiked('user-123', 1);

      // Assert
      expect(result.liked).toBe(false);
    });
  });

  describe('addLike', () => {
    it('いいねを追加できる', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as any).mockReturnValueOnce({ insert: mockInsert });

      const mockSingle = vi.fn().mockResolvedValue({
        data: { author_id: 'author-789' },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValueOnce({ select: mockSelect });

      vi.mocked(NotificationService.createNotification).mockResolvedValue({
        success: true,
      });

      // Act
      const result = await PostsService.addLike('user-123', 1);

      // Assert
      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        post_id: 1,
      });
    });

    it('いいね追加時に投稿作者へ通知を作成する', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as any).mockReturnValueOnce({ insert: mockInsert });

      const mockSingle = vi.fn().mockResolvedValue({
        data: { author_id: 'author-789' },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValueOnce({ select: mockSelect });

      vi.mocked(NotificationService.createNotification).mockResolvedValue({
        success: true,
      });

      // Act
      await PostsService.addLike('user-123', 1);

      // Assert
      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        'author-789',
        'like',
        'user-123',
        1
      );
    });

    it('データベースエラー時にエラーを返す', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({
        error: { message: 'Database error' },
      });
      (supabase.from as any).mockReturnValue({ insert: mockInsert });

      // Act
      const result = await PostsService.addLike('user-123', 1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('removeLike', () => {
    it('いいねを削除できる', async () => {
      // Arrange
      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ delete: mockDelete });

      // Act
      const result = await PostsService.removeLike('user-123', 1);

      // Assert
      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('データベースエラー時にエラーを返す', async () => {
      // Arrange
      const mockEq2 = vi.fn().mockResolvedValue({
        error: { message: 'Delete error' },
      });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ delete: mockDelete });

      // Act
      const result = await PostsService.removeLike('user-123', 1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete error');
    });
  });

  describe('getStatistics', () => {
    it('統計情報を取得できる', async () => {
      // Arrange
      const mockProfiles = vi.fn().mockResolvedValue({ count: 100, error: null });
      const mockPosts = vi.fn().mockResolvedValue({ count: 500, error: null });
      const mockLikes = vi.fn().mockResolvedValue({ count: 2000, error: null });
      const mockViews = vi.fn().mockResolvedValue({ count: 10000, error: null });

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn().mockReturnValue(mockProfiles) })
        .mockReturnValueOnce({ select: vi.fn().mockReturnValue(mockPosts) })
        .mockReturnValueOnce({ select: vi.fn().mockReturnValue(mockLikes) })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue(mockViews),
          }),
        });

      // Act
      const result = await PostsService.getStatistics();

      // Assert
      expect(result.userCount).toBe(100);
      expect(result.postCount).toBe(500);
      expect(result.totalLikes).toBe(2000);
      expect(result.monthlyViews).toBe(10000);
    });

    it('エラー時は0を返す', async () => {
      // Arrange
      const mockError = { message: 'Database error' };
      (supabase.from as any)
        .mockReturnValueOnce({
          select: vi.fn().mockResolvedValue({ count: null, error: mockError }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockResolvedValue({ count: null, error: mockError }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockResolvedValue({ count: null, error: mockError }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: null, error: mockError }),
          }),
        });

      // Act
      const result = await PostsService.getStatistics();

      // Assert
      expect(result.userCount).toBe(0);
      expect(result.postCount).toBe(0);
      expect(result.totalLikes).toBe(0);
      expect(result.monthlyViews).toBe(0);
      expect(result.error).toBe('Database error');
    });
  });

  describe('formatPostForWorkCard', () => {
    it('投稿データをWorkCard用にフォーマットできる', async () => {
      // Arrange
      const mockPost: any = {
        id: 1,
        author_id: 'user-123',
        type: 'illustration',
        title: 'Test Work',
        description: 'Test Description',
        thumbnail_url: 'https://example.com/thumb.jpg',
        is_r18: false,
        created_at: '2025-01-16T10:00:00Z',
        author: {
          id: 'user-123',
          username: 'testuser',
          display_name: 'Test User',
          university: 'Test University',
          status: 'student',
          is_creator: false,
          created_at: '2025-01-01T00:00:00Z',
        },
        images: [],
        tags: [
          { id: 1, name: 'オリジナル' },
          { id: 2, name: 'ファンタジー' },
        ],
        like_count: 50,
        view_count: 200,
      };

      // Act
      const result = PostsService.formatPostForWorkCard(mockPost);

      // Assert
      expect(result.id).toBe('1');
      expect(result.title).toBe('Test Work');
      expect(result.thumbnail).toBe('https://example.com/thumb.jpg');
      expect(result.authorDisplayName).toBe('Test User@Test University');
      expect(result.authorUsername).toBe('testuser');
      expect(result.likes).toBe(50);
      expect(result.views).toBe(200);
      expect(result.tags).toEqual(['オリジナル', 'ファンタジー']);
    });
  });
});
