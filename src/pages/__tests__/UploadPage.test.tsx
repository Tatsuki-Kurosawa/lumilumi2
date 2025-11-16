/**
 * UploadPage コンポーネントのテストコード
 * このファイルは *.test.tsx 形式のため、本番ビルドには含まれません
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UploadPage from '../UploadPage';
import * as AuthContext from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../lib/supabaseClient';

// モック化
vi.mock('../../contexts/SupabaseAuthContext', () => ({
  useSupabaseAuth: vi.fn(),
}));

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

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

describe('UploadPage', () => {
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
  });

  describe('認証状態による表示', () => {
    it('未ログイン時はログインを促すメッセージを表示する', () => {
      // Arrange
      (AuthContext.useSupabaseAuth as any).mockReturnValue({
        user: null,
        profile: null,
        session: null,
        loading: false,
      });

      // Act
      renderWithRouter(<UploadPage />);

      // Assert
      expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
      expect(screen.getByText('作品を投稿するにはログインしてください')).toBeInTheDocument();
    });

    it('ログイン時は投稿フォームを表示する', () => {
      // Arrange
      (AuthContext.useSupabaseAuth as any).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        session: mockSession,
        loading: false,
      });

      // Act
      renderWithRouter(<UploadPage />);

      // Assert
      expect(screen.getByText('作品を投稿')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('作品のタイトルを入力')).toBeInTheDocument();
    });
  });

  describe('フォーム入力', () => {
    beforeEach(() => {
      (AuthContext.useSupabaseAuth as any).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        session: mockSession,
        loading: false,
      });
    });

    it('タイトルを入力できる', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const titleInput = screen.getByPlaceholderText('作品のタイトルを入力') as HTMLInputElement;

      // Act
      fireEvent.change(titleInput, { target: { value: 'テスト作品' } });

      // Assert
      expect(titleInput.value).toBe('テスト作品');
    });

    it('説明を入力できる', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const descriptionInput = screen.getByPlaceholderText('作品の説明を入力') as HTMLTextAreaElement;

      // Act
      fireEvent.change(descriptionInput, { target: { value: 'これはテスト作品です' } });

      // Assert
      expect(descriptionInput.value).toBe('これはテスト作品です');
    });

    it('カテゴリを選択できる', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const categorySelect = screen.getByRole('combobox') as HTMLSelectElement;

      // Act
      fireEvent.change(categorySelect, { target: { value: 'manga' } });

      // Assert
      expect(categorySelect.value).toBe('manga');
    });

    it('R-18フラグを切り替えられる', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const r18Checkbox = screen.getByRole('checkbox') as HTMLInputElement;

      // Act
      fireEvent.click(r18Checkbox);

      // Assert
      expect(r18Checkbox.checked).toBe(true);

      // Act again
      fireEvent.click(r18Checkbox);

      // Assert
      expect(r18Checkbox.checked).toBe(false);
    });
  });

  describe('タグ機能', () => {
    beforeEach(() => {
      (AuthContext.useSupabaseAuth as any).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        session: mockSession,
        loading: false,
      });
    });

    it('タグを入力して追加できる', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const tagInput = screen.getByPlaceholderText('タグを入力') as HTMLInputElement;
      const addButton = screen.getByText('追加');

      // Act
      fireEvent.change(tagInput, { target: { value: 'オリジナル' } });
      fireEvent.click(addButton);

      // Assert
      expect(screen.getByText('オリジナル')).toBeInTheDocument();
      expect(tagInput.value).toBe(''); // 入力がクリアされる
    });

    it('Enterキーでタグを追加できる', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const tagInput = screen.getByPlaceholderText('タグを入力') as HTMLInputElement;

      // Act
      fireEvent.change(tagInput, { target: { value: 'ファンタジー' } });
      fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Assert
      expect(screen.getByText('ファンタジー')).toBeInTheDocument();
    });

    it('人気タグをクリックして追加できる', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const popularTagButton = screen.getAllByText('オリジナル')[0]; // 人気タグ一覧の「オリジナル」

      // Act
      fireEvent.click(popularTagButton);

      // Assert
      // 選択されたタグリストに追加されていることを確認（人気タグと選択済みタグの2つ表示される）
      expect(screen.getAllByText('オリジナル').length).toBeGreaterThan(1);
    });

    it('重複するタグは追加できない', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const tagInput = screen.getByPlaceholderText('タグを入力') as HTMLInputElement;
      const addButton = screen.getByText('追加');

      // Act - 1回目
      fireEvent.change(tagInput, { target: { value: 'テストタグ' } });
      fireEvent.click(addButton);

      // Act - 2回目（同じタグ）
      fireEvent.change(tagInput, { target: { value: 'テストタグ' } });
      fireEvent.click(addButton);

      // Assert - タグは1つだけ表示されている
      const tags = screen.getAllByText('テストタグ');
      expect(tags.length).toBe(1);
    });

    it('追加したタグを削除できる', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const tagInput = screen.getByPlaceholderText('タグを入力') as HTMLInputElement;
      const addButton = screen.getByText('追加');

      // Act - タグを追加
      fireEvent.change(tagInput, { target: { value: '削除テスト' } });
      fireEvent.click(addButton);

      // Assert - タグが追加されている
      expect(screen.getByText('削除テスト')).toBeInTheDocument();

      // Act - タグを削除
      const tagElement = screen.getByText('削除テスト');
      const deleteButton = tagElement.parentElement?.querySelector('button');
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      // Assert - タグが削除されている
      expect(screen.queryByText('削除テスト')).not.toBeInTheDocument();
    });
  });

  describe('画像アップロード', () => {
    beforeEach(() => {
      (AuthContext.useSupabaseAuth as any).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        session: mockSession,
        loading: false,
      });

      // FileReader のモック
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
    });

    it('画像を選択するとプレビューが表示される', async () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(mockFile, 'size', { value: 1000000 }); // 1MB

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      // Assert
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('複数の画像を選択できる', async () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const mockFile1 = new File(['dummy content 1'], 'test1.png', { type: 'image/png' });
      const mockFile2 = new File(['dummy content 2'], 'test2.png', { type: 'image/png' });
      Object.defineProperty(mockFile1, 'size', { value: 1000000 });
      Object.defineProperty(mockFile2, 'size', { value: 1000000 });

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile1, mockFile2] } });

      // Assert
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBe(2);
      });
    });
  });

  describe('フォーム送信', () => {
    beforeEach(() => {
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

    it('画像がない場合は送信できない', async () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const titleInput = screen.getByPlaceholderText('作品のタイトルを入力');
      const submitButton = screen.getByText('投稿する');

      // Act
      fireEvent.change(titleInput, { target: { value: 'テストタイトル' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('画像を少なくとも1枚アップロードしてください');
      });
    });

    it('必要な情報を入力して投稿できる', async () => {
      // Arrange
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'user-123/test.png' },
        error: null,
      });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/test.png' },
      });
      (supabase.storage.from as any).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const mockPostInsert = vi.fn().mockResolvedValue({
        data: { id: 123 },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 123 }, error: null }),
      });
      const mockImagesInsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any)
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({ select: mockSelect }),
        })
        .mockReturnValueOnce({ insert: mockImagesInsert });

      renderWithRouter(<UploadPage />);

      const titleInput = screen.getByPlaceholderText('作品のタイトルを入力');
      const descriptionInput = screen.getByPlaceholderText('作品の説明を入力');
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(mockFile, 'size', { value: 1000000 });

      // Act
      fireEvent.change(titleInput, { target: { value: 'テスト投稿' } });
      fireEvent.change(descriptionInput, { target: { value: 'テスト説明' } });
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        const submitButton = screen.getByText('投稿する');
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByText('投稿する');
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled();
      });
    });

    it('キャンセルボタンでトップページに戻る', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const cancelButton = screen.getByText('キャンセル');

      // Act
      fireEvent.click(cancelButton);

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('エラーハンドリング', () => {
    beforeEach(() => {
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

    it('10MBを超える画像はアップロードできない', () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const largeFile = new File(['dummy content'], 'large.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1000 * 1000 }); // 11MB

      // Act
      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      // Assert
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('10MBを超えているため、アップロードできません')
      );
    });

    it('画像形式以外のファイルはアップロードできない', async () => {
      // Arrange
      renderWithRouter(<UploadPage />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const textFile = new File(['text content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(textFile, 'size', { value: 1000 });

      // Act
      fireEvent.change(fileInput, { target: { files: [textFile] } });

      // Assert
      await waitFor(() => {
        const images = screen.queryAllByRole('img');
        // 画像以外はアップロードされないので、画像が表示されない
        expect(images.length).toBe(0);
      });
    });
  });
});
