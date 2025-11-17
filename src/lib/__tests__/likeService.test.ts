/**
 * LikeService のテストコード
 * このファイルは *.test.ts 形式のため、本番ビルドには含まれません
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LikeService } from '../likeService';
import { supabase } from '../supabaseClient';
import { NotificationService } from '../notificationService';

// 依存モジュールをモック化
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../notificationService');

describe('LikeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserLikeStats', () => {
    it('ユーザーのいいね統計を取得できる', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          total_likes_available: 20,
          total_likes_used: 5,
        },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.getUserLikeStats('user-123');

      // Assert
      expect(result.stats).not.toBeNull();
      expect(result.stats?.available).toBe(20);
      expect(result.stats?.used).toBe(5);
      expect(result.stats?.remaining).toBe(15);
    });

    it('データが存在しない場合はデフォルト値を返す', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          total_likes_available: null,
          total_likes_used: null,
        },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.getUserLikeStats('user-123');

      // Assert
      expect(result.stats?.available).toBe(20);
      expect(result.stats?.used).toBe(0);
      expect(result.stats?.remaining).toBe(20);
    });
  });

  describe('addLike', () => {
    it('いいねを追加できる', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // レコードが存在しない
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq1 });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      const mockPostSingle = vi.fn().mockResolvedValue({
        data: { author_id: 'author-456' },
        error: null,
      });
      const mockPostEq = vi.fn().mockReturnValue({ single: mockPostSingle });
      const mockPostSelect = vi.fn().mockReturnValue({ eq: mockPostEq });

      (supabase.from as any)
        .mockReturnValueOnce({ select: mockSelectCheck })
        .mockReturnValueOnce({ insert: mockInsert })
        .mockReturnValueOnce({ select: mockPostSelect });

      vi.mocked(NotificationService.createNotification).mockResolvedValue({
        success: true,
      });

      // Act
      const result = await LikeService.addLike(123, 'user-789');

      // Assert
      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        post_id: 123,
        user_id: 'user-789',
        count: 1,
        created_at: expect.any(String),
      });
    });

    it('いいね追加時に投稿作者へ通知を作成する', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq1 });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      const mockPostSingle = vi.fn().mockResolvedValue({
        data: { author_id: 'author-456' },
        error: null,
      });
      const mockPostEq = vi.fn().mockReturnValue({ single: mockPostSingle });
      const mockPostSelect = vi.fn().mockReturnValue({ eq: mockPostEq });

      (supabase.from as any)
        .mockReturnValueOnce({ select: mockSelectCheck })
        .mockReturnValueOnce({ insert: mockInsert })
        .mockReturnValueOnce({ select: mockPostSelect });

      vi.mocked(NotificationService.createNotification).mockResolvedValue({
        success: true,
      });

      // Act
      await LikeService.addLike(123, 'user-789');

      // Assert
      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        'author-456',
        'like',
        'user-789',
        123
      );
    });

    it('既にいいねしている場合はエラーを返す', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: { count: 1 },
        error: null,
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq1 });

      (supabase.from as any).mockReturnValue({ select: mockSelectCheck });

      // Act
      const result = await LikeService.addLike(123, 'user-789');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('この作品には既にいいねしています');
    });

    it('データベースエラー時にエラーを返す', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq1 });

      const mockInsert = vi.fn().mockResolvedValue({
        error: { message: 'Database error' },
      });

      (supabase.from as any)
        .mockReturnValueOnce({ select: mockSelectCheck })
        .mockReturnValueOnce({ insert: mockInsert });

      // Act
      const result = await LikeService.addLike(123, 'user-789');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('removeLike', () => {
    it('いいねを削除できる', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: { count: 1 },
        error: null,
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq1 });

      const mockDeleteEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockDeleteEq1 = vi.fn().mockReturnValue({ eq: mockDeleteEq2 });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq1 });

      (supabase.from as any)
        .mockReturnValueOnce({ select: mockSelectCheck })
        .mockReturnValueOnce({ delete: mockDelete });

      // Act
      const result = await LikeService.removeLike(123, 'user-789');

      // Assert
      expect(result.success).toBe(true);
      expect(result.currentCount).toBe(0);
    });

    it('いいねが存在しない場合はエラーを返す', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq1 });

      (supabase.from as any).mockReturnValue({ select: mockSelectCheck });

      // Act
      const result = await LikeService.removeLike(123, 'user-789');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('いいねが見つかりません');
    });
  });

  describe('checkUserLike', () => {
    it('ユーザーがいいねしている場合はtrueを返す', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: { count: 1 },
        error: null,
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.checkUserLike(123, 'user-789');

      // Assert
      expect(result.isLiked).toBe(true);
      expect(result.count).toBe(1);
    });

    it('ユーザーがいいねしていない場合はfalseを返す', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.checkUserLike(123, 'user-789');

      // Assert
      expect(result.isLiked).toBe(false);
      expect(result.count).toBe(0);
    });
  });

  describe('getLikeCount', () => {
    it('投稿のいいね数を取得できる', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: { total_likes: 42 },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.getLikeCount(123);

      // Assert
      expect(result.count).toBe(42);
    });

    it('レコードが存在しない場合は0を返す', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.getLikeCount(123);

      // Assert
      expect(result.count).toBe(0);
    });
  });

  describe('getLikeCountsByPeriod', () => {
    it('期間別いいね数を取得できる', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          daily_likes: 5,
          weekly_likes: 20,
          monthly_likes: 50,
          total_likes: 100,
        },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.getLikeCountsByPeriod(123);

      // Assert
      expect(result.counts).not.toBeNull();
      expect(result.counts?.daily).toBe(5);
      expect(result.counts?.weekly).toBe(20);
      expect(result.counts?.monthly).toBe(50);
      expect(result.counts?.total).toBe(100);
    });

    it('レコードが存在しない場合は全て0を返す', async () => {
      // Arrange
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.getLikeCountsByPeriod(123);

      // Assert
      expect(result.counts).not.toBeNull();
      expect(result.counts?.daily).toBe(0);
      expect(result.counts?.weekly).toBe(0);
      expect(result.counts?.monthly).toBe(0);
      expect(result.counts?.total).toBe(0);
    });
  });

  describe('getLikeCountsByPeriodForPosts', () => {
    it('複数の投稿の期間別いいね数を一括取得できる', async () => {
      // Arrange
      const postIds = [1, 2, 3];
      const mockData = [
        { post_id: 1, total_likes: 100 },
        { post_id: 2, total_likes: 50 },
        { post_id: 3, total_likes: 75 },
      ];

      const mockIn = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.getLikeCountsByPeriodForPosts(postIds, 'total');

      // Assert
      expect(result.size).toBe(3);
      expect(result.get(1)).toBe(100);
      expect(result.get(2)).toBe(50);
      expect(result.get(3)).toBe(75);
    });

    it('空の配列を渡すと空のMapを返す', async () => {
      // Act
      const result = await LikeService.getLikeCountsByPeriodForPosts([], 'total');

      // Assert
      expect(result.size).toBe(0);
    });

    it('データが存在しない投稿は0を返す', async () => {
      // Arrange
      const postIds = [1, 2];
      const mockData = [
        { post_id: 1, daily_likes: 10 },
        // post_id: 2 のデータなし
      ];

      const mockIn = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await LikeService.getLikeCountsByPeriodForPosts(postIds, 'daily');

      // Assert
      expect(result.get(1)).toBe(10);
      expect(result.get(2)).toBe(0);
    });
  });
});
