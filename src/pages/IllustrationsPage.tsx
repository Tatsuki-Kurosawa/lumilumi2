import React, { useState } from 'react';
import { Search, Filter, Palette } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import CategoryNavigation from '../components/CategoryNavigation';

const IllustrationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('recommended');

  // ダミーデータ（イラスト作品）
  const illustrationWorks = [
    {
      id: '1',
      title: 'キャラクターイラスト',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '太郎@東京大学',
      likes: 445,
      views: 2820,
      tags: ['イラスト', 'キャラクター', 'デジタル', 'オリジナル'],
    },
    {
      id: '2',
      title: '風景画コレクション',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '花子@京都大学og',
      likes: 389,
      views: 1992,
      tags: ['イラスト', '風景', '背景', '自然'],
    },
    {
      id: '3',
      title: 'ファンタジーアート',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '次郎@大阪大学',
      likes: 512,
      views: 3240,
      tags: ['イラスト', 'ファンタジー', '魔法', 'ドラゴン'],
    },
    {
      id: '4',
      title: 'ポートレート集',
      thumbnail: 'https://images.pexels.com/photos/1266807/pexels-photo-1266807.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: '美咲@慶應義塾大学',
      likes: 356,
      views: 1843,
      tags: ['イラスト', 'ポートレート', '人物', 'リアル'],
    },
    {
      id: '5',
      title: 'アニメ風イラスト',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'さくら@早稲田大学',
      likes: 623,
      views: 4190,
      tags: ['イラスト', 'アニメ', 'かわいい', '女の子'],
    },
  ];

  const popularTags = [
    'イラスト', 'キャラクター', '風景', 'ファンタジー', 'ポートレート', 'アニメ',
    'デジタル', 'アナログ', '水彩', '油絵', 'かわいい', 'リアル'
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
      case 'recommended': return 'おすすめのイラスト';
      case 'trending': return '急上昇のイラスト';
      case 'latest': return '新着イラスト';
      case 'popular': return '人気のイラスト';
      default: return 'イラスト作品';
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
            <Palette className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">{getCategoryTitle()}</h1>
          </div>
          
          {/* 検索バー */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="イラスト作品を検索..."
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
          {illustrationWorks.map((work) => (
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
                    ? 'bg-yellow-400 text-white'
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

export default IllustrationsPage;