import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import { PostsService } from '../lib/postsService';
import { PostWithDetails } from '../types';
import { supabase } from '../lib/supabaseClient';
import { RankingService, RankingItem } from '../lib/rankingService';

const MangaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'latest' | 'ranking' | 'recommended' | 'trending'>('latest');

  const ITEMS_PER_PAGE = 12;

  // マンガ作品データを取得
  useEffect(() => {
    fetchWorks();
  }, [activeCategory]);

  // 人気タグを取得（マンガのみ）
  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        // マンガ作品で実際に使用されているタグを取得
        const { data, error } = await supabase
          .from('post_tags')
          .select(`
            tag:tags(name),
            post:posts!inner(type)
          `)
          .eq('post.type', 'manga');

        if (error) throw error;

        // タグ名の出現回数をカウント
        const tagCounts = new Map<string, number>();
        data?.forEach((item: any) => {
          const tagName = item.tag?.name;
          if (tagName) {
            tagCounts.set(tagName, (tagCounts.get(tagName) || 0) + 1);
          }
        });

        // 出現回数の多い順にソートして上位20件を取得
        const sortedTags = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([name]) => name);

        setPopularTags(sortedTags);
      } catch (error) {
        console.error('タグ取得エラー:', error);
      }
    };

    fetchPopularTags();
  }, []);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      let result;

      switch (activeCategory) {
        case 'recommended':
          result = await PostsService.getRecommendedPostsByCategory('manga', ITEMS_PER_PAGE);
          break;
        case 'trending':
          result = await PostsService.getTrendingPostsByCategory('manga', ITEMS_PER_PAGE);
          break;
        case 'ranking':
          const rankingResult = await RankingService.getMangaRanking(ITEMS_PER_PAGE);
          if (rankingResult.error) {
            console.error('マンガランキング取得エラー:', rankingResult.error);
            setWorks([]);
            return;
          }
          
          // ランキングアイテムのIDから実際の投稿データを取得
          const postIds = rankingResult.items.map(item => item.id);
          if (postIds.length === 0) {
            setWorks([]);
            return;
          }

          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select(`
              *,
              author:profiles!posts_author_id_fkey(
                id,
                username,
                display_name,
                university,
                status,
                avatar_url,
                cover_image_url,
                bio,
                is_creator,
                created_at
              ),
              images:post_images(
                id,
                post_id,
                image_url,
                display_order
              ),
              tags:post_tags(
                tag:tags(
                  id,
                  name
                )
              )
            `)
            .in('id', postIds);

          if (postsError) {
            console.error('投稿データ取得エラー:', postsError);
            setWorks([]);
            return;
          }

          // ランキング順序を保持しながら投稿データを整形
          const rankingMap = new Map(rankingResult.items.map(item => [item.id, item]));
          const formattedWorks = (postsData || [])
            .map((post: any) => {
              const rankingItem = rankingMap.get(post.id);
              if (!rankingItem) return null;

              return PostsService.formatPostForWorkCard({
                ...post,
                author: post.author,
                images: (post.images || []).sort((a: any, b: any) => a.display_order - b.display_order),
                tags: (post.tags || []).map((tag: any) => tag.tag).filter(Boolean),
                like_count: rankingItem.likes,
                view_count: rankingItem.views
              });
            })
            .filter(Boolean)
            .sort((a: any, b: any) => {
              const rankA = rankingMap.get(a.id)?.rank || 999;
              const rankB = rankingMap.get(b.id)?.rank || 999;
              return rankA - rankB;
            });

          setWorks(formattedWorks);
          return;
        case 'latest':
        default:
          result = await PostsService.getLatestPostsByCategory('manga', ITEMS_PER_PAGE);
          break;
      }

      if (result?.error) {
        console.error('作品取得エラー:', result.error);
        setWorks([]);
      } else {
        const formattedWorks = (result?.posts || []).map((post: any) => 
          PostsService.formatPostForWorkCard(post)
        );
        setWorks(formattedWorks);
      }
    } catch (error) {
      console.error('作品取得中にエラーが発生:', error);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  // タグでフィルタリングされた作品を取得
  const getFilteredWorks = () => {
    if (selectedTags.length === 0) {
      return works;
    }
    return works.filter(work =>
      selectedTags.every(selectedTag => work.tags.includes(selectedTag))
    );
  };

  const filteredWorks = getFilteredWorks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">マンガ</h1>
          </div>
        </div>
        
        {/* カテゴリタブ */}
        <div className="mb-6 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('latest')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'latest'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            新着
          </button>
          <button
            onClick={() => setActiveCategory('ranking')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'ranking'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ランキング
          </button>
          <button
            onClick={() => setActiveCategory('recommended')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'recommended'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            おすすめ
          </button>
          <button
            onClick={() => setActiveCategory('trending')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'trending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            急上昇
          </button>
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
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-3 flex items-center flex-wrap gap-2">
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
                onClick={handleClearAllTags}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                すべてクリア
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 作品一覧 */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="flex space-x-2">
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredWorks.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      ) : selectedTags.length > 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            選択されたタグに一致するマンガ作品がありません
          </h3>
          <p className="text-gray-500">別のタグで検索してみてください</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeCategory === 'ranking' ? 'ランキングのマンガ作品がありません' :
             activeCategory === 'recommended' ? 'おすすめのマンガ作品がありません' :
             activeCategory === 'trending' ? '急上昇のマンガ作品がありません' :
             '新着のマンガ作品がありません'}
          </h3>
          <p className="text-gray-500">まだ作品が投稿されていません</p>
        </div>
      )}
    </div>
  );
};

export default MangaPage;
