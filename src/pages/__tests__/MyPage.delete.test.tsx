/**
 * MyPage 削除機能のテストコード
 * このファイルは *.test.tsx 形式のため、本番ビルドには含まれません
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyPage from '../MyPage';
import * as AuthContext from '../../contexts/SupabaseAuthContext';
import { MyPageService } from '../../lib/myPageService';
import { PostsService } from '../../lib/postsService';

// モック化
vi.mock('../../contexts/SupabaseAuthContext', () => ({
  useSupabaseAuth: vi.fn(),
}));

vi.mock('../../lib/myPageService');
vi.mock('../../lib/postsService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MyPage - 削除機能', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockProfile = {
    id: 'user-123',
    username: 'testuser',
    display_name: 'Test User',
    university: 'Test University',
    status: 'student' as const,
    is_creator: false,
    created_at: '2025-01-01T00:00:00Z',
  };

  const mockPosts = [
    {
      id: 1,
      author_id: 'user-123',
      type: 'illustration' as const,
      title: '削除テスト作品1',
      thumbnail_url: 'https://example.com/thumb1.jpg',
      is_r18: false,
      created_at: '2025-01-16T10:00:00Z',
      author: mockProfile,
      images: [],
      tags: [],
      like_count: 10,
      view_count: 100,
    },
    {
      id: 2,
      author_id: 'user-123',
      type: 'manga' as const,
      title: '削除テスト作品2',
      thumbnail_url: 'https://example.com/thumb2.jpg',
      is_r18: false,
      created_at: '2025-01-15T10:00:00Z',
      author: mockProfile,
      images: [],
      tags: [],
      like_count: 5,
      view_count: 50,
    },
  ];

  const mockStats = {
    worksCount: 2,
    followersCount: 10,
    followingCount: 5,
    totalLikes: 15,
    totalViews: 150,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (AuthContext.useSupabaseAuth as any).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      loading: false,
    });

    vi.mocked(MyPageService.getUserPosts).mockResolvedValue({
      posts: mockPosts,
    });

    vi.mocked(MyPageService.getUserPostCount).mockResolvedValue({
      count: 2,
    });

    vi.mocked(MyPageService.getUserLikedPosts).mockResolvedValue({
      posts: [],
    });

    vi.mocked(MyPageService.getFollowingUsers).mockResolvedValue({
      users: [],
    });

    vi.mocked(MyPageService.getFollowerUsers).mockResolvedValue({
      users: [],
    });

    vi.mocked(MyPageService.getUserStats).mockResolvedValue(mockStats);

    vi.mocked(PostsService.formatPostForWorkCard).mockImplementation((post: any) => ({
      id: String(post.id),
      title: post.title,
      thumbnail: post.thumbnail_url,
      authorDisplayName: `${post.author.display_name}@${post.author.university}`,
      authorUsername: post.author.username,
      likes: post.like_count,
      views: post.view_count,
      tags: [],
      isR18: post.is_r18,
    }));
  });

  it('作品カードにホバーすると削除ボタンが表示される', async () => {
    // Arrange
    renderWithRouter(<MyPage />);

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByText('削除テスト作品1')).toBeInTheDocument();
    });

    // Act - Find delete buttons (they're hidden by default with opacity-0)
    const deleteButtons = screen.getAllByTitle('削除');

    // Assert
    expect(deleteButtons).toHaveLength(2);
  });

  it('削除ボタンをクリックすると確認モーダルが表示される', async () => {
    // Arrange
    renderWithRouter(<MyPage />);

    await waitFor(() => {
      expect(screen.getByText('削除テスト作品1')).toBeInTheDocument();
    });

    // Act
    const deleteButtons = screen.getAllByTitle('削除');
    fireEvent.click(deleteButtons[0]);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('作品を削除しますか？')).toBeInTheDocument();
      expect(screen.getByText(/削除テスト作品1/)).toBeInTheDocument();
    });
  });

  it('モーダルでキャンセルボタンをクリックするとモーダルが閉じる', async () => {
    // Arrange
    renderWithRouter(<MyPage />);

    await waitFor(() => {
      expect(screen.getByText('削除テスト作品1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('削除');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('作品を削除しますか？')).toBeInTheDocument();
    });

    // Act
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('作品を削除しますか？')).not.toBeInTheDocument();
    });
  });

  it('削除を確認すると投稿が削除される', async () => {
    // Arrange
    vi.mocked(PostsService.deletePost).mockResolvedValue({ success: true });

    renderWithRouter(<MyPage />);

    await waitFor(() => {
      expect(screen.getByText('削除テスト作品1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('削除');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('作品を削除しますか？')).toBeInTheDocument();
    });

    // Act
    const confirmButton = screen.getByText('削除する');
    fireEvent.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(PostsService.deletePost).toHaveBeenCalledWith(1, 'user-123');
    });
  });

  it('削除成功後、UIから作品が除外される', async () => {
    // Arrange
    vi.mocked(PostsService.deletePost).mockResolvedValue({ success: true });

    renderWithRouter(<MyPage />);

    await waitFor(() => {
      expect(screen.getByText('削除テスト作品1')).toBeInTheDocument();
      expect(screen.getByText('削除テスト作品2')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('削除');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('作品を削除しますか？')).toBeInTheDocument();
    });

    // Act
    const confirmButton = screen.getByText('削除する');
    fireEvent.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('削除テスト作品1')).not.toBeInTheDocument();
      expect(screen.getByText('削除テスト作品2')).toBeInTheDocument(); // 2つ目は残る
    });
  });

  it('削除失敗時はエラーメッセージを表示する', async () => {
    // Arrange
    vi.mocked(PostsService.deletePost).mockResolvedValue({
      success: false,
      error: '削除に失敗しました',
    });

    // window.alertをモック
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithRouter(<MyPage />);

    await waitFor(() => {
      expect(screen.getByText('削除テスト作品1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('削除');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('作品を削除しますか？')).toBeInTheDocument();
    });

    // Act
    const confirmButton = screen.getByText('削除する');
    fireEvent.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('削除に失敗しました: 削除に失敗しました');
    });

    // 作品は削除されない
    expect(screen.getByText('削除テスト作品1')).toBeInTheDocument();

    alertMock.mockRestore();
  });

  it('削除中は削除ボタンが無効化される', async () => {
    // Arrange
    let resolveDelete: (value: any) => void;
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve;
    });

    vi.mocked(PostsService.deletePost).mockReturnValue(deletePromise as any);

    renderWithRouter(<MyPage />);

    await waitFor(() => {
      expect(screen.getByText('削除テスト作品1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('削除');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('作品を削除しますか？')).toBeInTheDocument();
    });

    // Act
    const confirmButton = screen.getByText('削除する');
    fireEvent.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('削除中...')).toBeInTheDocument();
      expect(screen.getByText('削除中...')).toBeDisabled();
    });

    // Cleanup - resolve the promise to prevent timeout
    resolveDelete!({ success: true });
  });
});
