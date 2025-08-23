import React, { useState } from 'react';
import { Trophy, TrendingUp, Calendar, Tag } from 'lucide-react';
import WorkCard from '../components/WorkCard';

const RankingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overall' | 'tag'>('overall');
  const [selectedTag, setSelectedTag] = useState('イラスト');

  // ダミーデータ
  const overallRanking = [
    {
      id: '1',
      title: '猫のイラスト集',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'さくら@早稲田大学',
      likes: 423,
      views: 2890,
      tags: ['動物', '猫', 'かわいい'],
      rank: 1,
    },
    {
      id: '2',
      title: 'キャラクターデザイン集',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '次郎@大阪大学',
      likes: 312,
      views: 2140,
      tags: ['キャラデザ', 'オリジナル', 'ファンタジー'],
      rank: 2,
    },
    {
      id: '3',
      title: 'ロボットメカデザイン',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '健太@東北大学',
      likes: 278,
      views: 1340,
      tags: ['メカ', 'ロボット', 'SF'],
      rank: 3,
    },
    {
      id: '4',
      title: '夏の思い出',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '太郎@東京大学',
      likes: 245,
      views: 1520,
      tags: ['イラスト', '夏', '青春'],
      rank: 4,
    },
    {
      id: '5',
      title: '都市の夜景',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '花子@京都大学og',
      likes: 189,
      views: 892,
      tags: ['背景', '夜景', 'デジタル'],
      rank: 5,
    },
  ];

  const popularTags = [
    'イラスト', 'キャラデザ', '背景', '水彩', 'デジタル', 'アナログ',
    'ファンタジー', 'SF', '動物', 'かわいい', '夏', '青春'
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}位`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50';
    if (rank === 2) return 'text-gray-600 bg-gray-50';
    if (rank === 3) return 'text-orange-600 bg-orange-50';
    return 'text-gray-700 bg-gray-100';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">週間ランキング</h1>
        </div>
        <div className="flex items-center text-gray-600 mb-6">
          <Calendar className="h-5 w-5 mr-2" />
          <span>2024年1月15日 〜 2024年1月21日</span>
          <TrendingUp className="h-5 w-5 ml-4 mr-2" />
          <span>PV数 + いいね数で算出</span>
        </div>

        {/* タブ */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('overall')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'overall'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            総合ランキング
          </button>
          <button
            onClick={() => setActiveTab('tag')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'tag'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            タグ別ランキング
          </button>
        </div>
      </div>

      {/* タグ別ランキングのタグ選択 */}
      {activeTab === 'tag' && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Tag className="h-5 w-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">タグを選択</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ランキング表示 */}
      <div className="space-y-6">
        {/* トップ3の特別表示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {overallRanking.slice(0, 3).map((work) => (
            <div key={work.id} className="relative">
              <div className={`absolute -top-2 -left-2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getRankColor(work.rank)}`}>
                {getRankIcon(work.rank)}
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={work.thumbnail}
                    alt={work.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {work.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{work.author}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>❤️ {work.likes}</span>
                      <span>👁️ {work.views}</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {work.likes + work.views}pt
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4位以下のリスト表示 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'overall' ? '総合ランキング' : `#${selectedTag} ランキング`}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {overallRanking.map((work) => (
              <div key={work.id} className="flex items-center p-6 hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 ${getRankColor(work.rank)}`}>
                  {getRankIcon(work.rank)}
                </div>
                <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                  <img
                    src={work.thumbnail}
                    alt={work.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{work.title}</h3>
                  <p className="text-sm text-gray-600">{work.author}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {work.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-blue-600 mb-1">
                    {(work.likes + work.views).toLocaleString()}pt
                  </div>
                  <div className="text-sm text-gray-500 space-x-2">
                    <span>❤️ {work.likes}</span>
                    <span>👁️ {work.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 更新情報 */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>ランキングは毎週月曜日に更新されます</p>
        <p>次回更新: 2024年1月29日 午前0時</p>
      </div>
    </div>
  );
};

export default RankingPage;