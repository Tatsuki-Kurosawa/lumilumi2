import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Clock, DollarSign, User, MessageSquare, Heart, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DirectRequestsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'illustration' | 'manga' | 'design'>('all');

  // ダミーデータ（指名型依頼）
  const artists = [
    {
      id: '1',
      name: '春花@京都大学og',
      avatar: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['イラスト', 'キャラクター', 'ファンタジー'],
      rating: 4.9,
      completedWorks: 45,
      followers: 234,
      priceRange: '1,000円〜',
      isAcceptingRequests: true,
      portfolio: [
        'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=150',
        'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=150',
        'https://images.pexels.com/photos/1266807/pexels-photo-1266807.jpeg?auto=compress&cs=tinysrgb&w=150',
      ],
      bio: 'ファンタジー系のキャラクターイラストを得意としています。丁寧なコミュニケーションを心がけています。',
    },
    {
      id: '2',
      name: '新緑@早稲田大学',
      avatar: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['マンガ', '4コマ', 'コメディ'],
      rating: 4.7,
      completedWorks: 23,
      followers: 156,
      priceRange: '2,000円〜',
      isAcceptingRequests: true,
      portfolio: [
        'https://images.pexels.com/photos/1266807/pexels-photo-1266807.jpeg?auto=compress&cs=tinysrgb&w=150',
        'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=150',
      ],
      bio: '4コマ漫画やコメディ系の作品を制作しています。楽しい作品作りを一緒にしましょう！',
    },
    {
      id: '3',
      name: 'デザイナー@東京大学',
      avatar: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['デザイン', 'ロゴ', 'UI/UX'],
      rating: 4.8,
      completedWorks: 67,
      followers: 345,
      priceRange: '3,000円〜',
      isAcceptingRequests: false,
      portfolio: [
        'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=150',
        'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=150',
        'https://images.pexels.com/photos/1266807/pexels-photo-1266807.jpeg?auto=compress&cs=tinysrgb&w=150',
      ],
      bio: 'ロゴデザインやUI/UXデザインを専門としています。現在は依頼受付を一時停止中です。',
    },
  ];

  const categories = [
    { value: 'all', label: 'すべて' },
    { value: 'illustration', label: 'イラスト' },
    { value: 'manga', label: 'マンガ' },
    { value: 'design', label: 'デザイン' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">クリエイターに依頼</h1>
        <p className="text-gray-600">
          気になるクリエイターに直接依頼を送ることができます。Skebのような指名型リクエストシステムです。
        </p>
      </div>

      {/* 検索・フィルター */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="クリエイターを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5 mr-2" />
            詳細フィルター
          </button>
        </div>
      </div>

      {/* クリエイター一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {artists.map((artist) => (
          <div key={artist.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* ヘッダー */}
            <div className="flex items-start space-x-4 mb-4">
              <Link to={`/user/${artist.id}`} className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/user/${artist.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                  >
                    {artist.name}
                  </Link>
                  {artist.isAcceptingRequests ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                      依頼受付中
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                      受付停止中
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{artist.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{artist.completedWorks}件完了</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{artist.followers}フォロワー</span>
                  </div>
                </div>
                
                <div className="text-lg font-bold text-green-600 mb-2">
                  {artist.priceRange}
                </div>
              </div>
            </div>

            {/* 得意分野 */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {artist.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* 自己紹介 */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {artist.bio}
            </p>

            {/* ポートフォリオ */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">ポートフォリオ</p>
              <div className="flex space-x-2 overflow-x-auto">
                {artist.portfolio.map((image, index) => (
                  <div key={index} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-3">
              <Link
                to={`/user/${artist.id}`}
                className="flex-1 px-4 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                プロフィール
              </Link>
              {artist.isAcceptingRequests ? (
                <button
                  disabled={!isAuthenticated}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isAuthenticated ? '依頼する' : 'ログインが必要'}
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  受付停止中
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 空の状態 */}
      {!isAuthenticated && (
        <div className="mt-12 text-center py-12 bg-blue-50 rounded-lg">
          <User className="h-16 w-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-900 mb-2">ログインして依頼を送ろう</h3>
          <p className="text-blue-700 mb-4">
            ログインすると気になるクリエイターに直接依頼を送ることができます
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ログイン
          </button>
        </div>
      )}

      {/* 使い方ガイド */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">依頼の流れ</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">クリエイター選択</h3>
            <p className="text-sm text-gray-600">気になるクリエイターを見つけて「依頼する」をクリック</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">依頼内容入力</h3>
            <p className="text-sm text-gray-600">希望する作品の詳細や予算を入力して送信</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">承諾・制作</h3>
            <p className="text-sm text-gray-600">クリエイターが承諾したら制作開始</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">4</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">完成・納品</h3>
            <p className="text-sm text-gray-600">作品完成後、納品されて取引完了</p>
          </div>
        </div>
      </div>

      {/* ページネーション */}
      <div className="mt-8 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            前へ
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`px-3 py-2 rounded-md transition-colors ${
                page === 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            次へ
          </button>
        </nav>
      </div>
    </div>
  );
};

export default DirectRequestsPage;