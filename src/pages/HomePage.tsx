import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Palette, Star, ArrowRight } from 'lucide-react';
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

  const stats = [
    { icon: Users, label: '登録ユーザー', value: '12,450+' },
    { icon: Palette, label: '投稿作品', value: '45,230+' },
    { icon: Star, label: '総いいね数', value: '892,340+' },
    { icon: TrendingUp, label: '月間PV', value: '2.1M+' },
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
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              学生クリエイターの
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                創作プラットフォーム
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              あなたの描いた漫画・イラストを世界に発信しよう。
              学生同士で繋がり、創作活動を支援し合うコミュニティ。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/manga"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                作品を見る
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
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
            {stats.map((stat, index) => (
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">今すぐ始めよう</h2>
          <p className="text-xl mb-8 text-blue-100">
            無料で登録して、あなたの創作活動を次のレベルへ
          </p>
          <button
            onClick={onSignUpClick}
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-colors text-lg"
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