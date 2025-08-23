import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';
import WorkCard from '../components/WorkCard';

const MangaPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // ダミーデータ（マンガ作品）
  const recommendedWorks = [
    {
      id: '1',
      title: '青春学園物語 第1話',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '太郎@東京大学',
      likes: 345,
      views: 2520,
      tags: ['マンガ', '学園', '青春', 'オリジナル'],
    },
    {
      id: '2',
      title: 'ファンタジー冒険記',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '花子@京都大学og',
      likes: 289,
      views: 1892,
      tags: ['マンガ', 'ファンタジー', '冒険', '魔法'],
    },
    {
      id: '3',
      title: '日常系4コマ集',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '次郎@大阪大学',
      likes: 412,
      views: 3140,
      tags: ['マンガ', '4コマ', '日常', 'コメディ'],
    },
  ];

  const trendingWorks = [
    {
      id: '4',
      title: 'SF近未来物語',
      thumbnail: 'https://images.pexels.com/photos/1266807/pexels-photo-1266807.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '美咲@慶應義塾大学',
      likes: 256,
      views: 1743,
      tags: ['マンガ', 'SF', '近未来', 'ロボット'],
    },
    {
      id: '5',
      title: 'ホラー短編集',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'さくら@早稲田大学',
      likes: 189,
      views: 1234,
      tags: ['マンガ', 'ホラー', '短編'],
    },
  ];

  const latestWorks = [
    {
      id: '6',
      title: '恋愛コメディ 第1話',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '愛子@上智大学',
      likes: 123,
      views: 567,
      tags: ['マンガ', '恋愛', 'コメディ'],
    },
    {
      id: '7',
      title: 'バトル漫画 序章',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '勇気@東北大学',
      likes: 98,
      views: 432,
      tags: ['マンガ', 'バトル', 'アクション'],
    },
  ];

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
          {recommendedWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
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
          {trendingWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
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
          {latestWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default MangaPage;