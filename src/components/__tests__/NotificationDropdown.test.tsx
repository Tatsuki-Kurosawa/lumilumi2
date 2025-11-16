/**
 * NotificationDropdown コンポーネントのテストコード
 * このファイルは *.test.tsx 形式のため、本番ビルドには含まれません
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationDropdown from '../NotificationDropdown';
import { NotificationService } from '../../lib/notificationService';
import * as AuthContext from '../../contexts/SupabaseAuthContext';

// NotificationServiceをモック化
vi.mock('../../lib/notificationService');

// AuthContextをモック化
vi.mock('../../contexts/SupabaseAuthContext', () => ({
  useSupabaseAuth: vi.fn(),
}));

// テスト用のコンポーネントラッパー
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NotificationDropdown', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockNotifications = [
    {
      id: 1,
      user_id: 'user-123',
      type: 'like' as const,
      actor_id: 'actor-456',
      post_id: 789,
      is_read: false,
      created_at: '2025-01-16T10:00:00Z',
      actor: {
        id: 'actor-456',
        username: 'testuser',
        display_name: 'Test User',
        university: 'Test University',
        status: 'student' as const,
        is_creator: false,
        created_at: '2025-01-01T00:00:00Z',
      },
      post: {
        id: 789,
        title: 'Test Post',
        thumbnail_url: 'https://example.com/thumb.jpg',
      },
    },
    {
      id: 2,
      user_id: 'user-123',
      type: 'follow' as const,
      actor_id: 'actor-789',
      is_read: true,
      created_at: '2025-01-15T10:00:00Z',
      actor: {
        id: 'actor-789',
        username: 'follower',
        display_name: 'Follower User',
        university: 'Test University',
        status: 'student' as const,
        is_creator: false,
        created_at: '2025-01-01T00:00:00Z',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    (AuthContext.useSupabaseAuth as any).mockReturnValue({
      user: mockUser,
      profile: null,
      loading: false,
    });

    vi.mocked(NotificationService.getNotifications).mockResolvedValue({
      notifications: mockNotifications,
    });

    vi.mocked(NotificationService.getUnreadCount).mockResolvedValue({
      count: 1,
    });

    vi.mocked(NotificationService.markAsRead).mockResolvedValue({
      success: true,
    });

    vi.mocked(NotificationService.markAllAsRead).mockResolvedValue({
      success: true,
    });
  });

  describe('表示', () => {
    it('ログインユーザーの場合、通知アイコンが表示される', () => {
      renderWithRouter(<NotificationDropdown />);
      const bellIcon = screen.getByRole('button');
      expect(bellIcon).toBeInTheDocument();
    });

    it('未ログインユーザーの場合、何も表示されない', () => {
      (AuthContext.useSupabaseAuth as any).mockReturnValue({
        user: null,
        profile: null,
        loading: false,
      });

      const { container } = renderWithRouter(<NotificationDropdown />);
      expect(container.firstChild).toBeNull();
    });

    it('未読通知数がバッジに表示される', async () => {
      renderWithRouter(<NotificationDropdown />);

      await waitFor(() => {
        const badge = screen.getByText('1');
        expect(badge).toBeInTheDocument();
      });
    });

    it('未読通知が10件以上の場合、"9+"と表示される', async () => {
      vi.mocked(NotificationService.getUnreadCount).mockResolvedValue({
        count: 15,
      });

      renderWithRouter(<NotificationDropdown />);

      await waitFor(() => {
        const badge = screen.getByText('9+');
        expect(badge).toBeInTheDocument();
      });
    });
  });

  describe('ドロップダウンの開閉', () => {
    it('アイコンをクリックするとドロップダウンが開く', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('通知')).toBeInTheDocument();
      });
    });

    it('ドロップダウンを開くと通知が取得される', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(NotificationService.getNotifications).toHaveBeenCalledWith(
          'user-123',
          10,
          0
        );
      });
    });

    it('通知がない場合、"通知はありません"と表示される', async () => {
      vi.mocked(NotificationService.getNotifications).mockResolvedValue({
        notifications: [],
      });
      vi.mocked(NotificationService.getUnreadCount).mockResolvedValue({
        count: 0,
      });

      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('通知はありません')).toBeInTheDocument();
      });
    });
  });

  describe('通知の表示', () => {
    it('いいね通知が正しく表示される', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/Test Userさんがあなたの作品「Test Post」にいいねしました/)
        ).toBeInTheDocument();
      });
    });

    it('フォロー通知が正しく表示される', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/Follower Userさんがあなたをフォローしました/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('通知の既読化', () => {
    it('未読通知をクリックすると既読になる', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const notification = screen.getByText(
          /Test Userさんがあなたの作品「Test Post」にいいねしました/
        );
        fireEvent.click(notification);
      });

      expect(NotificationService.markAsRead).toHaveBeenCalledWith(1);
    });

    it('"すべて既読"ボタンをクリックすると全通知が既読になる', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const markAllButton = screen.getByText('すべて既読');
        fireEvent.click(markAllButton);
      });

      expect(NotificationService.markAllAsRead).toHaveBeenCalledWith('user-123');
    });
  });

  describe('通知のリンク', () => {
    it('いいね通知をクリックすると投稿詳細ページに遷移する', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const notification = screen.getByText(
          /Test Userさんがあなたの作品「Test Post」にいいねしました/
        );
        const link = notification.closest('a');
        expect(link).toHaveAttribute('href', '/works/789');
      });
    });

    it('フォロー通知をクリックするとユーザープロフィールページに遷移する', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const notification = screen.getByText(
          /Follower Userさんがあなたをフォローしました/
        );
        const link = notification.closest('a');
        expect(link).toHaveAttribute('href', '/user/follower');
      });
    });
  });
});
