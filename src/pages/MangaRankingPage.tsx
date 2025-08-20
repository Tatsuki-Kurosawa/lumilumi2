import React, { useState } from 'react';
import { Trophy, Medal, Star, Eye, Heart, TrendingUp, Calendar } from 'lucide-react';
import WorkCard from '../components/WorkCard';

const MangaRankingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'tags'>('weekly');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // ダミーデータ（マンガランキング）
  const weeklyRanking = [
    {
      id: '1',
      title: '青春学園物語 第1話',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '太郎@東京大学',
      likes: 1245,
      views: 8520,
      totalPoints: 9765, // PV + いいね
      tags: ['マンガ', '学園', '青春'],
      rank: 1,
      rankChange: 0, // 前週比
    },
    {
      id: '2',
      title: 'ファンタジー冒険記 第3話',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '花子@京都大学og',
      likes: 989,
      views: 7892,
      totalPoints: 8881,
      tags: ['マンガ', 'ファンタジー', '冒険'],
      rank: 2,
      rankChange: 1, // 上昇
    },
    {
      id: '3',
      title: '日常系4コマ集 vol.2',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '次郎@大阪大学',
      likes: 812,
      views: 6140,
      totalPoints: 6952,
      tags: ['マンガ', '4コマ', '日常'],
      rank: 3,
      rankChange: -1, // 下降
    },
    {
      id: '4',
      title: 'SF近未来物語',
      thumbnail: 'https://images.pexels.com/photos/1266807/pexels-photo-1266807.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '美咲@慶應義塾大学',
      likes: 656,
      views: 4743,
      totalPoints: 5399,
      tags: ['マンガ', 'SF', '近未来'],
      rank: 4,
      rankChange: 2,
    },
    {
      id: '5',
      title: 'ホラー短編集',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'さくら@早稲田大学',
      likes: 523,
      views: 3890,
      totalPoints: 4413,
      tags: ['マンガ', 'ホラー', '短編'],
      rank: 5,
      rankChange: 0,
    },
  ];

  const popularTags = [
    { name: '学園', count: 45, works: weeklyRanking.filter(w => w.tags.includes('学園')) },
    { name: 'ファンタジー', count: 38, works: weeklyRanking.filter(w => w.tags.includes('ファンタジー')) },
    { name: '4コマ', count: 32, works: weeklyRanking.filter(w => w.tags.includes('4コマ')) },
    { name: 'SF', count: 28, works: weeklyRanking.filter(w => w.tags.includes('SF')) },
    { name: '日常', count: 25, works: weeklyRanking.filter(w => w.tags.includes('日常')) },
    { name: 'ホラー', count: 18, works: weeklyRanking.filter(w => w.tags.includes('ホラー')) },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
    }
    return <span className="text-gray-400">-</span>;
  };

  const getTagRanking = () => {
    if (selectedTag === 'all') return weeklyRanking;
    const tag = popularTags.find(t => t.name === selectedTag);
    return tag ? tag.works : [];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Trophy className="h-8 w-8 text-yellow-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">マンガランキング</h1>
        </div>
        <p className="text-gray-600">
          週間PV数といいね数を合計したポイントでランキングを算出しています
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-6 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'weekly'
              ? 'bg-white text-yellow-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          週間ランキング
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-6 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'tags'
              ? 'bg-white text-yellow-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Star className="h-4 w-4 inline mr-2" />
          タグ別ランキング
        </button>
      </div>

      {/* 週間ランキング */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          {/* トップ3の特別表示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {weeklyRanking.slice(0, 3).map((work) => (
              <div key={work.id} className="bg-white rounded-lg shadow-sm border-2 border-yellow-200 p-6 text-center">
                <div className="flex justify-center mb-4">
                  {getRankIcon(work.rank)}
                </div>
                <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                  <img
                    src={work.thumbnail}
                    alt={work.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{work.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{work.author}</p>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {work.totalPoints.toLocaleString()}pt
                  </div>
                  <div className="flex justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {work.views.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {work.likes.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4位以下のリスト表示 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">4位以下</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {weeklyRanking.slice(3).map((work) => (
                <div key={work.id} className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                    {getRankIcon(work.rank)}
                  </div>
                  
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
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
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-600">
                      {work.totalPoints.toLocaleString()}pt
                    </div>
                    <div className="flex items-center justify-end space-x-2 text-sm text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>{work.views.toLocaleString()}</span>
                      <Heart className="h-3 w-3" />
                      <span>{work.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-end mt-1">
                      {getRankChangeIcon(work.rankChange)}
                      <span className="text-xs text-gray-500 ml-1">前週比</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* タグ別ランキング */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          {/* タグ選択 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">人気タグ</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === 'all'
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて ({weeklyRanking.length})
              </button>
              {popularTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => setSelectedTag(tag.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag.name
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  #{tag.name} ({tag.count})
                </button>
              ))}
            </div>
          </div>

          {/* タグ別作品一覧 */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {getTagRanking().map((work, index) => (
              <div key={work.id} className="relative">
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-yellow-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <WorkCard work={work} />
              </div>
            ))}
          </div>

          {getTagRanking().length === 0 && (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">該当する作品がありません</h3>
              <p className="text-gray-600">選択したタグの作品が見つかりませんでした。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MangaRankingPage;