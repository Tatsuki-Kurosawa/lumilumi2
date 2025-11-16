/**
 * 投稿機能の統合テストコード
 * このファイルは *.test.tsx 形式のため、本番ビルドには含まれません
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PostsService } from '../lib/postsService';
import { PageViewService } from '../lib/pageViewService';
import { NotificationService } from '../lib/notificationService';
import { supabase } from '../lib/supabaseClient';
import UploadPage from '../pages/UploadPage';
import * as AuthContext from '../contexts/SupabaseAuthContext';

// モック化
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

vi.mock('../lib/pageViewService');
vi.mock('../lib/notificationService');

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

describe('投稿機能の統合テスト', () => {
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

  const mockSession = {
    access_token: 'mock-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (AuthContext.useSupabaseAuth as any).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      session: mockSession,
      loading: false,
    });

    global.FileReader = class {
      result: string | null = null;
      onload: ((event: any) => void) | null = null;
      readAsDataURL(file: File) {
        this.result = `data:image/png;base64,mockbase64`;
        if (this.onload) {
          this.onload({ target: { result: this.result } });
        }
      }
    } as any;

    global.alert = vi.fn();
  });

  describe('投稿作成から表示までの流れ', () => {
    it('投稿を作成し、作成した投稿を取得できる', async () => {
      // Arrange - 投稿作成のモック
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'user-123/123456_test.png' },
        error: null,
      });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/test.png' },
      });
      (supabase.storage.from as any).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const newPostId = 123;
      const mockPostInsert = vi.fn().mockResolvedValue({
        data: { id: newPostId },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: newPostId }, error: null }),
      });
      const mockImagesInsert = vi.fn().mockResolvedValue({ error: null });
      const mockTagsUpsert = vi.fn().mockResolvedValue({
        data: [{ id: 1, name: 'オリジナル' }],
        error: null,
      });
      const mockPostTagsInsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any)
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({ select: mockSelect }),
        })
        .mockReturnValueOnce({ insert: mockImagesInsert })
        .mockReturnValueOnce({
          upsert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ id: 1, name: 'オリジナル' }],
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({ insert: mockPostTagsInsert });

      renderWithRouter(<UploadPage />);

      const titleInput = screen.getByPlaceholderText('作品のタイトルを入力');
      const descriptionInput = screen.getByPlaceholderText('作品の説明を入力');
      const tagInput = screen.getByPlaceholderText('タグを入力');
      const addTagButton = screen.getByText('追加');
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(mockFile, 'size', { value: 1000000 });

      // Act - 投稿作成
      fireEvent.change(titleInput, { target: { value: 'テスト投稿' } });
      fireEvent.change(descriptionInput, { target: { value: 'これはテスト投稿です' } });
      fireEvent.change(tagInput, { target: { value: 'オリジナル' } });
      fireEvent.click(addTagButton);
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        const submitButton = screen.getByText('投稿する');
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByText('投稿する');
      fireEvent.click(submitButton);

      // Assert - 投稿が作成された
      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });

      // Arrange - 作成した投稿を取得
      const mockPost = {
        id: newPostId,
        author_id: 'user-123',
        type: 'illustration',
        title: 'テスト投稿',
        description: 'これはテスト投稿です',
        thumbnail_url: 'https://example.com/test.png',
        is_r18: false,
        created_at: '2025-01-16T10:00:00Z',
        author: mockProfile,
        images: [
          {
            id: 1,
            post_id: newPostId,
            image_url: 'https://example.com/test.png',
            display_order: 1,
          },
        ],
        tags: [{ tag: { id: 1, name: 'オリジナル' } }],
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockPost, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelectPost = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelectPost });

      vi.mocked(PageViewService.getViewCountsForPosts).mockResolvedValue(new Map([[newPostId, 0]]));
      vi.spyOn(PostsService, 'getLikeCountsForPosts').mockResolvedValue(new Map([[newPostId, 0]]));

      // Act - 投稿を取得
      const result = await PostsService.getPostById(newPostId.toString());

      // Assert - 投稿が正しく取得できる
      expect(result.post).not.toBeNull();
      expect(result.post?.title).toBe('テスト投稿');
      expect(result.post?.description).toBe('これはテスト投稿です');
      expect(result.post?.tags.length).toBe(1);
      expect(result.post?.tags[0].name).toBe('オリジナル');
    });
  });

  describe('投稿へのいいね機能', () => {
    it('投稿にいいねを付けると、いいね数が増加し、作者に通知が送られる', async () => {
      // Arrange
      const postId = 100;
      const authorId = 'author-456';
      const likerId = 'user-123';

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as any).mockReturnValueOnce({ insert: mockInsert });

      const mockSingle = vi.fn().mockResolvedValue({
        data: { author_id: authorId },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValueOnce({ select: mockSelect });

      vi.mocked(NotificationService.createNotification).mockResolvedValue({
        success: true,
      });

      // Act - いいねを追加
      const result = await PostsService.addLike(likerId, postId);

      // Assert - いいねが追加され、通知が作成された
      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: likerId,
        post_id: postId,
      });
      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        authorId,
        'like',
        likerId,
        postId
      );

      // Arrange - いいね数を確認
      const mockLikeCount = vi.fn().mockResolvedValue({ count: 1, error: null });
      const mockLikeEq = vi.fn().mockReturnValue(mockLikeCount);
      const mockLikeSelect = vi.fn().mockReturnValue({ eq: mockLikeEq });
      (supabase.from as any).mockReturnValue({ select: mockLikeSelect });

      // Act - いいね数を取得
      const likeCountResult = await PostsService.getLikeCount(postId);

      // Assert - いいね数が増加している
      expect(likeCountResult.count).toBe(1);
    });

    it('いいねを削除すると、いいね数が減少する', async () => {
      // Arrange
      const postId = 100;
      const userId = 'user-123';

      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
      (supabase.from as any).mockReturnValue({ delete: mockDelete });

      // Act - いいねを削除
      const result = await PostsService.removeLike(userId, postId);

      // Assert - いいねが削除された
      expect(result.success).toBe(true);

      // Arrange - いいね数を確認
      const mockLikeCount = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockLikeEq = vi.fn().mockReturnValue(mockLikeCount);
      const mockLikeSelect = vi.fn().mockReturnValue({ eq: mockLikeEq });
      (supabase.from as any).mockReturnValue({ select: mockLikeSelect });

      // Act - いいね数を取得
      const likeCountResult = await PostsService.getLikeCount(postId);

      // Assert - いいね数が減少している
      expect(likeCountResult.count).toBe(0);
    });
  });

  describe('カテゴリ別投稿取得', () => {
    it('マンガカテゴリの投稿のみを取得できる', async () => {
      // Arrange
      const mockMangaPosts = [
        {
          id: 1,
          author_id: 'user-123',
          type: 'manga',
          title: 'マンガ作品1',
          description: 'マンガ説明',
          thumbnail_url: 'https://example.com/manga1.jpg',
          is_r18: false,
          created_at: '2025-01-16T10:00:00Z',
          author: mockProfile,
          images: [],
          tags: [],
        },
        {
          id: 2,
          author_id: 'user-123',
          type: 'manga',
          title: 'マンガ作品2',
          description: 'マンガ説明2',
          thumbnail_url: 'https://example.com/manga2.jpg',
          is_r18: false,
          created_at: '2025-01-16T09:00:00Z',
          author: mockProfile,
          images: [],
          tags: [],
        },
      ];

      const mockRange = vi.fn().mockResolvedValue({ data: mockMangaPosts, error: null });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      vi.mocked(PageViewService.getViewCountsForPosts).mockResolvedValue(
        new Map([
          [1, 100],
          [2, 50],
        ])
      );
      vi.spyOn(PostsService, 'getLikeCountsForPosts').mockResolvedValue(
        new Map([
          [1, 10],
          [2, 5],
        ])
      );

      // Act
      const result = await PostsService.getPostsByCategory('manga');

      // Assert
      expect(result.posts).toHaveLength(2);
      expect(result.posts[0].type).toBe('manga');
      expect(result.posts[1].type).toBe('manga');
      expect(mockEq).toHaveBeenCalledWith('type', 'manga');
    });

    it('イラストカテゴリの投稿のみを取得できる', async () => {
      // Arrange
      const mockIllustrationPosts = [
        {
          id: 3,
          author_id: 'user-456',
          type: 'illustration',
          title: 'イラスト作品1',
          description: 'イラスト説明',
          thumbnail_url: 'https://example.com/illust1.jpg',
          is_r18: false,
          created_at: '2025-01-16T10:00:00Z',
          author: {
            id: 'user-456',
            username: 'artist',
            display_name: 'Artist User',
            university: 'Art University',
            status: 'student' as const,
            is_creator: false,
            created_at: '2025-01-01T00:00:00Z',
          },
          images: [],
          tags: [],
        },
      ];

      const mockRange = vi.fn().mockResolvedValue({ data: mockIllustrationPosts, error: null });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      vi.mocked(PageViewService.getViewCountsForPosts).mockResolvedValue(new Map([[3, 200]]));
      vi.spyOn(PostsService, 'getLikeCountsForPosts').mockResolvedValue(new Map([[3, 20]]));

      // Act
      const result = await PostsService.getPostsByCategory('illustration');

      // Assert
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].type).toBe('illustration');
      expect(mockEq).toHaveBeenCalledWith('type', 'illustration');
    });
  });

  describe('投稿のフォーマット変換', () => {
    it('投稿データをWorkCard用にフォーマットできる', () => {
      // Arrange
      const mockPost: any = {
        id: 100,
        author_id: 'user-123',
        type: 'illustration',
        title: 'フォーマットテスト',
        description: 'テスト説明',
        thumbnail_url: 'https://example.com/format-test.jpg',
        is_r18: false,
        created_at: '2025-01-16T10:00:00Z',
        author: {
          id: 'user-123',
          username: 'formatuser',
          display_name: 'Format User',
          university: 'Format University',
          status: 'student',
          is_creator: false,
          created_at: '2025-01-01T00:00:00Z',
        },
        images: [],
        tags: [
          { id: 1, name: 'タグ1' },
          { id: 2, name: 'タグ2' },
        ],
        like_count: 100,
        view_count: 500,
      };

      // Act
      const formatted = PostsService.formatPostForWorkCard(mockPost);

      // Assert
      expect(formatted.id).toBe('100');
      expect(formatted.title).toBe('フォーマットテスト');
      expect(formatted.thumbnail).toBe('https://example.com/format-test.jpg');
      expect(formatted.authorDisplayName).toBe('Format User@Format University');
      expect(formatted.authorUsername).toBe('formatuser');
      expect(formatted.likes).toBe(100);
      expect(formatted.views).toBe(500);
      expect(formatted.tags).toEqual(['タグ1', 'タグ2']);
    });
  });

  describe('統計情報の取得', () => {
    it('全体の統計情報を取得できる', async () => {
      // Arrange
      const mockProfiles = vi.fn().mockResolvedValue({ count: 150, error: null });
      const mockPosts = vi.fn().mockResolvedValue({ count: 600, error: null });
      const mockLikes = vi.fn().mockResolvedValue({ count: 2500, error: null });
      const mockViews = vi.fn().mockResolvedValue({ count: 15000, error: null });

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
      expect(result.userCount).toBe(150);
      expect(result.postCount).toBe(600);
      expect(result.totalLikes).toBe(2500);
      expect(result.monthlyViews).toBe(15000);
    });
  });

  describe('複数投稿のいいね数一括取得', () => {
    it('複数の投稿のいいね数を一度に取得できる', async () => {
      // Arrange
      const postIds = [1, 2, 3, 4, 5];
      const mockLikeCounts = [
        { post_id: 1, total_likes: 100 },
        { post_id: 2, total_likes: 50 },
        { post_id: 3, total_likes: 75 },
        { post_id: 4, total_likes: 0 },
        { post_id: 5, total_likes: 200 },
      ];

      const mockIn = vi.fn().mockResolvedValue({ data: mockLikeCounts, error: null });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // Act
      const result = await PostsService.getLikeCountsForPosts(postIds);

      // Assert
      expect(result.size).toBe(5);
      expect(result.get(1)).toBe(100);
      expect(result.get(2)).toBe(50);
      expect(result.get(3)).toBe(75);
      expect(result.get(4)).toBe(0);
      expect(result.get(5)).toBe(200);
      expect(mockIn).toHaveBeenCalledWith('post_id', postIds);
    });
  });
});
