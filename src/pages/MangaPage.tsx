import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import { PostsService } from '../lib/postsService';
import { PostWithDetails } from '../types';

const MangaPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [recommendedWorks, setRecommendedWorks] = useState<any[]>([]);
  const [trendingWorks, setTrendingWorks] = useState<any[]>([]);
  const [latestWorks, setLatestWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // マンガ作品データを取得
  useEffect(() => {
    const fetchMangaWorks = async () => {
      setLoading(true);
      try {
        // 各セクションのマンガ作品を並行して取得
        const [recommended, trending, latest] = await Promise.all([
          PostsService.getRecommendedPostsByCategory('manga', 3),
          PostsService.getTrendingPostsByCategory('manga', 2),
          PostsService.getLatestPostsByCategory('manga', 2)
        ]);

        if (recommended.error) {
          console.error('おすすめマンガ作品の取得に失敗:', recommended.error);
        } else {
          const formattedRecommended = recommended.posts.map(post => PostsService.formatPostForWorkCard(post));
          setRecommendedWorks(formattedRecommended);
        }

        if (trending.error) {
          console.error('急上昇マンガ作品の取得に失敗:', trending.error);
        } else {
          const formattedTrending = trending.posts.map(post => PostsService.formatPostForWorkCard(post));
          setTrendingWorks(formattedTrending);
        }

        if (latest.error) {
          console.error('新着マンガ作品の取得に失敗:', latest.error);
        } else {
          const formattedLatest = latest.posts.map(post => PostsService.formatPostForWorkCard(post));
          setLatestWorks(formattedLatest);
        }
      } catch (error) {
        console.error('マンガ作品データ取得中にエラーが発生:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMangaWorks();
  }, []);

  const popularTags = [
    'マンガ', '学園', 'ファンタジー', '4コマ', 'SF', '日常',
    'コメディ', 'アクション', 'ロマンス', 'ホラー', 'ミステリー'
  ];

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">マンガ</h1>
          </div>
          
          {/* 依頼・ランキングリンク */}
          <div className="flex items-center space-x-4">
            <Link
              to="/direct-requests"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              依頼
            </Link>
            <Link
              to="/manga-ranking"
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              ランキング
            </Link>
          </div>
        </div>
        
        {/* 検索バー */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="マンガ作品を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* タグフィルター */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">人気タグ</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-sm text-gray-600">選択中:</span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  #{tag}
                  <button
                    onClick={() => handleTagClick(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                すべてクリア
              </button>
            </div>
          )}
        </div>
      </div>

      {/* おすすめ作品セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">おすすめ</h2>
          </div>
          <Link
            to="/works"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            もっと見る
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
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
          ) : recommendedWorks.length > 0 ? (
            recommendedWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">おすすめのマンガ作品がありません</p>
            </div>
          )}
        </div>
      </section>

      {/* 急上昇作品セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">急上昇</h2>
          </div>
          <Link
            to="/works"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            もっと見る
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
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
          ) : trendingWorks.length > 0 ? (
            trendingWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">急上昇のマンガ作品がありません</p>
            </div>
          )}
        </div>
      </section>

      {/* 新着作品セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">新着</h2>
          </div>
          <Link
            to="/works"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            もっと見る
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
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
          ) : latestWorks.length > 0 ? (
            latestWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">新着のマンガ作品がありません</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MangaPage;