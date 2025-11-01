import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, Share2, Flag, User, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { PostsService } from '../lib/postsService';
import { UserProfileService } from '../lib/userProfileService';
import { PageViewService } from '../lib/pageViewService';
import { PostWithDetails } from '../types';
import LikeButton from '../components/LikeButton';

const WorkDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useSupabaseAuth();
  const [work, setWork] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 投稿データを取得
  useEffect(() => {
    const fetchWork = async () => {
      if (!id) return;

      setLoading(true);
      const { post, error } = await PostsService.getPostById(id);


      if (error) {
        setError(error);
      } else if (post) {
        setWork(post);

        // フォロー状態を確認
        if (user) {
          const { isFollowing: followStatus } = await UserProfileService.checkFollowStatusByUsername(user.id, post.author.username);
          setIsFollowing(followStatus);
        }

        // PVを記録（非同期で実行、エラーは無視）
        recordPageView(post.id);
      }

      setLoading(false);
    };

    fetchWork();
  }, [id, user]);

  // PVを記録する関数
  const recordPageView = async (postId: number) => {
    try {
      // IPアドレスを取得（非同期で実行、失敗しても続行）
      const ipAddress = await PageViewService.getUserIP().catch(() => null);

      // PVを記録
      const result = await PageViewService.recordPageView(
        postId,
        user?.id,
        ipAddress || undefined,
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      );

      if (result.success && result.isUnique) {
        // ユニークなPVが記録された場合、表示中のPV数を更新
        const { count } = await PageViewService.getViewCount(postId);
        setWork(prevWork => prevWork ? { ...prevWork, view_count: count } : null);
      }
    } catch (error) {
      // PV記録のエラーは静かに無視（ユーザー体験を損なわないため）
      console.error('PV記録エラー:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !work) {
      console.log('ログインしていないためフォローできません');
      return;
    }

    setFollowLoading(true);
    
    try {
      if (isFollowing) {
        // アンフォロー
        const { success } = await UserProfileService.unfollowUserByUsername(user.id, work.author.username);
        if (success) {
          setIsFollowing(false);
        }
      } else {
        // フォロー
        const { success } = await UserProfileService.followUserByUsername(user.id, work.author.username);
        if (success) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error('フォロー処理でエラーが発生:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    if (!work) return;
    
    if (navigator.share) {
      navigator.share({
        title: work.title,
        text: `${work.author.display_name}の作品「${work.title}」をチェック！`,
        url: window.location.href,
      });
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      alert('URLをクリップボードにコピーしました');
    }
  };

  const nextImage = () => {
    if (!work) return;
    setCurrentImageIndex((prev) => (prev + 1) % work.images.length);
  };

  const prevImage = () => {
    if (!work) return;
    setCurrentImageIndex((prev) => (prev - 1 + work.images.length) % work.images.length);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{error || '投稿が見つかりませんでした'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メイン画像エリア */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 画像表示 */}
            <div className="relative aspect-square bg-gray-100">
              <img
                src={work.images[currentImageIndex]?.image_url || work.thumbnail_url}
                alt={work.title}
                className="w-full h-full object-contain"
              />
              
              {/* 画像ナビゲーション */}
              {work.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  
                  {/* 画像インジケーター */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {work.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* サムネイル一覧 */}
            {work.images.length > 1 && (
              <div className="p-4 border-t">
                <div className="flex space-x-2 overflow-x-auto">
                  {work.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${work.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 作品情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{work.title}</h1>
            
            {/* 作者情報 */}
            <div className="flex items-center space-x-3 mb-6">
              <Link to={`/user/${work.author.username}`} className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {work.author.avatar_url ? (
                    <img
                      src={work.author.avatar_url}
                      alt={work.author.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{work.author.display_name}@{work.author.university}</h3>
                  <p className="text-sm text-gray-600">{work.author.status === 'student' ? '在学生' : work.author.status.toUpperCase()}</p>
                </div>
              </Link>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-3 mb-6">
              <LikeButton postId={work.id} />

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Share2 className="h-5 w-5" />
                <span>共有</span>
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Flag className="h-5 w-5" />
              </button>
            </div>

            {/* フォローボタン */}
            {user && work.author.id !== user.id && (
              <button 
                onClick={handleFollow}
                disabled={followLoading}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors mb-6 ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {followLoading ? '処理中...' : isFollowing ? 'フォロー解除' : 'フォローする'}
              </button>
            )}

            {/* 統計情報 */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />

                <span>{work.view_count.toLocaleString()} 回閲覧</span>

              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(work.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>

            {/* タグ */}
            <div>
              <div className="flex items-center mb-3">
                <Tag className="h-4 w-4 mr-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">タグ</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {work.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/works?tag=${tag.name}`}
                    className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 関連作品 - 今後実装予定 */}
        </div>
      </div>
    </div>
  );
};

export default WorkDetailPage;