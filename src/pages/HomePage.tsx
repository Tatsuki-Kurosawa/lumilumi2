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
    <div className="min-h-screen bg-bg-secondary">
      {/* ヒーローセクション */}
      <section className="bg-primary-500 text-white py-24 relative pt-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          {/* ソーシャルメディアリンク */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center space-x-3">
            <a
              href="https://x.com/illustalk_univ?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
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
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
              title="Discordサーバーに参加"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="hidden sm:inline text-sm font-medium">参加</span>
            </a>
          </div>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              学生クリエイターの
              <br />
              <span className="text-accent-400">
                創作プラットフォーム
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
              あなたの描いた漫画・イラストを世界に発信しよう。
              <br />
              学生同士で繋がり、創作活動を支援し合うコミュニティ。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/manga"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent-400 text-text-primary rounded-lg font-semibold hover:bg-accent-500 transition-all shadow-medium hover:shadow-card text-base"
              >
                作品を見る
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-500 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-medium hover:shadow-card text-base"
              >
                作品を投稿
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 統計セクション */}
      <section className="py-20 bg-bg-base">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-lg mb-5 shadow-soft">
                  <stat.icon className="h-7 w-7 text-primary-500" />
                </div>
                <div className="text-3xl font-bold text-text-primary mb-2">{stat.value}</div>
                <div className="text-text-secondary font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 注目作品セクション */}
      <section className="py-20 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-text-primary">注目の作品</h2>
            <Link
              to="/works"
              className="inline-flex items-center text-primary-500 hover:text-primary-600 font-semibold transition-colors"
            >
              すべて見る
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
              // ローディング表示
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-bg-base rounded-lg shadow-soft p-5 animate-pulse">
                  <div className="w-full aspect-square bg-bg-secondary rounded-lg mb-5"></div>
                  <div className="h-5 bg-bg-secondary rounded mb-3"></div>
                  <div className="h-4 bg-bg-secondary rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 w-16 bg-bg-secondary rounded-full"></div>
                    <div className="h-6 w-20 bg-bg-secondary rounded-full"></div>
                  </div>
                </div>
              ))
            ) : featuredWorks.length > 0 ? (
              featuredWorks.map((work) => (
                <WorkCard key={work.id} work={work} onLoginRequired={onLoginClick} />
              ))
            ) : (
              // データがない場合の表示
              <div className="col-span-full text-center py-16">
                <Palette className="h-20 w-20 text-text-tertiary mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-text-primary mb-3">投稿作品がありません</h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">まだ作品が投稿されていません。最初の作品を投稿してみませんか？</p>
                <button
                  onClick={handleUploadClick}
                  className="inline-flex items-center px-6 py-3 bg-accent-400 text-text-primary rounded-lg hover:bg-accent-500 transition-all font-semibold shadow-medium"
                >
                  作品を投稿する
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="py-20 bg-bg-base">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-5">プラットフォームの特徴</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              学生クリエイターのための充実した機能で、あなたの創作活動をサポートします
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-8 bg-bg-secondary rounded-lg shadow-soft hover:shadow-medium transition-all">
              <div className="w-20 h-20 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-soft">
                <Palette className="h-10 w-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">簡単投稿</h3>
              <p className="text-text-secondary leading-relaxed">
                ドラッグ&ドロップで簡単に作品を投稿。タグ付けで作品を整理し、多くの人に見てもらえます。
              </p>
            </div>
            <div className="text-center p-8 bg-bg-secondary rounded-lg shadow-soft hover:shadow-medium transition-all">
              <div className="w-20 h-20 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-soft">
                <Users className="h-10 w-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">学生コミュニティ</h3>
              <p className="text-text-secondary leading-relaxed">
                同じ大学や他大学の学生クリエイターと繋がり、お互いの作品にフィードバックを送り合えます。
              </p>
            </div>
            <div className="text-center p-8 bg-bg-secondary rounded-lg shadow-soft hover:shadow-medium transition-all">
              <div className="w-20 h-20 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-soft">
                <Star className="h-10 w-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">依頼システム</h3>
              <p className="text-text-secondary leading-relaxed">
                作品の添削依頼や新規制作依頼を通じて、スキルアップと収益化の両方を実現できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-accent-400">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-text-primary leading-tight">
            {stats.userCount > 0 ? `${stats.userCount.toLocaleString()}人の学生と共に発信していこう` : '何人の学生と共に発信していこう'}
          </h2>
          <button
            onClick={onSignUpClick}
            className="inline-flex items-center px-10 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all text-lg shadow-medium hover:shadow-card"
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