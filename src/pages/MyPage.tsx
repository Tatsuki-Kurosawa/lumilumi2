import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, Upload, Edit, MapPin, Calendar, Trash2 } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import WorkCard from '../components/WorkCard';
import ProfileEditModal from '../components/ProfileEditModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { MyPageService } from '../lib/myPageService';
import { PostsService } from '../lib/postsService';
import { PostWithDetails, User as UserType } from '../types';

const MyPage: React.FC = () => {
  const { user, profile } = useSupabaseAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'works' | 'likes' | 'following' | 'followers'>('works');
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  // 削除モーダル状態
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // データ状態
  const [myWorks, setMyWorks] = useState<PostWithDetails[]>([]);
  const [likedWorks, setLikedWorks] = useState<PostWithDetails[]>([]);
  const [followingUsers, setFollowingUsers] = useState<(UserType & { isFollowingBack: boolean })[]>([]);
  const [followerUsers, setFollowerUsers] = useState<(UserType & { isFollowingBack: boolean })[]>([]);
  
  // 統計データ
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
    works: false,
    likes: false,
    following: false,
    followers: false,
    stats: false
  });

  // データ取得関数
  const fetchUserWorks = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, works: true }));
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { posts, error } = await MyPageService.getUserPosts(user.id, ITEMS_PER_PAGE, offset);
      if (error) {
        console.error('ユーザー作品取得エラー:', error);
      } else {
        setMyWorks(posts);
        
        // 総作品数を取得してページ数を計算
        const { count: totalCount } = await MyPageService.getUserPostCount(user.id);
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

  const fetchFollowerUsers = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, followers: true }));
    try {
      const { users, error } = await MyPageService.getFollowerUsers(user.id);
      if (error) {
        console.error('フォロワー取得エラー:', error);
      } else {
        setFollowerUsers(users);
      }
    } catch (error) {
      console.error('フォロワー取得中にエラーが発生:', error);
    } finally {
      setLoading(prev => ({ ...prev, followers: false }));
    }
  };
  const handleUnfollow = async (followingId: string) => {
    if (!user) return;
    const { success, error } = await MyPageService.unfollowUser(user.id, followingId);
    if (!success) {
      console.error('フォロー解除に失敗しました:', error);
      alert('フォロー解除に失敗しました。時間をおいて再度お試しください。');
      return;
    }

    setFollowingUsers(prev => prev.filter(followUser => followUser.id !== followingId));
    setFollowerUsers(prev =>
      prev.map(follower =>
        follower.id === followingId ? { ...follower, isFollowingBack: false } : follower
      )
    );
    setStats(prev => ({
      ...prev,
      followingCount: Math.max(0, prev.followingCount - 1)
    }));
  };

  const handleToggleFollowFromFollowers = async (followerId: string, isFollowingBack: boolean) => {
    if (!user) return;

    if (isFollowingBack) {
      const { success, error } = await MyPageService.unfollowUser(user.id, followerId);
      if (!success) {
        console.error('フォロー解除に失敗しました:', error);
        alert('フォロー解除に失敗しました。時間をおいて再度お試しください。');
        return;
      }

      setFollowerUsers(prev =>
        prev.map(follower =>
          follower.id === followerId ? { ...follower, isFollowingBack: false } : follower
        )
      );
      setFollowingUsers(prev => prev.filter(followUser => followUser.id !== followerId));
      setStats(prev => ({
        ...prev,
        followingCount: Math.max(0, prev.followingCount - 1)
      }));
    } else {
      const { success, error } = await MyPageService.followUser(user.id, followerId);
      if (!success) {
        console.error('フォローに失敗しました:', error);
        alert('フォローに失敗しました。時間をおいて再度お試しください。');
        return;
      }

      setFollowerUsers(prev =>
        prev.map(follower =>
          follower.id === followerId ? { ...follower, isFollowingBack: true } : follower
        )
      );
      setFollowingUsers(prev => {
        const existing = prev.find(followUser => followUser.id === followerId);
        const followerProfile = followerUsers.find(follower => follower.id === followerId);
        if (existing) {
          return prev.map(followUser =>
            followUser.id === followerId ? { ...followUser, isFollowingBack: true } : followUser
          );
        }
        return followerProfile
          ? [...prev, { ...followerProfile, isFollowingBack: true }]
          : prev;
      });
      setStats(prev => ({
        ...prev,
        followingCount: prev.followingCount + 1
      }));
    }
  };


  // 削除関連のハンドラー
  const handleDeleteClick = (post: PostWithDetails) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete || !user) return;

    setIsDeleting(true);
    try {
      const { success, error } = await PostsService.deletePost(postToDelete.id, user.id);

      if (success) {
        // UIから削除された投稿を除外
        setMyWorks(prev => prev.filter(work => work.id !== postToDelete.id));

        // 統計を更新
        setStats(prev => ({
          ...prev,
          worksCount: Math.max(0, prev.worksCount - 1)
        }));

        // モーダルを閉じる
        setDeleteModalOpen(false);
        setPostToDelete(null);
      } else {
        alert(`削除に失敗しました: ${error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('削除中にエラーが発生:', error);
      alert('削除中にエラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  const fetchStats = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const statsData = await MyPageService.getUserStats(user.id);
      setStats(statsData);
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
      fetchLikedWorks();
      fetchFollowerUsers();
      fetchFollowingUsers();
      fetchStats();
    }
  }, [user]);

  // タブ切り替え時のデータ読み込み
  useEffect(() => {
    if (user) {
      switch (activeTab) {
        case 'works':
          fetchUserWorks();
          break;
        case 'likes':
          if (likedWorks.length === 0) fetchLikedWorks();
          break;
        case 'following':
          if (followingUsers.length === 0) fetchFollowingUsers();
          break;
        case 'followers':
          if (followerUsers.length === 0) fetchFollowerUsers();
          break;
      }
    }
  }, [activeTab, user, currentPage]);
  
  // ページが変更されたときに作品を再取得
  useEffect(() => {
    if (user && activeTab === 'works') {
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
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        {/* カバー画像エリア */}
        <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
          {profile?.cover_image_url && (
            <img 
              src={profile.cover_image_url} 
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
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* 編集・投稿ボタン */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end pt-4 space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={() => setIsProfileEditOpen(true)}
              className="flex items-center justify-center px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              編集
            </button>
            <Link
              to="/upload"
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              作品を投稿
            </Link>
          </div>

          {/* ユーザー情報 */}
          <div className="mt-20 sm:mt-4 sm:ml-40">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
              {profile?.display_name}
              <span className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-gray-100 text-gray-600">
                {profile?.status === 'ob' ? 'OB' : profile?.status === 'og' ? 'OG' : '在学中'}
              </span>
            </h1>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm sm:text-base">{profile?.university}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm sm:text-base">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') + ' から利用' : ''}</span>
              </div>
            </div>

            {profile?.bio && (
              <p className="text-gray-700 mb-6 max-w-2xl">{profile.bio}</p>
            )}

            {/* 統計情報 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
              <div className="text-center cursor-pointer" onClick={() => setActiveTab('works')}>
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
              <div className="text-center cursor-pointer" onClick={() => setActiveTab('followers')}>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading.stats ? '...' : stats.followersCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">フォロワー</div>
              </div>
              <div className="text-center cursor-pointer" onClick={() => setActiveTab('following')}>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading.stats ? '...' : stats.followingCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">フォロー中</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex overflow-x-auto space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('works')}
            className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-xs sm:text-base ${
              activeTab === 'works'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            投稿作品 ({loading.works ? '...' : myWorks.length})
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-xs sm:text-base ${
              activeTab === 'followers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            フォロワー ({loading.followers ? '...' : followerUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-xs sm:text-base ${
              activeTab === 'following'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            フォロー中 ({loading.following ? '...' : followingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-xs sm:text-base ${
              activeTab === 'likes'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            いいね ({loading.likes ? '...' : likedWorks.length})
          </button>
        </div>

      </div>

      {/* コンテンツ */}
      <div>
        {activeTab === 'works' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">投稿作品</h2>
            </div>

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
              <>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {myWorks.map((work) => (
                    <div key={work.id} className="relative group">
                      <WorkCard work={PostsService.formatPostForWorkCard(work)} />
                      <button
                        onClick={() => handleDeleteClick(work)}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg"
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 空の状態 */}
                {!loading.works && myWorks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">まだ作品を投稿していません</h3>
                    <p className="text-gray-600 mb-4">最初の作品を投稿してみましょう</p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      作品を投稿
                    </Link>
                  </div>
                )}

                {/* ページネーション */}
                {!loading.works && myWorks.length > 0 && totalPages > 1 && (
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
              </>
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

        {activeTab === 'followers' && (
          <div>
            {loading.followers ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {followerUsers.map((follower) => (
              <div key={follower.id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                        {follower.avatar_url ? (
                    <img
                            src={follower.avatar_url}
                            alt={follower.display_name}
                      className="w-full h-full object-cover"
                    />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        )}
                  </div>
                  <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{follower.display_name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">@{follower.username}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{follower.university}</p>
                      </div>
                </div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${follower.isFollowingBack ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {follower.isFollowingBack ? 'フォロー中' : 'フォローしていません'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/user/${follower.username}`)}
                  >
                    プロフィール
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 text-xs sm:text-sm border rounded-md transition-colors ${
                      follower.isFollowingBack
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                    }`}
                    onClick={() => handleToggleFollowFromFollowers(follower.id, follower.isFollowingBack)}
                  >
                    {follower.isFollowingBack ? 'フォロー解除' : 'フォローする'}
                  </button>
                </div>
              </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {followingUsers.map((followUser) => (
              <div key={followUser.id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                        {followUser.avatar_url ? (
                    <img
                            src={followUser.avatar_url}
                            alt={followUser.display_name}
                      className="w-full h-full object-cover"
                    />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        )}
                  </div>
                  <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{followUser.display_name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">@{followUser.username}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{followUser.university}</p>
                      </div>
                </div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${followUser.isFollowingBack ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {followUser.isFollowingBack ? 'フォローされています' : 'フォローされていません'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/user/${followUser.username}`)}
                  >
                    プロフィール
                  </button>
                  <button
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                    onClick={() => handleUnfollow(followUser.id)}
                  >
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

      {/* 空の状態（works以外） */}
      {!loading.likes && !loading.following && !loading.followers &&
       ((activeTab === 'likes' && likedWorks.length === 0) ||
        (activeTab === 'following' && followingUsers.length === 0) ||
        (activeTab === 'followers' && followerUsers.length === 0)) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'likes' && <Heart className="h-8 w-8 text-gray-400" />}
            {activeTab === 'following' && <User className="h-8 w-8 text-gray-400" />}
            {activeTab === 'followers' && <User className="h-8 w-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'likes' && 'まだいいねした作品がありません'}
            {activeTab === 'following' && 'まだ誰もフォローしていません'}
            {activeTab === 'followers' && 'まだフォロワーがいません'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'likes' && '気に入った作品にいいねしてみましょう'}
            {activeTab === 'following' && '気になるクリエイターをフォローしてみましょう'}
            {activeTab === 'followers' && 'フォロワーが増えるとここに表示されます'}
          </p>
        </div>
      )}

      {/* プロフィール編集モーダル */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
      />

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        postTitle={postToDelete?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MyPage;