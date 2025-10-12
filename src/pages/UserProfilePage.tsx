import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, MapPin, Calendar, Heart, Eye, Send, CheckCircle, XCircle } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import WorkCard from '../components/WorkCard';
import RequestModal from '../components/RequestModal';

const UserProfilePage: React.FC = () => {
  const { id } = useParams();
  const { user } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [isFollowing, setIsFollowing] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // ダミーデータ
  const profileUser = {
    id: id || 'user1',
    username: 'testuser',
    displayName: '太郎@東京大学',
    university: '東京大学',
    isOB: false,
    isOG: false,
    avatar: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'イラストと漫画を描いています。主にファンタジー系の作品を制作中。コメントやいいねをいただけると嬉しいです！',
    joinDate: '2023-04-15',
    worksCount: 45,
    followersCount: 234,
    followingCount: 89,
    totalLikes: 1520,
    totalViews: 12450,
    // 依頼関連の情報を追加
    isAcceptingRequests: true,
    requestInfo: {
      genre: 'イラスト・キャラクターデザイン',
      basePrice: '3,000円〜',
      responseDeadline: '3日以内',
      deliveryDeadline: '1週間〜2週間',
      totalWorks: 45,
      onTimeRate: 98,
    },
  };

  const userWorks = [
    {
      id: '1',
      title: '夏の思い出',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: profileUser.displayName,
      likes: 245,
      views: 1520,
      tags: ['イラスト', '夏', '青春'],
    },
    {
      id: '2',
      title: 'キャラクターデザイン集',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: profileUser.displayName,
      likes: 189,
      views: 892,
      tags: ['キャラデザ', 'オリジナル'],
    },
    {
      id: '3',
      title: '水彩風景画',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: profileUser.displayName,
      likes: 156,
      views: 743,
      tags: ['水彩', '風景', 'アナログ'],
    },
  ];

  const handleFollow = () => {
    if (!isAuthenticated) {
      // ログインモーダルを表示
      return;
    }
    setIsFollowing(!isFollowing);
  };

  const handleRequestSubmit = (requestData: any) => {
    // 依頼データを処理
    console.log('依頼データ:', requestData);
    alert('依頼を送信しました！クリエイターからの返答をお待ちください。');
  };
  return (
    <><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* プロフィールヘッダー */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        {/* カバー画像エリア */}
        <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* プロフィール情報 */}
        <div className="relative px-6 pb-6">
          {/* アバター */}
          <div className="absolute -top-16 left-6">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* フォローボタン */}
          {isAuthenticated && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? 'フォロー中' : 'フォローする'}
              </button>
            </div>
          )}

          {/* ユーザー情報 */}
          <div className="mt-4 ml-40">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profileUser.displayName}
              {/* 依頼ステータス */}
              <span className={`ml-4 px-3 py-1 text-sm font-medium rounded-full ${
                profileUser.isAcceptingRequests
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {profileUser.isAcceptingRequests ? '依頼募集中' : '受付停止中'}
              </span>
            </h1>
            
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{profileUser.university}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{profileUser.joinDate} から利用</span>
              </div>
            </div>

            {profileUser.bio && (
              <p className="text-gray-700 mb-6 max-w-2xl">{profileUser.bio}</p>
            )}

            {/* 統計情報 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profileUser.worksCount}</div>
                <div className="text-sm text-gray-600">作品</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profileUser.followersCount}</div>
                <div className="text-sm text-gray-600">フォロワー</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profileUser.followingCount}</div>
                <div className="text-sm text-gray-600">フォロー中</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profileUser.totalLikes.toLocaleString()}</div>
                <div className="text-sm text-gray-600">総いいね数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profileUser.totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-600">総閲覧数</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 依頼セクション */}
      {profileUser.isAcceptingRequests && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">依頼について</h2>
            {isAuthenticated ? (
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                <Send className="h-5 w-5 mr-2" />
                依頼する
              </button>
            ) : (
              <button
                disabled
                className="flex items-center px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium text-lg"
              >
                <Send className="h-5 w-5 mr-2" />
                ログインが必要
              </button>
            )}
          </div>

          {/* 依頼情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">ジャンル:</h3>
              <p className="text-gray-700">{profileUser.requestInfo.genre}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">おまかせ金額:</h3>
              <p className="text-gray-700 font-semibold text-lg text-green-600">
                {profileUser.requestInfo.basePrice}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">返答締め切り日数:</h3>
              <p className="text-gray-700">{profileUser.requestInfo.responseDeadline}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">納品締め切り日数:</h3>
              <p className="text-gray-700">{profileUser.requestInfo.deliveryDeadline}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">総作品数:</h3>
              <p className="text-gray-700">{profileUser.requestInfo.totalWorks}件</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">締め切り厳守率:</h3>
              <div className="flex items-center">
                <p className="text-gray-700 font-semibold">{profileUser.requestInfo.onTimeRate}%</p>
                {profileUser.requestInfo.onTimeRate >= 95 ? (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 作品セクション */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">投稿作品</h2>
        </div>

        {/* 作品一覧 */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {userWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>

        {/* 空の状態 */}
        {userWorks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">まだ作品がありません</h3>
            <p className="text-gray-600">このユーザーはまだ作品を投稿していません。</p>
          </div>
        )}

        {/* ページネーション */}
        {userWorks.length > 0 && (
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
        )}
      </div>
    </div>

    {/* 依頼モーダル */}
    <RequestModal
      isOpen={showRequestModal}
      onClose={() => setShowRequestModal(false)}
      creatorName={profileUser.displayName}
      onSubmit={handleRequestSubmit}
    />
  </>
  );
};

export default UserProfilePage;