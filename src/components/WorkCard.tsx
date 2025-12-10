import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, User, Loader2 } from 'lucide-react';
import { LikeService } from '../lib/likeService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface Work {
  id: string;
  title: string;
  thumbnail: string;
  authorDisplayName: string; // 表示用
  authorUsername: string;   // リンク用
  likes: number;
  views: number;
  tags: string[];
}

interface WorkCardProps {
  work: Work;
  onLoginRequired?: () => void;
}

const WorkCard: React.FC<WorkCardProps> = ({ work, onLoginRequired }) => {
  const { user } = useSupabaseAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(work.likes);
  const [isLoading, setIsLoading] = useState(false);
  const postId = parseInt(work.id, 10);

  const loadTotalLikeCount = async () => {
    if (isNaN(postId)) return;
    const { count } = await LikeService.getLikeCount(postId);
    setLikeCount(count);
  };

  const loadLikeState = async () => {
    if (!user || isNaN(postId)) return;
    const { isLiked: liked } = await LikeService.checkUserLike(postId, user.id);
    setIsLiked(liked);
  };

  // 初期状態の読み込み
  useEffect(() => {
    if (!isNaN(postId)) {
      loadTotalLikeCount();
      if (user) {
        loadLikeState();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, postId]);

  // ハートボタンをクリックした時の処理（いいね/いいね解除を切り替え）
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      onLoginRequired?.();
      return;
    }

    if (isLoading || isNaN(postId)) return;

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
          console.error('いいねの取り消しに失敗:', error);
        }
      } else {
        // いいねを追加
        const { success, error } = await LikeService.addLike(postId, user.id);

        if (success) {
          setIsLiked(true);
          // 総いいね数を再取得
          await loadTotalLikeCount();
        } else {
          console.error('いいねに失敗:', error);
        }
      }
    } catch (error) {
      console.error('いいね処理エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-bg-base rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group">
      <Link to={`/works/${work.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={work.thumbnail}
            alt={work.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
        </div>
      </Link>
      
      <div className="p-3 sm:p-5">
        <Link to={`/works/${work.id}`}>
          <h3 className="font-semibold text-text-primary mb-2 sm:mb-3 line-clamp-2 hover:text-primary-500 transition-colors text-sm sm:text-base leading-snug">
            {work.title}
          </h3>
        </Link>
        
        <div className="flex items-center text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4">
          <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-text-tertiary" />
          <Link to={`/user/${encodeURIComponent(work.authorUsername)}`} className="hover:text-primary-500 transition-colors font-medium">
            {work.authorDisplayName}
          </Link>
        </div>
        
        <div className="flex items-center justify-between text-sm text-text-tertiary mb-4">
          <div className="flex items-center space-x-5">
            <button
              onClick={handleToggleLike}
              disabled={isLoading || isNaN(postId)}
              className={`flex items-center transition-all touch-manipulation ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80 active:opacity-60'
              } ${!user ? 'opacity-50' : ''}`}
              title={user ? (isLiked ? 'いいねを解除' : 'いいねする') : 'ログインが必要です'}
              style={{ minWidth: '44px', minHeight: '44px', padding: '4px 8px' }}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 mr-1.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              )}
              <span className="font-medium text-xs sm:text-sm">{likeCount.toLocaleString()}</span>
            </button>
            <div className="flex items-center">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />
              <span className="font-medium text-xs sm:text-sm">{work.views.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {work.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-bg-secondary text-text-secondary rounded-full hover:bg-primary-50 hover:text-primary-500 cursor-pointer transition-all font-medium"
            >
              #{tag}
            </span>
          ))}
          {work.tags.length > 3 && (
            <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-text-tertiary font-medium">
              +{work.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkCard;