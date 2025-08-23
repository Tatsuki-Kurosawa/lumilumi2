import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Eye, Share2, Flag, User, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WorkDetailPage: React.FC = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ダミーデータ
  const work = {
    id: id || '1',
    title: '夏の思い出',
    images: [
      'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    author: {
      id: 'user1',
      name: '太郎@東京大学',
      avatar: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=100',
      worksCount: 45,
      followersCount: 234,
      isFollowing: false,
    },
    likes: 245,
    views: 1520,
    tags: ['イラスト', '夏', '青春', 'デジタル', '風景'],
    createdAt: '2024-01-15',
    isR18: false,
  };

  const relatedWorks = [
    {
      id: '2',
      title: '都市の夜景',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=300',
      author: '花子@京都大学og',
      likes: 189,
      views: 892,
    },
    {
      id: '3',
      title: 'キャラクターデザイン',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=300',
      author: '次郎@大阪大学',
      likes: 312,
      views: 2140,
    },
  ];

  const handleLike = () => {
    if (!isAuthenticated) {
      // ログインモーダルを表示する処理
      return;
    }
    setIsLiked(!isLiked);
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
    setCurrentImageIndex((prev) => (prev + 1) % work.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + work.images.length) % work.images.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メイン画像エリア */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 画像表示 */}
            <div className="relative aspect-square bg-gray-100">
              <img
                src={work.images[currentImageIndex]}
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
                    {work.images.map((_, index) => (
                      <button
                        key={index}
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
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
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
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={work.author.avatar}
                    alt={work.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{work.author.name}</h3>
                  <p className="text-sm text-gray-600">
                    {work.author.worksCount} 作品 • {work.author.followersCount} フォロワー
                  </p>
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
                <span>{work.likes + (isLiked ? 1 : 0)}</span>
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
            {isAuthenticated && (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-6">
                フォローする
              </button>
            )}

            {/* 統計情報 */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{work.views.toLocaleString()} 回閲覧</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{work.createdAt}</span>
              </div>
            </div>

            {/* タグ */}
            <div>
              <div className="flex items-center mb-3">
                <Tag className="h-4 w-4 mr-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">タグ</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {work.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/works?tag=${tag}`}
                    className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 関連作品 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">関連作品</h2>
            <div className="space-y-4">
              {relatedWorks.map((relatedWork) => (
                <Link
                  key={relatedWork.id}
                  to={`/works/${relatedWork.id}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={relatedWork.thumbnail}
                      alt={relatedWork.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{relatedWork.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{relatedWork.author}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>❤️ {relatedWork.likes}</span>
                      <span>👁️ {relatedWork.views}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkDetailPage;