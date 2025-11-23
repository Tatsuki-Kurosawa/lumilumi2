import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Palette, Trophy, Medal, Star, Eye, Heart, Calendar } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import { PostsService } from '../lib/postsService';
import { supabase } from '../lib/supabaseClient';
import { RankingService, RankingItem } from '../lib/rankingService';

type WorkType = 'all' | 'manga' | 'illustration';

const WorksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [works, setWorks] = useState<any[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkType, setActiveWorkType] = useState<WorkType>(() => {
    const typeParam = searchParams.get('type');
    return (typeParam === 'manga' || typeParam === 'illustration') ? typeParam : 'all';
  });
  const [activeCategory, setActiveCategory] = useState(() => {
    const categoryParam = searchParams.get('category');
    return categoryParam || 'latest';
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    // 複数形（tags）と単数形（tag）の両方に対応
    const tagsParam = searchParams.get('tags');
    const tagParam = searchParams.get('tag');

    if (tagsParam) {
      return tagsParam.split(',');
    } else if (tagParam) {
      return [tagParam];
    }
    return [];
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [rankingWorks, setRankingWorks] = useState<any[]>([]);
  const [rankingItems, setRankingItems] = useState<RankingItem[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [rankingTab, setRankingTab] = useState<'weekly' | 'tags'>('weekly');
  const [selectedRankingTag, setSelectedRankingTag] = useState<string>('all');
  const [rankingPopularTags, setRankingPopularTags] = useState<Array<{ name: string; count: number }>>([]);

  const ITEMS_PER_PAGE = 12;

  // 人気タグを取得（作品タイプに応じて）
  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        let query = supabase
          .from('post_tags')
          .select(`
            tag:tags(name),
            post:posts!inner(type)
          `);

        // 作品タイプでフィルタリング
        if (activeWorkType !== 'all') {
          query = query.eq('post.type', activeWorkType);
        }

        const { data, error } = await query;
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
  }, [activeWorkType]);

  // 投稿データを取得
  useEffect(() => {
    if (activeCategory === 'ranking') {
      fetchRanking();
    } else {
      fetchWorks();
    }
  }, [activeCategory, currentPage, activeWorkType, selectedTags]);

  // フィルタリング処理
  useEffect(() => {
    filterWorks();
  }, [works, selectedTags, searchQuery, activeWorkType]);

  const fetchRanking = async () => {
    setRankingLoading(true);
    setRankingError(null);
    try {
      let items: RankingItem[] = [];
      
      if (activeWorkType === 'manga') {
        const result = await RankingService.getMangaRanking(20);
        if (result.error) {
          setRankingError(result.error);
        } else {
          items = result.items;
        }
      } else if (activeWorkType === 'illustration') {
        const result = await RankingService.getIllustrationRanking(20);
        if (result.error) {
          setRankingError(result.error);
        } else {
          items = result.items;
        }
      } else {
        // allの場合は両方取得してマージ
        const [mangaResult, illustrationResult] = await Promise.all([
          RankingService.getMangaRanking(20),
          RankingService.getIllustrationRanking(20)
        ]);
        
        const allItems = [
          ...(mangaResult.items || []),
          ...(illustrationResult.items || [])
        ];
        
        // ポイント順にソートして再ランク付け
        allItems.sort((a, b) => b.points - a.points);
        items = allItems.slice(0, 20).map((item, index) => ({
          ...item,
          rank: index + 1
        }));
      }

      setRankingItems(items);

      // タグ別ランキング用の人気タグを取得（実際に使用されているタグを取得）
      try {
        let tagQuery = supabase
          .from('post_tags')
          .select(`
            tag:tags(name),
            post:posts!inner(type)
          `);

        // 作品タイプでフィルタリング
        if (activeWorkType === 'manga') {
          tagQuery = tagQuery.eq('post.type', 'manga');
        } else if (activeWorkType === 'illustration') {
          tagQuery = tagQuery.eq('post.type', 'illustration');
        }
        // allの場合はフィルタリングなし

        const { data: tagData, error: tagError } = await tagQuery;

        if (tagError) {
          console.error('ランキングタグ取得エラー:', tagError);
        } else {
          // タグ名の出現回数をカウント
          const tagCounts = new Map<string, number>();
          tagData?.forEach((item: any) => {
            const tagName = item.tag?.name;
            if (tagName) {
              tagCounts.set(tagName, (tagCounts.get(tagName) || 0) + 1);
            }
          });

          // 出現回数の多い順にソートして上位10件を取得
          const sortedTags = Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({
              name,
              count
            }));

          setRankingPopularTags(sortedTags);
        }
      } catch (error) {
        console.error('ランキングタグ取得中にエラーが発生:', error);
      }
    } catch (error) {
      console.error('ランキング取得中にエラーが発生:', error);
      setRankingError(error instanceof Error ? error.message : 'Unknown error');
      setRankingItems([]);
    } finally {
      setRankingLoading(false);
    }
  };

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      let result;

      switch (activeCategory) {
        case 'recommended':
          result = await PostsService.getRecommendedPosts(ITEMS_PER_PAGE, offset);
          break;
        case 'trending':
          result = await PostsService.getTrendingPosts(ITEMS_PER_PAGE, offset);
          break;
        case 'latest':
          result = await PostsService.getLatestPosts(ITEMS_PER_PAGE, offset);
          break;
        default:
          result = await PostsService.getAllPosts(ITEMS_PER_PAGE, offset);
      }

      if (result.error) {
        console.error('作品取得エラー:', result.error);
        setWorks([]);
      } else {
        // 作品タイプでフィルタリング
        let filteredPosts = result.posts;
        if (activeWorkType !== 'all') {
          filteredPosts = result.posts.filter(post => post.type === activeWorkType);
        }

        // いいね数と閲覧数を取得して追加
        const worksWithStats = await Promise.all(
          filteredPosts.map(async (post) => {
            const { count: likesCount } = await PostsService.getLikeCount(post.id);

            const { data: viewData } = await supabase
              .from('post_view_counts')
              .select('total_views')
              .eq('post_id', post.id)
              .single();

            return PostsService.formatPostForWorkCard({
              ...post,
              like_count: likesCount,
              view_count: viewData?.total_views || 0
            });
          })
        );

        setWorks(worksWithStats);

        // 総投稿数を取得してページ数を計算（作品タイプでフィルタリング）
        let countQuery = supabase
          .from('posts')
          .select('*', { count: 'exact', head: true });

        if (activeWorkType !== 'all') {
          countQuery = countQuery.eq('type', activeWorkType);
        }

        const { count: totalCount } = await countQuery;

        if (totalCount) {
          setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));
        } else {
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error('作品取得中にエラーが発生:', error);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterWorks = () => {
    let filtered = [...works];

    // タグフィルタリング（すべてのタグを含む作品を表示）
    if (selectedTags.length > 0) {
      filtered = filtered.filter(work =>
        selectedTags.every(selectedTag => work.tags.includes(selectedTag))
      );
    }

    // 検索クエリフィルタリング
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(work =>
        work.title.toLowerCase().includes(query) ||
        work.authorDisplayName.toLowerCase().includes(query) ||
        work.authorUsername.toLowerCase().includes(query) ||
        work.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredWorks(filtered);
  };

  const handleTagClick = (tag: string) => {
    const newParams = new URLSearchParams(searchParams);
    let newSelectedTags: string[];

    if (selectedTags.includes(tag)) {
      // 既に選択されているタグをクリックしたら削除
      newSelectedTags = selectedTags.filter(t => t !== tag);
    } else {
      // 新しいタグを追加
      newSelectedTags = [...selectedTags, tag];
    }

    setSelectedTags(newSelectedTags);

    // URLパラメータを更新
    // 既存のtag/tagsパラメータを削除
    newParams.delete('tag');
    newParams.delete('tags');

    if (newSelectedTags.length > 0) {
      // 1つの場合は単数形、複数の場合は複数形を使用
      if (newSelectedTags.length === 1) {
        newParams.set('tag', newSelectedTags[0]);
      } else {
        newParams.set('tags', newSelectedTags.join(','));
      }
    }

    setSearchParams(newParams);
    setCurrentPage(1); // ページをリセット
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tag');
    newParams.delete('tags');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryTitle = () => {
    const typePrefix = activeWorkType === 'manga' ? 'マンガ - ' : activeWorkType === 'illustration' ? 'イラスト - ' : '';

    switch (activeCategory) {
      case 'recommended': return `${typePrefix}おすすめ作品`;
      case 'trending': return `${typePrefix}急上昇作品`;
      case 'latest': return `${typePrefix}新着作品`;
      case 'ranking': return `${typePrefix}ランキング`;
      case 'popular': return `${typePrefix}人気作品`;
      default: return `${typePrefix}全作品`;
    }
  };

  // ランキング表示用のヘルパー関数
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

  const getRankSize = (rank: number) => {
    if (rank <= 3) return 'text-2xl';
    if (rank <= 10) return 'text-xl';
    if (rank <= 15) return 'text-lg';
    return 'text-base';
  };

  const getTagRanking = () => {
    if (selectedRankingTag === 'all') return rankingItems;
    return rankingItems.filter(work => 
      work.tags.some(tag => tag.name === selectedRankingTag)
    );
  };

  const handleWorkTypeChange = (type: WorkType) => {
    setActiveWorkType(type);
    setCurrentPage(1);

    // URLパラメータを更新
    const newParams = new URLSearchParams(searchParams);
    if (type === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', type);
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);

    // URLパラメータを更新
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', category);
    setSearchParams(newParams);
  };

  // ページネーション用のページ番号配列を生成
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{getCategoryTitle()}</h1>

          {/* 作品タイプタブ（マンガ/イラスト） */}
          <div className="mb-4 flex space-x-2 overflow-x-auto border-b border-gray-200">
            <button
              onClick={() => handleWorkTypeChange('all')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeWorkType === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => handleWorkTypeChange('manga')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeWorkType === 'manga'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              マンガ
            </button>
            <button
              onClick={() => handleWorkTypeChange('illustration')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeWorkType === 'illustration'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              イラスト
            </button>
          </div>

          {/* カテゴリタブ */}
          <div className="mb-6 flex space-x-2 overflow-x-auto">
            <button
              onClick={() => handleCategoryChange('latest')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'latest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              新着
            </button>
            <button
              onClick={() => handleCategoryChange('ranking')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'ranking'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ランキング
            </button>
            <button
              onClick={() => handleCategoryChange('recommended')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'recommended'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              おすすめ
            </button>
            <button
              onClick={() => handleCategoryChange('trending')}
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
                placeholder="作品やユーザーを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* タグフィルター */}
          {popularTags.length > 0 && (
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
          )}
        </div>

        {/* ランキング表示 */}
        {activeCategory === 'ranking' ? (
          <>
            {/* ランキング説明 */}
            <div className="mb-6">
              <p className="text-gray-600">
                いいね数（×5pt）とPV数（×1pt）を合計したポイントでランキングを算出しています
              </p>
            </div>

            {/* ランキングタブ */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
              <button
                onClick={() => setRankingTab('weekly')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  rankingTab === 'weekly'
                    ? 'bg-white text-yellow-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                ランキング
              </button>
              <button
                onClick={() => setRankingTab('tags')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  rankingTab === 'tags'
                    ? 'bg-white text-yellow-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Star className="h-4 w-4 inline mr-2" />
                タグ別ランキング
              </button>
            </div>

            {/* ランキング表示 */}
            {rankingTab === 'weekly' && (
              <div className="space-y-6">
                {rankingLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">ランキングを読み込み中...</p>
                  </div>
                ) : rankingError ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">エラー: {rankingError}</p>
                  </div>
                ) : rankingItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">ランキングデータがありません</p>
                  </div>
                ) : (
                  <>
                    {/* トップ3の特別表示 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {rankingItems.slice(0, 3).map((work) => (
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
                    {rankingItems.length > 3 && (
                      <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                          <h2 className="text-xl font-semibold text-gray-900">4位以下</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {rankingItems.slice(3).map((work) => (
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
                    )}
                  </>
                )}
              </div>
            )}

            {/* タグ別ランキング */}
            {rankingTab === 'tags' && (
              <div className="space-y-6">
                {/* タグ選択 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">人気タグ</h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedRankingTag('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedRankingTag === 'all'
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      すべて ({rankingItems.length})
                    </button>
                    {rankingPopularTags.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => setSelectedRankingTag(tag.name)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedRankingTag === tag.name
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
                {rankingLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">ランキングを読み込み中...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {getTagRanking().map((work) => (
                        <div key={work.id} className="relative">
                          <div className={`absolute -top-2 -left-2 z-10 bg-yellow-400 text-white rounded-full flex items-center justify-center font-bold ${
                            work.rank <= 3 ? 'w-10 h-10 text-base' : work.rank <= 10 ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'
                          }`}>
                            {work.rank}
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
          </>
        ) : (
          /* 通常の作品一覧 */
          <>
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
              <>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredWorks.map((work) => (
                    <WorkCard key={work.id} work={work} />
                  ))}
                </div>

                {/* ページネーション */}
                {selectedTags.length === 0 && !searchQuery && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md transition-colors ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        前へ
                      </button>

                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-md transition-colors ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md transition-colors ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        次へ
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedTags.length > 0
                    ? '検索条件に一致する作品が見つかりませんでした'
                    : '投稿作品がありません'
                  }
                </h3>
                <p className="text-gray-500">
                  {searchQuery || selectedTags.length > 0
                    ? '別の条件で検索してみてください'
                    : 'まだ作品が投稿されていません'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorksPage;
