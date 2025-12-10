import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Eye, Share2, User, Calendar, Tag, ArrowLeft, X, Copy, Check } from 'lucide-react';

import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { PostsService } from '../lib/postsService';
import { UserProfileService } from '../lib/userProfileService';
import { PageViewService } from '../lib/pageViewService';
import { PostWithDetails } from '../types';
import LikeButton from '../components/LikeButton';

const WorkDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [work, setWork] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // 共有リンクとテキスト
  const shareUrl = work ? window.location.href : '';
  const shareText = work 
    ? `${work.author.display_name}の作品「${work.title}」をチェック！\n${shareUrl}`
    : '';

  // テキストをクリップボードにコピー
  const handleCopy = async () => {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('コピーエラー:', error);
    }
  };

  const handleShare = () => {
    if (!work) return;
    setShowShareModal(true);
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
      {/* 戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">戻る</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メイン画像エリア */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 画像を縦に並べて表示 */}
            <div className="space-y-4 p-4">
              {work.images.map((image, index) => (
                <div key={image.id} className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={`${work.title} - ${index + 1}/${work.images.length}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* 作品情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{work.title}</h1>

            {/* 説明文 */}
            {work.description && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{work.description}</p>
              </div>
            )}

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

      {/* 共有モーダル */}
      {showShareModal && work && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-medium max-w-md w-full p-6 sm:p-8 relative">
            {/* 閉じるボタン */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="閉じる"
            >
              <X className="h-5 w-5" />
            </button>

            {/* タイトル */}
            <h2 className="text-2xl font-bold text-text-primary mb-6">作品を共有</h2>

            {/* 共有テキスト */}
            <div className="mb-6">
              <p className="text-text-secondary text-base leading-relaxed mb-4">
                {work.author.display_name}の作品「{work.title}」をチェック！
              </p>
              <div className="bg-bg-secondary rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-text-tertiary break-all font-mono">
                  {shareUrl}
                </p>
              </div>
            </div>

            {/* コピーボタン */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>コピーしました</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    <span>リンクとテキストをコピー</span>
                  </>
                )}
              </button>
            </div>

            {/* 説明 */}
            <p className="text-xs text-text-tertiary mt-4 text-center">
              上記のテキストとリンクがクリップボードにコピーされます
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkDetailPage;