import React, { useState, useEffect } from 'react';
import { Heart, Loader2, Plus, Minus } from 'lucide-react';
import { LikeService, LikeStats } from '../lib/likeService';
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
  const [userLikeCountForPost, setUserLikeCountForPost] = useState(0); // この作品に何回いいねしたか
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [userLikeStats, setUserLikeStats] = useState<LikeStats | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // 初期状態の読み込み
  useEffect(() => {
    loadTotalLikeCount(); // 総いいね数を取得
    if (user) {
      loadLikeState();
      loadUserLikeStats();
    }
  }, [user, postId]);

  const loadTotalLikeCount = async () => {
    const { count } = await LikeService.getLikeCount(postId);
    setLikeCount(count);
  };

  const loadLikeState = async () => {
    if (!user) return;

    const { isLiked: liked, count } = await LikeService.checkUserLike(postId, user.id);
    setIsLiked(liked);
    setUserLikeCountForPost(count);
  };

  const loadUserLikeStats = async () => {
    if (!user) return;

    const { stats } = await LikeService.getUserLikeStats(user.id);
    if (stats) {
      setUserLikeStats(stats);
    }
  };

  const handleAddLike = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const { success, error, currentCount } = await LikeService.addLike(postId, user.id);

      if (success) {
        setIsLiked(true);
        setUserLikeCountForPost(currentCount || userLikeCountForPost + 1);
        // 総いいね数とユーザー統計を再取得
        await Promise.all([loadTotalLikeCount(), loadUserLikeStats()]);
      } else {
        console.error('ここのいいねのエラーメッセージが出ている？');
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
      const { success, error, currentCount } = await LikeService.removeLike(postId, user.id);

      if (success) {
        const newCount = currentCount !== undefined ? currentCount : Math.max(0, userLikeCountForPost - 1);
        setUserLikeCountForPost(newCount);

        if (newCount === 0) {
          setIsLiked(false);
        }

        // 総いいね数とユーザー統計を再取得
        await Promise.all([loadTotalLikeCount(), loadUserLikeStats()]);
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

  const canAddLike = user && userLikeStats && userLikeStats.remaining > 0;
  const canRemoveLike = user && isLiked && userLikeCountForPost > 0;

  return (
    <div className="relative inline-flex items-center space-x-2">
      {/* いいね情報表示 */}
      <div
        className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current text-red-500' : 'text-gray-400'}`} />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">{likeCount}</span>
          {user && userLikeCountForPost > 0 && (
            <span className="text-xs text-gray-500">あなた: {userLikeCountForPost}回</span>
          )}
        </div>
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

      {/* ツールチップ */}
      {showTooltip && user && userLikeStats && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg">
          <div className="text-center">
            <div className="font-medium">いいね残り: {userLikeStats.remaining}回</div>
            <div className="text-gray-300 text-xs mt-1">
              使用済み: {userLikeStats.used} / {userLikeStats.available}
            </div>
            {userLikeCountForPost > 0 && (
              <div className="text-red-300 text-xs mt-1 pt-1 border-t border-gray-700">
                この作品: {userLikeCountForPost}回
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {/* いいね回数が0の場合の警告 */}
      {showTooltip && user && userLikeStats && userLikeStats.remaining === 0 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg">
          <div className="text-center font-medium">
            いいね可能回数を使い切りました
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-red-600"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikeButton;
