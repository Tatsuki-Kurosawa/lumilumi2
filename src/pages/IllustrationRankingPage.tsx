import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Eye, Heart, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RankingService, RankingItem } from '../lib/rankingService';

const IllustrationRankingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'tags'>('weekly');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [weeklyRanking, setWeeklyRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popularTags, setPopularTags] = useState<Array<{ name: string; count: number }>>([
    { name: 'ファンタジー', count: 0 },
    { name: 'キャラクター', count: 0 },
    { name: '風景', count: 0 },
    { name: 'アニメ', count: 0 },
    { name: '水彩', count: 0 },
    { name: 'SF', count: 0 },
  ]);

  // ランキングデータを取得
  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      const { items, error: rankingError } = await RankingService.getIllustrationRanking(20);
      if (rankingError) {
        setError(rankingError);
      } else {
        setWeeklyRanking(items);
      }
      setLoading(false);
    };

    fetchRanking();
  }, []);

  // タグの作品数を取得
  useEffect(() => {
    const fetchTagCounts = async () => {
      const tagNames = ['ファンタジー', 'キャラクター', '風景', 'アニメ', '水彩', 'SF'];
      const tagCountsMap = await RankingService.getTagPostCounts(tagNames, 'illustration');
      
      setPopularTags(prevTags => 
        prevTags.map(tag => ({
          ...tag,
          count: tagCountsMap.get(tag.name) || 0
        }))
      );
    };

    fetchTagCounts();
  }, []);

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

  // ランクに応じてサイズを段階的に小さくする
  const getRankSize = (rank: number) => {
    if (rank <= 3) return 'text-2xl';
    if (rank <= 10) return 'text-xl';
    if (rank <= 15) return 'text-lg';
    return 'text-base';
  };

  const getTagRanking = () => {
    if (selectedTag === 'all') return weeklyRanking;
    // タグでフィルタリング（簡易実装）
    return weeklyRanking.filter(work => 
      work.tags.some(tag => tag.name === selectedTag)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Trophy className="h-8 w-8 text-yellow-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">イラストランキング</h1>
        </div>
        <p className="text-gray-600">
          いいね数（×5pt）とPV数（×1pt）を合計したポイントでランキングを算出しています
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
          ランキング
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

      {/* ランキング */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">ランキングを読み込み中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">エラー: {error}</p>
            </div>
          ) : weeklyRanking.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">ランキングデータがありません</p>
            </div>
          ) : (
            <>
              {/* トップ3の特別表示 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {weeklyRanking.slice(0, 3).map((work) => (
                  <div key={work.id} className="bg-white rounded-lg shadow-sm border-2 border-yellow-200 p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {getRankIcon(work.rank)}
                    </div>
                    <Link to={`/works/${work.id}`}>
                      <div className="aspect-square mb-4 rounded-lg overflow-hidden cursor-pointer">
                        <img
                          src={work.thumbnail_url}
                          alt={work.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>
                    <Link to={`/works/${work.id}`}>
                      <h3 className="font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{work.title}</h3>
                    </Link>
                    <Link to={`/user/${work.author.username}`}>
                      <p className="text-sm text-gray-600 mb-3 hover:text-blue-600 transition-colors">
                        {work.author.display_name}@{work.author.university}
                      </p>
                    </Link>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {work.points.toLocaleString()}pt
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
                      <div className={`flex items-center justify-center bg-gray-100 rounded-full ${work.rank <= 10 ? 'w-12 h-12' : work.rank <= 15 ? 'w-10 h-10' : 'w-8 h-8'}`}>
                        <span className={`font-bold text-gray-600 ${getRankSize(work.rank)}`}>
                          #{work.rank}
                        </span>
                      </div>
                      
                      <Link to={`/works/${work.id}`} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={work.thumbnail_url}
                          alt={work.title}
                          className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                        />
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link to={`/works/${work.id}`}>
                          <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">{work.title}</h3>
                        </Link>
                        <Link to={`/user/${work.author.username}`}>
                          <p className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            {work.author.display_name}@{work.author.university}
                          </p>
                        </Link>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {work.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600">
                          {work.points.toLocaleString()}pt
                        </div>
                        <div className="flex items-center justify-end space-x-2 text-sm text-gray-500">
                          <Eye className="h-3 w-3" />
                          <span>{work.views.toLocaleString()}</span>
                          <Heart className="h-3 w-3" />
                          <span>{work.likes.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">ランキングを読み込み中...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {getTagRanking().map((work, index) => (
                  <div key={work.id} className="relative">
                    <div className={`absolute -top-2 -left-2 z-10 bg-yellow-400 text-white rounded-full flex items-center justify-center font-bold ${
                      index < 3 ? 'w-10 h-10 text-base' : index < 10 ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                      <Link to={`/works/${work.id}`} className="block">
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={work.thumbnail_url}
                            alt={work.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link to={`/works/${work.id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                            {work.title}
                          </h3>
                        </Link>
                        <Link to={`/user/${work.author.username}`}>
                          <p className="text-sm text-gray-600 mb-3 hover:text-blue-600 transition-colors">
                            {work.author.display_name}@{work.author.university}
                          </p>
                        </Link>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              <span>{work.likes.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{work.views.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="font-bold text-yellow-600">
                            {work.points.toLocaleString()}pt
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {work.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default IllustrationRankingPage;