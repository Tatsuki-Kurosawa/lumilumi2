import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, Upload, Settings } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import WorkCard from '../components/WorkCard';
import ProfileEditModal from '../components/ProfileEditModal';
import { MyPageService } from '../lib/myPageService';
import { PostsService } from '../lib/postsService';
import { PostWithDetails, User as UserType } from '../types';

const MyPage: React.FC = () => {
  const { user, profile } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<'works' | 'likes' | 'following'>('works');
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  
  // データ状態
  const [myWorks, setMyWorks] = useState<PostWithDetails[]>([]);
  const [likedWorks, setLikedWorks] = useState<PostWithDetails[]>([]);
  const [followingUsers, setFollowingUsers] = useState<UserType[]>([]);
  
  // 統計データ
  const [stats, setStats] = useState({
    worksCount: 0,
    followersCount: 0,
    followingCount: 0
  });
  
  // ローディング状態
  const [loading, setLoading] = useState({
    works: false,
    likes: false,
    following: false,
    stats: false
  });

  // データ取得関数
  const fetchUserWorks = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, works: true }));
    try {
      const { posts, error } = await MyPageService.getUserPosts(user.id);
      if (error) {
        console.error('ユーザー作品取得エラー:', error);
      } else {
        setMyWorks(posts);
      }
    } catch (error) {
      console.error('ユーザー作品取得中にエラーが発生:', error);
    } finally {
      setLoading(prev => ({ ...prev, works: false }));
    }
  };

  const fetchLikedWorks = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, likes: true }));
    try {
      const { posts, error } = await MyPageService.getUserLikedPosts(user.id);
      if (error) {
        console.error('いいね作品取得エラー:', error);
      } else {
        setLikedWorks(posts);
      }
    } catch (error) {
      console.error('いいね作品取得中にエラーが発生:', error);
    } finally {
      setLoading(prev => ({ ...prev, likes: false }));
    }
  };

  const fetchFollowingUsers = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, following: true }));
    try {
      const { users, error } = await MyPageService.getFollowingUsers(user.id);
      if (error) {
        console.error('フォロー中ユーザー取得エラー:', error);
      } else {
        setFollowingUsers(users);
      }
    } catch (error) {
      console.error('フォロー中ユーザー取得中にエラーが発生:', error);
    } finally {
      setLoading(prev => ({ ...prev, following: false }));
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const [worksResult, followersResult, followingResult] = await Promise.all([
        MyPageService.getUserPostCount(user.id),
        MyPageService.getFollowerCount(user.id),
        MyPageService.getFollowingCount(user.id)
      ]);

      setStats({
        worksCount: worksResult.count,
        followersCount: followersResult.count,
        followingCount: followingResult.count
      });
    } catch (error) {
      console.error('統計データ取得中にエラーが発生:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    if (user) {
      fetchUserWorks();
      fetchStats();
    }
  }, [user]);

  // タブ切り替え時のデータ読み込み
  useEffect(() => {
    if (user) {
      switch (activeTab) {
        case 'works':
          if (myWorks.length === 0) fetchUserWorks();
          break;
        case 'likes':
          if (likedWorks.length === 0) fetchLikedWorks();
          break;
        case 'following':
          if (followingUsers.length === 0) fetchFollowingUsers();
          break;
      }
    }
  }, [activeTab, user]);

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
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile?.display_name}</h1>
            </div>
            <p className="text-gray-600 mb-4">
              {profile?.university} {profile?.status === 'ob' ? 'OB' : profile?.status === 'og' ? 'OG' : '在学中'}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div>
                <span className="font-semibold text-gray-900">
                  {loading.stats ? '...' : stats.worksCount}
                </span>
                <span className="ml-1">作品</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {loading.stats ? '...' : stats.followersCount}
                </span>
                <span className="ml-1">フォロワー</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {loading.stats ? '...' : stats.followingCount}
                </span>
                <span className="ml-1">フォロー中</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link
              to="/upload"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              作品を投稿
            </Link>
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
            投稿作品 ({loading.works ? '...' : myWorks.length})
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'likes'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            いいねした作品 ({loading.likes ? '...' : likedWorks.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'following'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            フォロー中 ({loading.following ? '...' : followingUsers.length})
          </button>
        </div>

      </div>

      {/* コンテンツ */}
      <div>
        {activeTab === 'works' && (
          <div>
            {loading.works ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="flex space-x-2">
                      <div className="h-3 w-12 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myWorks.map((work) => (
                  <WorkCard key={work.id} work={PostsService.formatPostForWorkCard(work)} />
            ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div>
            {loading.likes ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="flex space-x-2">
                      <div className="h-3 w-12 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {likedWorks.map((work) => (
                  <WorkCard key={work.id} work={PostsService.formatPostForWorkCard(work)} />
            ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div>
            {loading.following ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followingUsers.map((followUser) => (
              <div key={followUser.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                        {followUser.avatar_url ? (
                    <img
                            src={followUser.avatar_url}
                            alt={followUser.display_name}
                      className="w-full h-full object-cover"
                    />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        )}
                  </div>
                  <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{followUser.display_name}</h3>
                        <p className="text-sm text-gray-600">@{followUser.username}</p>
                        <p className="text-sm text-gray-500">{followUser.university}</p>
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
        )}
      </div>

      {/* 空の状態 */}
      {!loading.works && !loading.likes && !loading.following && 
       ((activeTab === 'works' && myWorks.length === 0) ||
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
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              作品を投稿
            </Link>
          )}
        </div>
      )}

      {/* プロフィール編集モーダル */}
      <ProfileEditModal 
        isOpen={isProfileEditOpen} 
        onClose={() => setIsProfileEditOpen(false)} 
      />
    </div>
  );
};

export default MyPage;