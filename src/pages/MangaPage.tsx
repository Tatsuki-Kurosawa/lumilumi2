import React, { useState } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import CategoryNavigation from '../components/CategoryNavigation';

const MangaPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('recommended');

  // ダミーデータ（マンガ作品）
  const mangaWorks = [
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
    {
      id: '4',
      title: 'SF近未来物語',
      thumbnail: 'https://images.pexels.com/photos/1266807/pexels-photo-1266807.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '美咲@慶應義塾大学',
      likes: 256,
      views: 1743,
      tags: ['マンガ', 'SF', '近未来', 'ロボット'],
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

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'recommended': return 'おすすめのマンガ';
      case 'trending': return '急上昇のマンガ';
      case 'latest': return '新着マンガ';
      case 'popular': return '人気のマンガ';
      default: return 'マンガ作品';
    }
  };

  return (
    <div>
      <CategoryNavigation 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">{getCategoryTitle()}</h1>
          </div>
          
          {/* 検索バー */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="マンガ作品を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 作品一覧 */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mangaWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>

        {/* ページネーション */}
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              前へ
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`px-3 py-2 rounded-md transition-colors ${
                  page === 1
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              次へ
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MangaPage;