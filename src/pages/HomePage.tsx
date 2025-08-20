import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Palette, Star, ArrowRight } from 'lucide-react';
import WorkCard from '../components/WorkCard';

const HomePage: React.FC = () => {
  // ダミーデータ
  const featuredWorks = [
    {
      id: '1',
      title: '夏の思い出',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '太郎@東京大学',
      likes: 245,
      views: 1520,
      tags: ['イラスト', '夏', '青春'],
    },
    {
      id: '2',
      title: '都市の夜景',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '花子@京都大学og',
      likes: 189,
      views: 892,
      tags: ['背景', '夜景', 'デジタル'],
    },
    {
      id: '3',
      title: 'キャラクターデザイン集',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '次郎@大阪大学',
      likes: 312,
      views: 2140,
      tags: ['キャラデザ', 'オリジナル', 'ファンタジー'],
    },
    {
      id: '4',
      title: '水彩風景画',
      thumbnail: 'https://images.pexels.com/photos/1266807/pexels-photo-1266807.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '美咲@慶應義塾大学',
      likes: 156,
      views: 743,
      tags: ['水彩', '風景', 'アナログ'],
    },
  ];

  const stats = [
    { icon: Users, label: '登録ユーザー', value: '12,450+' },
    { icon: Palette, label: '投稿作品', value: '45,230+' },
    { icon: Star, label: '総いいね数', value: '892,340+' },
    { icon: TrendingUp, label: '月間PV', value: '2.1M+' },
  ];

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
      <section className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-500 text-white py-20">
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
                to="/main"
                className="inline-flex items-center px-8 py-3 bg-white text-orange-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                作品を見る
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/upload"
                className="inline-flex items-center px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-colors"
              >
                作品を投稿
              </Link>
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
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 注目のマンガセクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">注目のマンガ</h2>
            <Link
              to="/main"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
            >
              すべて見る
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWorks.slice(0, 2).map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </div>
      </section>

      {/* 注目のイラストセクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">注目のイラスト</h2>
            <Link
              to="/main"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
            >
              すべて見る
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWorks.slice(2, 4).map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">プラットフォームの特徴</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              学生クリエイターのための充実した機能で、あなたの創作活動をサポートします
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">簡単投稿</h3>
              <p className="text-gray-600">
                ドラッグ&ドロップで簡単に作品を投稿。タグ付けで作品を整理し、多くの人に見てもらえます。
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">学生コミュニティ</h3>
              <p className="text-gray-600">
                同じ大学や他大学の学生クリエイターと繋がり、お互いの作品にフィードバックを送り合えます。
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
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
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">今すぐ始めよう</h2>
          <p className="text-xl mb-8 text-blue-100">
            無料で登録して、あなたの創作活動を次のレベルへ
          </p>
          <p className="text-xl mb-8 text-orange-100">
            無料で登録して、あなたの創作活動を次のレベルへ
          </p>
          <button
            className="inline-flex items-center px-8 py-3 bg-white text-orange-600 rounded-full font-semibold hover:bg-gray-100 transition-colors text-lg"
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