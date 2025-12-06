import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { LikeService } from '../lib/likeService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface LikeButtonProps {
  postId: number;
  initialLikeCount?: number;
  onLoginRequired?: () => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikeCount = 0,
  onLoginRequired
}) => {
  const { user } = useSupabaseAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // 初期状態の読み込み
  useEffect(() => {
    loadTotalLikeCount(); // 総いいね数を取得
    if (user) {
      loadLikeState();
    }
  }, [user, postId]);

  const loadTotalLikeCount = async () => {
    const { count } = await LikeService.getLikeCount(postId);
    setLikeCount(count);
  };

  const loadLikeState = async () => {
    if (!user) return;

    const { isLiked: liked } = await LikeService.checkUserLike(postId, user.id);
    setIsLiked(liked);
  };

  // ハートボタンをクリックした時の処理（いいね/いいね解除を切り替え）
  const handleToggleLike = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isLiked) {
        // いいねを解除
        const { success, error } = await LikeService.removeLike(postId, user.id);

        if (success) {
          setIsLiked(false);
          // 総いいね数を再取得
          await loadTotalLikeCount();
        } else {
          alert(error || 'いいねの取り消しに失敗しました');
        }
      } else {
        // いいねを追加
        const { success, error } = await LikeService.addLike(postId, user.id);

        if (success) {
          setIsLiked(true);
          // 総いいね数を再取得
          await loadTotalLikeCount();
        } else {
          alert(error || 'いいねに失敗しました');
        }
      }
    } catch (error) {
      console.error('いいね処理エラー:', error);
      alert('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* ハートボタン（クリック可能） */}
      <button
        onClick={handleToggleLike}
        disabled={isLoading}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all
          ${isLiked
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${!user ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={user ? (isLiked ? 'いいねを解除' : 'いいねする') : 'ログインが必要です'}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current text-red-500' : 'text-gray-400'}`} />
        )}
        <span className="text-sm font-medium">{likeCount.toLocaleString()}</span>
      </button>
    </div>
  );
};

export default LikeButton;
