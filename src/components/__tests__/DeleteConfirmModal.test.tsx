/**
 * DeleteConfirmModal コンポーネントのテストコード
 * このファイルは *.test.tsx 形式のため、本番ビルドには含まれません
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    postTitle: 'テスト作品',
    isDeleting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('モーダルが閉じている場合は何も表示されない', () => {
    const { container } = render(
      <DeleteConfirmModal {...defaultProps} isOpen={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('モーダルが開いている場合は削除確認メッセージが表示される', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(screen.getByText('作品を削除しますか？')).toBeInTheDocument();
    expect(screen.getByText(/テスト作品/)).toBeInTheDocument();
    expect(
      screen.getByText('この操作は取り消すことができません。削除された作品は復元できません。')
    ).toBeInTheDocument();
  });

  it('投稿タイトルが正しく表示される', () => {
    render(<DeleteConfirmModal {...defaultProps} postTitle="マイ作品123" />);

    expect(screen.getByText(/マイ作品123/)).toBeInTheDocument();
  });

  it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('削除するボタンをクリックするとonConfirmが呼ばれる', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    const deleteButton = screen.getByText('削除する');
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('削除中は両方のボタンが無効化される', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    const cancelButton = screen.getByText('キャンセル');
    const deleteButton = screen.getByText('削除中...');

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('削除中はボタンのテキストが「削除中...」に変わる', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    expect(screen.getByText('削除中...')).toBeInTheDocument();
    expect(screen.queryByText('削除する')).not.toBeInTheDocument();
  });

  it('削除中はキャンセルボタンをクリックできない', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    // 削除中なのでonCloseは呼ばれない
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('削除中は削除ボタンをクリックできない', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    const deleteButton = screen.getByText('削除中...');
    fireEvent.click(deleteButton);

    // 削除中なので新たにonConfirmは呼ばれない
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
