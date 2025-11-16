import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, MapPin, Calendar, Send } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import WorkCard from '../components/WorkCard';
import { UserProfileService } from '../lib/userProfileService';
import { PostsService } from '../lib/postsService';
import { PostWithDetails, User as UserType } from '../types';

const UserProfilePage: React.FC = () => {
  const { username } = useParams();
  const { user } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [isFollowing, setIsFollowing] = useState(false);
  
  // データ状態
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [userWorks, setUserWorks] = useState<PostWithDetails[]>([]);
  const [stats, setStats] = useState({
    worksCount: 0,
    followersCount: 0,
    followingCount: 0,
    totalLikes: 0,
    totalViews: 0
  });
  
  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 12;
  
  // ローディング状態
  const [loading, setLoading] = useState({
    profile: false,
    works: false,
    stats: false,
    follow: false
  });
  
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  // データ取得関数
  const fetchUserProfile = async () => {
    if (!username) return;
    
    setLoading(prev => ({ ...prev, profile: true }));
    setError(null);
    
    try {
      console.log('URLパラメータ (username):', username);
      
      const { user: profileData, error } = await UserProfileService.getUserProfileByUsername(username);
      if (error) {
        console.log('プロフィール取得エラー:', error);
        setError(error);
      } else {
        console.log('プロフィール取得成功:', profileData);
        setProfileUser(profileData);
      }
    } catch (error) {
      console.error('プロフィール取得中にエラーが発生:', error);
      setError('プロフィールの取得に失敗しました');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const fetchUserWorks = async () => {
    if (!profileUser?.id) return;
    
    setLoading(prev => ({ ...prev, works: true }));
    
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { posts, error } = await UserProfileService.getUserPosts(profileUser.id, ITEMS_PER_PAGE, offset);
      if (error) {
        console.error('ユーザー作品取得エラー:', error);
      } else {
        setUserWorks(posts);
        
        // 総作品数を取得してページ数を計算
        const { count: totalCount } = await UserProfileService.getUserPostCount(profileUser.id);
        if (totalCount) {
          setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));
        } else {
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error('ユーザー作品取得中にエラーが発生:', error);
    } finally {
      setLoading(prev => ({ ...prev, works: false }));
    }
  };

  const fetchUserStats = async () => {
    if (!profileUser?.id) return;
    
    setLoading(prev => ({ ...prev, stats: true }));
    
    try {
      const statsData = await UserProfileService.getUserStats(profileUser.id);
      setStats(statsData);
    } catch (error) {
      console.error('統計データ取得中にエラーが発生:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const checkFollowStatus = async () => {
    if (!username || !user) return;
    
    try {
      const { isFollowing: followStatus } = await UserProfileService.checkFollowStatusByUsername(user.id, username);
      setIsFollowing(followStatus);
    } catch (error) {
      console.error('フォロー状態確認中にエラーが発生:', error);
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  // プロフィールが取得できたら他のデータを取得
  useEffect(() => {
    if (profileUser) {
      fetchUserWorks();
      fetchUserStats();
      checkFollowStatus();
    }
  }, [profileUser, user]);

  // ページが変更されたときに作品を再取得
  useEffect(() => {
    if (profileUser) {
      fetchUserWorks();
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ページネーション用のページ番号配列を生成
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleFollow = async () => {
    if (!isAuthenticated || !username || !user) {
      // ログインモーダルを表示
      return;
    }
    
    setLoading(prev => ({ ...prev, follow: true }));
    
    try {
      if (isFollowing) {
        const { success } = await UserProfileService.unfollowUserByUsername(user.id, username);
        if (success) {
          setIsFollowing(false);
          setStats(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
        }
      } else {
        const { success } = await UserProfileService.followUserByUsername(user.id, username);
        if (success) {
          setIsFollowing(true);
          setStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
        }
      }
    } catch (error) {
      console.error('フォロー操作中にエラーが発生:', error);
    } finally {
      setLoading(prev => ({ ...prev, follow: false }));
    }
  };

  // ローディング状態の表示
  if (loading.profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態の表示
  if (error || !profileUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ユーザーが見つかりません</h3>
          <p className="text-gray-600">指定されたユーザーのプロフィールを表示できません。</p>
        </div>
      </div>
    );
  }

  return (
    <><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* プロフィールヘッダー */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        {/* カバー画像エリア */}
        <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
          {profileUser.cover_image_url && (
            <img 
              src={profileUser.cover_image_url} 
              alt="カバー画像" 
              className="w-full h-full object-cover" 
            />
          )}
        </div>
        
        {/* プロフィール情報 */}
        <div className="relative px-3 sm:px-6 pb-6">
          {/* アバター */}
          <div className="absolute -top-12 sm:-top-16 left-1/2 transform -translate-x-1/2 sm:left-6 sm:transform-none">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-white">
              {profileUser.avatar_url ? (
                <img
                  src={profileUser.avatar_url}
                  alt={profileUser.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* フォローボタン */}
          {isAuthenticated && (
            <div className="flex justify-center sm:justify-end pt-4">
              <button
                onClick={handleFollow}
                disabled={loading.follow}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${loading.follow ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading.follow ? '処理中...' : isFollowing ? 'フォロー中' : 'フォローする'}
              </button>
            </div>
          )}

          {/* ユーザー情報 */}
          <div className="mt-20 sm:mt-4 sm:ml-40">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
              {profileUser.display_name}
              <span className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-gray-100 text-gray-600">
                {profileUser.status === 'ob' ? 'OB' : profileUser.status === 'og' ? 'OG' : '在学中'}
              </span>
            </h1>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm sm:text-base">{profileUser.university}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm sm:text-base">{new Date(profileUser.created_at).toLocaleDateString('ja-JP')} から利用</span>
              </div>
            </div>

            {profileUser.bio && (
              <p className="text-gray-700 mb-6 max-w-2xl">{profileUser.bio}</p>
            )}

            {/* 統計情報 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading.stats ? '...' : stats.worksCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">投稿作品</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading.stats ? '...' : stats.totalLikes.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">総いいね数</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading.stats ? '...' : stats.totalViews.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">総閲覧数</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading.stats ? '...' : stats.followersCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">フォロワー</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading.stats ? '...' : stats.followingCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">フォロー中</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 作品セクション */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">投稿作品</h2>
        </div>

        {/* 作品一覧 */}
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
            {userWorks.map((work) => (
              <WorkCard key={work.id} work={PostsService.formatPostForWorkCard(work)} />
            ))}
          </div>
        )}

        {/* 空の状態 */}
        {!loading.works && userWorks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">まだ作品がありません</h3>
            <p className="text-gray-600">このユーザーはまだ作品を投稿していません。</p>
          </div>
        )}

        {/* ページネーション */}
        {!loading.works && userWorks.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                前へ
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                次へ
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* 依頼セクション - Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">依頼について</h2>
          <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg font-medium text-lg">
            Coming Soon
          </div>
        </div>

        {/* Coming Soon メッセージ */}
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">依頼機能は準備中です</h3>
          <p className="text-gray-600 mb-4">
            クリエイターへの依頼機能は現在開発中です。<br />
            近日中にリリース予定ですので、お楽しみに！
          </p>
        </div>
      </div>
    </div>

    {/* 依頼モーダル - Coming Soon のため無効化 */}
    {/* 
    <RequestModal
      isOpen={showRequestModal}
      onClose={() => setShowRequestModal(false)}
      creatorName={profileUser.display_name}
      onSubmit={handleRequestSubmit}
    />
    */}
  </>
  );
};

export default UserProfilePage;