import React, { useState } from 'react';
import { User, Heart, Upload, Settings, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WorkCard from '../components/WorkCard';

const MyPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'works' | 'likes' | 'following'>('works');

  // ダミーデータ
  const myWorks = [
    {
      id: '1',
      title: '夏の思い出',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: user?.displayName || 'ユーザー',
      likes: 245,
      views: 1520,
      tags: ['イラスト', '夏', '青春'],
    },
    {
      id: '2',
      title: 'キャラクターデザイン',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: user?.displayName || 'ユーザー',
      likes: 189,
      views: 892,
      tags: ['キャラデザ', 'オリジナル'],
    },
  ];

  const likedWorks = [
    {
      id: '3',
      title: '都市の夜景',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '花子@京都大学og',
      likes: 312,
      views: 2140,
      tags: ['背景', '夜景', 'デジタル'],
    },
  ];

  const followingUsers = [
    {
      id: '1',
      username: '花子@京都大学og',
      avatar: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=100',
      worksCount: 45,
      followersCount: 234,
    },
    {
      id: '2',
      username: '次郎@大阪大学',
      avatar: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=100',
      worksCount: 23,
      followersCount: 156,
    },
  ];

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ログインが必要です</h3>
          <p className="text-gray-600">マイページを表示するにはログインしてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* プロフィールヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.displayName} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
              <button className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Edit className="h-4 w-4 mr-1" />
                編集
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              {user.university} {user.isOB ? 'OB' : user.isOG ? 'OG' : '在学中'}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div>
                <span className="font-semibold text-gray-900">{myWorks.length}</span>
                <span className="ml-1">作品</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">1,234</span>
                <span className="ml-1">フォロワー</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{followingUsers.length}</span>
                <span className="ml-1">フォロー中</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              作品を投稿
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('works')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'works'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            投稿作品 ({myWorks.length})
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'likes'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            いいねした作品 ({likedWorks.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'following'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            フォロー中 ({followingUsers.length})
          </button>
        </div>

      </div>

      {/* コンテンツ */}
      <div>
        {activeTab === 'works' && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {likedWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followingUsers.map((followUser) => (
              <div key={followUser.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={followUser.avatar}
                      alt={followUser.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{followUser.username}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{followUser.worksCount} 作品</span>
                      <span>{followUser.followersCount} フォロワー</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    プロフィール
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                    フォロー解除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 空の状態 */}
      {((activeTab === 'works' && myWorks.length === 0) ||
        (activeTab === 'likes' && likedWorks.length === 0) ||
        (activeTab === 'following' && followingUsers.length === 0)) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'works' && <Upload className="h-8 w-8 text-gray-400" />}
            {activeTab === 'likes' && <Heart className="h-8 w-8 text-gray-400" />}
            {activeTab === 'following' && <User className="h-8 w-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'works' && 'まだ作品を投稿していません'}
            {activeTab === 'likes' && 'まだいいねした作品がありません'}
            {activeTab === 'following' && 'まだ誰もフォローしていません'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'works' && '最初の作品を投稿してみましょう'}
            {activeTab === 'likes' && '気に入った作品にいいねしてみましょう'}
            {activeTab === 'following' && '気になるクリエイターをフォローしてみましょう'}
          </p>
          {activeTab === 'works' && (
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              作品を投稿
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyPage;