import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Eye, Share2, Flag, User, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { PostsService } from '../lib/postsService';
import { PostWithDetails } from '../types';

const WorkDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useSupabaseAuth();
  const [work, setWork] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

        // いいね数を取得
        const { count } = await PostsService.getLikeCount(post.id);
        setLikeCount(count);

        // ログインユーザーがいいねしているか確認
        if (user) {
          const { liked } = await PostsService.checkUserLiked(user.id, post.id);
          setIsLiked(liked);
        }
      }

      setLoading(false);
    };

    fetchWork();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !work) {
      console.log('ログインしていないためいいねできません');
      return;
    }

    try {
      if (isLiked) {
        // いいねを削除
        const { success } = await PostsService.removeLike(user.id, work.id);
        if (success) {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // いいねを追加
        const { success } = await PostsService.addLike(user.id, work.id);
        if (success) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('いいね処理でエラーが発生:', error);

    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: work.title,
        text: `${work.author.name}の作品「${work.title}」をチェック！`,
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
              <Link to={`/user/${work.author.id}`} className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
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
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isLiked
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </button>
              
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
            {user && (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-6">
                フォローする
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