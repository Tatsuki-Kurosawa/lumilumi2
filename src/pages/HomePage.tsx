import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Palette, Star, ArrowRight, MessageCircle } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import { PostsService } from '../lib/postsService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
// import { PostWithDetails } from '../types';

interface HomePageProps {
  onLoginClick: () => void;
  onSignUpClick?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick, onSignUpClick }) => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [featuredWorks, setFeaturedWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    postCount: 0,
    totalLikes: 0,
    totalViews: 0
  });

  // 投稿データを取得
  useEffect(() => {
    const fetchFeaturedWorks = async () => {
      setLoading(true);
      try {
        const { posts, error } = await PostsService.getRecommendedPosts(4);
        if (error) {
          console.error('注目作品の取得に失敗:', error);
          // エラーの場合はダミーデータを使用
          setFeaturedWorks([
            {
              id: '1',
              title: '投稿データの読み込みに失敗しました',
              thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
              author: 'システム',
              likes: 0,
              views: 0,
              tags: ['エラー'],
            }
          ]);
        } else {
          // 投稿データをWorkCardコンポーネント用に変換
          const formattedWorks = posts.map(post => PostsService.formatPostForWorkCard(post));
          setFeaturedWorks(formattedWorks);
        }
      } catch (error) {
        console.error('投稿データ取得中にエラーが発生:', error);
        setFeaturedWorks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedWorks();
  }, []);

  // 統計情報を取得
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statistics = await PostsService.getStatistics();
        if (!statistics.error) {
          setStats({
            userCount: statistics.userCount,
            postCount: statistics.postCount,
            totalLikes: statistics.totalLikes,
            totalViews: statistics.totalViews
          });
        }
      } catch (error) {
        console.error('統計情報取得中にエラーが発生:', error);
      }
    };

    fetchStats();
  }, []);

  // 数値をフォーマットする関数
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const statsData = [
    { icon: Users, label: '登録ユーザー', value: formatNumber(stats.userCount) + '+' },
    { icon: Palette, label: '投稿作品', value: formatNumber(stats.postCount) + '+' },
    { icon: Star, label: '総いいね数', value: formatNumber(stats.totalLikes) + '+' },
    { icon: TrendingUp, label: '総閲覧数', value: formatNumber(stats.totalViews) + '+' },
  ];

  const handleUploadClick = () => {
    if (user) {
      navigate('/upload');
    } else {
      onLoginClick();
    }
  };

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="bg-primary-600 text-white py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ソーシャルメディアリンク */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center space-x-3">
            <a
              href="https://x.com/illustalk_univ?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="X (旧Twitter)でフォロー"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="hidden sm:inline text-sm font-medium">フォロー</span>
            </a>
            <a
              href="https://discord.gg/S2xhpHyqv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Discordサーバーに参加"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="hidden sm:inline text-sm font-medium">参加</span>
            </a>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              学生クリエイターの
              <br />
              <span className="text-accent-400">
                創作プラットフォーム
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              あなたの描いた漫画・イラストを世界に発信しよう。
              学生同士で繋がり、創作活動を支援し合うコミュニティ。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/manga"
                className="inline-flex items-center px-8 py-3 bg-accent-400 text-gray-900 rounded-lg font-semibold hover:bg-accent-500 transition-colors shadow-md"
              >
                作品を見る
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
              >
                作品を投稿
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 統計セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 注目作品セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">注目の作品</h2>
            <Link
              to="/works"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              すべて見る
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // ローディング表示
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="flex space-x-2">
                    <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : featuredWorks.length > 0 ? (
              featuredWorks.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))
            ) : (
              // データがない場合の表示
              <div className="col-span-full text-center py-12">
                <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">投稿作品がありません</h3>
                <p className="text-gray-600 mb-4">まだ作品が投稿されていません。最初の作品を投稿してみませんか？</p>
                <button
                  onClick={handleUploadClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  作品を投稿する
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">プラットフォームの特徴</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              学生クリエイターのための充実した機能で、あなたの創作活動をサポートします
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">簡単投稿</h3>
              <p className="text-gray-600">
                ドラッグ&ドロップで簡単に作品を投稿。タグ付けで作品を整理し、多くの人に見てもらえます。
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">学生コミュニティ</h3>
              <p className="text-gray-600">
                同じ大学や他大学の学生クリエイターと繋がり、お互いの作品にフィードバックを送り合えます。
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">依頼システム</h3>
              <p className="text-gray-600">
                作品の添削依頼や新規制作依頼を通じて、スキルアップと収益化の両方を実現できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-16 bg-accent-400">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            {stats.userCount > 0 ? `${stats.userCount.toLocaleString()}人の学生と共に発信していこう` : '何人の学生と共に発信していこう'}
          </h2>
          <button
            onClick={onSignUpClick}
            className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-lg shadow-md"
          >
            無料で始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;