import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import CategoryNavigation from '../components/CategoryNavigation';

const WorksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('recommended');

  // ダミーデータ
  const works = [
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
    {
      id: '5',
      title: 'ロボットメカデザイン',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '健太@東北大学',
      likes: 278,
      views: 1340,
      tags: ['メカ', 'ロボット', 'SF'],
    },
    {
      id: '6',
      title: '猫のイラスト集',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'さくら@早稲田大学',
      likes: 423,
      views: 2890,
      tags: ['動物', '猫', 'かわいい'],
    },
  ];

  const popularTags = [
    'イラスト', 'キャラデザ', '背景', '水彩', 'デジタル', 'アナログ',
    'ファンタジー', 'SF', '動物', 'かわいい', '夏', '青春'
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
      case 'recommended': return 'おすすめ作品';
      case 'trending': return '急上昇作品';
      case 'latest': return '新着作品';
      case 'popular': return '人気作品';
      default: return '全作品';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{getCategoryTitle()}</h1>
          
          {/* 検索バー */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="作品やユーザーを検索..."
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
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 作品一覧 */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {works.map((work) => (
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
                    ? 'bg-blue-600 text-white'
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

export default WorksPage;