import React, { useState, useEffect } from 'react';
import { Heart, Loader2, Plus, Minus } from 'lucide-react';
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

  const handleAddLike = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const { success, error } = await LikeService.addLike(postId, user.id);

      if (success) {
        setIsLiked(true);
        // 総いいね数を再取得
        await loadTotalLikeCount();
      } else {
        alert(error || 'いいねに失敗しました');
      }
    } catch (error) {
      console.error('いいね処理エラー:', error);
      alert('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLike = async () => {
    if (!user || !isLiked) {
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const { success, error } = await LikeService.removeLike(postId, user.id);

      if (success) {
        setIsLiked(false);
        // 総いいね数を再取得
        await loadTotalLikeCount();
      } else {
        alert(error || 'いいねの取り消しに失敗しました');
      }
    } catch (error) {
      console.error('いいね取り消しエラー:', error);
      alert('予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const canAddLike = user && !isLiked;
  const canRemoveLike = user && isLiked;

  return (
    <div className="relative inline-flex items-center space-x-2">
      {/* いいね情報表示 */}
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current text-red-500' : 'text-gray-400'}`} />
        <span className="text-sm font-medium text-gray-900">{likeCount}</span>
      </div>

      {/* いいね追加ボタン */}
      {user && (
        <button
          onClick={handleAddLike}
          disabled={isLoading || !canAddLike}
          className={`
            p-2 rounded-full transition-all
            ${canAddLike
              ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-110'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          title="いいねを追加"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      )}

      {/* いいね削除ボタン */}
      {user && isLiked && (
        <button
          onClick={handleRemoveLike}
          disabled={isLoading || !canRemoveLike}
          className={`
            p-2 rounded-full transition-all
            ${canRemoveLike
              ? 'bg-gray-300 text-gray-700 hover:bg-gray-400 hover:scale-110'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          title="いいねを取り消す"
        >
          <Minus className="h-4 w-4" />
        </button>
      )}

    </div>
  );
};

export default LikeButton;
