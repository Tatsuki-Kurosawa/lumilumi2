/**
 * NotificationService のテストコード
 * このファイルは *.test.ts 形式のため、本番ビルドには含まれません
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from '../notificationService';
import { supabase } from '../supabaseClient';

// Supabaseクライアントをモック化
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    describe('いいね通知の作成', () => {
      it('正常にいいね通知を作成できる', async () => {
        // Arrange
        const mockInsert = vi.fn().mockResolvedValue({ error: null });
        (supabase.from as any).mockReturnValue({
          insert: mockInsert,
        });

        // Act
        const result = await NotificationService.createNotification(
          'user-123',
          'like',
          'actor-456',
          789
        );

        // Assert
        expect(result.success).toBe(true);
        expect(supabase.from).toHaveBeenCalledWith('notifications');
        expect(mockInsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          type: 'like',
          actor_id: 'actor-456',
          post_id: 789,
        });
      });
    });

    describe('フォロー通知の作成', () => {
      it('正常にフォロー通知を作成できる', async () => {
        // Arrange
        const mockInsert = vi.fn().mockResolvedValue({ error: null });
        (supabase.from as any).mockReturnValue({
          insert: mockInsert,
        });

        // Act
        const result = await NotificationService.createNotification(
          'user-123',
          'follow',
          'actor-456'
        );

        // Assert
        expect(result.success).toBe(true);
        expect(mockInsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          type: 'follow',
          actor_id: 'actor-456',
          post_id: undefined,
        });
      });
    });

    describe('自分自身への通知', () => {
      it('自分自身への通知は作成しない', async () => {
        // Arrange
        const mockInsert = vi.fn();
        (supabase.from as any).mockReturnValue({
          insert: mockInsert,
        });

        // Act
        const result = await NotificationService.createNotification(
          'user-123',
          'like',
          'user-123',
          789
        );

        // Assert
        expect(result.success).toBe(true);
        expect(mockInsert).not.toHaveBeenCalled();
      });
    });

    describe('エラーハンドリング', () => {
      it('データベースエラー時にエラーメッセージを返す', async () => {
        // Arrange
        const mockInsert = vi.fn().mockResolvedValue({
          error: { message: 'Database error' },
        });
        (supabase.from as any).mockReturnValue({
          insert: mockInsert,
        });

        // Act
        const result = await NotificationService.createNotification(
          'user-123',
          'like',
          'actor-456',
          789
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBe('Database error');
      });
    });
  });

  describe('getNotifications', () => {
    it('ユーザーの通知を取得できる', async () => {
      // Arrange
      const mockNotifications = [
        {
          id: 1,
          user_id: 'user-123',
          type: 'like',
          actor_id: 'actor-456',
          post_id: 789,
          is_read: false,
          created_at: '2025-01-01T00:00:00Z',
          actor: {
            id: 'actor-456',
            username: 'testuser',
            display_name: 'Test User',
            university: 'Test University',
            avatar_url: null,
          },
          post: {
            id: 789,
            title: 'Test Post',
            thumbnail_url: 'https://example.com/thumb.jpg',
          },
        },
      ];

      const mockRange = vi.fn().mockResolvedValue({
        data: mockNotifications,
        error: null,
      });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await NotificationService.getNotifications('user-123');

      // Assert
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].type).toBe('like');
      expect(result.notifications[0].actor.username).toBe('testuser');
    });

    it('通知が存在しない場合は空配列を返す', async () => {
      // Arrange
      const mockRange = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await NotificationService.getNotifications('user-123');

      // Assert
      expect(result.notifications).toHaveLength(0);
    });
  });

  describe('getUnreadCount', () => {
    it('未読通知数を取得できる', async () => {
      // Arrange
      const mockEq2 = vi.fn().mockResolvedValue({ count: 5, error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await NotificationService.getUnreadCount('user-123');

      // Assert
      expect(result.count).toBe(5);
    });

    it('未読通知が0件の場合は0を返す', async () => {
      // Arrange
      const mockEq2 = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await NotificationService.getUnreadCount('user-123');

      // Assert
      expect(result.count).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('通知を既読にできる', async () => {
      // Arrange
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ update: mockUpdate });

      // Act
      const result = await NotificationService.markAsRead(1);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
    });
  });

  describe('markAllAsRead', () => {
    it('すべての未読通知を既読にできる', async () => {
      // Arrange
      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ update: mockUpdate });

      // Act
      const result = await NotificationService.markAllAsRead('user-123');

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('通知を削除できる', async () => {
      // Arrange
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ delete: mockDelete });

      // Act
      const result = await NotificationService.deleteNotification(1);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
