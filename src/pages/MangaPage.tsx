import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, TrendingUp, Clock, Star, ArrowRight, Trophy, Medal, Eye, Heart, Calendar } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import { PostsService } from '../lib/postsService';
import { PostWithDetails } from '../types';
import { supabase } from '../lib/supabaseClient';
import { RankingService, RankingItem } from '../lib/rankingService';
import { normalizeSearchQuery, matchesSearchQuery } from '../lib/textUtils';

const MangaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularTags, setPopularTags] = useState<Array<{ name: string; count: number }>>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'latest' | 'ranking'>('latest');
  const [rankingItems, setRankingItems] = useState<RankingItem[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [selectedRankingTag, setSelectedRankingTag] = useState<string>('all');

  const ITEMS_PER_PAGE = 12;

  // マンガ作品データを取得（検索クエリの変更にデバウンスを適用）
  useEffect(() => {
    if (activeCategory === 'ranking') {
      fetchRanking();
    } else {
      const timeoutId = setTimeout(() => {
        fetchWorks();
      }, searchQuery.trim() ? 300 : 0); // 検索クエリがある場合は300ms待機、ない場合は即座に実行

      return () => clearTimeout(timeoutId);
    }
  }, [activeCategory, searchQuery, selectedTags]);

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
          .map(([name, count]) => ({
            name,
            count
          }));

        setPopularTags(sortedTags);
      } catch (error) {
        console.error('タグ取得エラー:', error);
      }
    };

    fetchPopularTags();
  }, []);

  const fetchRanking = async () => {
    setRankingLoading(true);
    setRankingError(null);
    try {
      const result = await RankingService.getMangaRanking(20);
      if (result.error) {
        setRankingError(result.error);
      } else {
        setRankingItems(result.items);
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
      // 検索クエリがある場合は検索を実行
      if (searchQuery.trim()) {
        const query = searchQuery.trim();
        const queryPatterns = normalizeSearchQuery(query);
        
        // タイトルで検索（ひらがな・カタカナ互換）
        let titleQuery = supabase
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
          .eq('type', 'manga')
          .eq('is_r18', false);
        
        // 複数のパターンで検索（OR条件）
        if (queryPatterns.length > 1) {
          const orConditions = queryPatterns.map(pattern => `title.ilike.%${pattern}%`).join(',');
          titleQuery = titleQuery.or(orConditions);
        } else {
          titleQuery = titleQuery.ilike('title', `%${queryPatterns[0]}%`);
        }

        const { data: postsByTitle, error: titleError } = await titleQuery;

        // タグで検索（ひらがな・カタカナ互換）
        let tagQuery = supabase
          .from('tags')
          .select('id');
        
        // 複数のパターンで検索（OR条件）
        if (queryPatterns.length > 1) {
          const orConditions = queryPatterns.map(pattern => `name.ilike.%${pattern}%`).join(',');
          tagQuery = tagQuery.or(orConditions);
        } else {
          tagQuery = tagQuery.ilike('name', `%${queryPatterns[0]}%`);
        }
        
        const { data: tagData, error: tagError } = await tagQuery;

        let postsByTag: any[] = [];
        if (tagData && tagData.length > 0 && !tagError) {
          const tagIds = tagData.map((tag: any) => tag.id);
          
          let postTagQuery = supabase
            .from('post_tags')
            .select(`
              posts:post_id (
                *,
                author:profiles!posts_author_id_fkey(
                  id,
                  username,
                  display_name,
                  university,
                  status,
                  avatar_url,
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
              )
            `)
            .in('tag_id', tagIds);

          const { data: postTagData, error: postTagError } = await postTagQuery;
          
          if (!postTagError && postTagData) {
            postsByTag = postTagData
              .map((item: any) => item.posts)
              .filter((post: any) => post !== null && post.type === 'manga' && !post.is_r18);
          }
        }

        // ユーザー名で検索（ひらがな・カタカナ互換）
        let userQuery = supabase
          .from('profiles')
          .select('id');
        
        // 複数のパターンで検索（OR条件）
        const userOrConditions: string[] = [];
        queryPatterns.forEach(pattern => {
          userOrConditions.push(`display_name.ilike.%${pattern}%`);
          userOrConditions.push(`username.ilike.%${pattern}%`);
        });
        userQuery = userQuery.or(userOrConditions.join(','));
        
        const { data: userData, error: userError } = await userQuery;

        let postsByUser: any[] = [];
        if (userData && userData.length > 0 && !userError) {
          const userIds = userData.map((user: any) => user.id);
          
          let userPostQuery = supabase
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
            .in('author_id', userIds)
            .eq('type', 'manga')
            .eq('is_r18', false);

          const { data: userPostData, error: userPostError } = await userPostQuery;
          
          if (!userPostError && userPostData) {
            postsByUser = userPostData;
          }
        }

        // 重複を除去してマージ
        const allPosts = [
          ...(postsByTitle || []),
          ...postsByTag,
          ...postsByUser
        ];
        const uniquePosts = Array.from(
          new Map(allPosts.map((post: any) => [post.id, post])).values()
        ).filter((post: any) => !post.is_r18);

        // いいね数と閲覧数を取得して追加
        const worksWithStats = await Promise.all(
          uniquePosts.map(async (post: any) => {
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

        // タグフィルタリング（OR条件：いずれかのタグを含む作品を表示）
        // さらに検索クエリでフィルタリング（ひらがな・カタカナ互換）
        let finalWorks = worksWithStats;
        if (selectedTags.length > 0) {
          finalWorks = worksWithStats.filter(work =>
            selectedTags.some(selectedTag => 
              work.tags.some((tag: any) => 
                (typeof tag === 'string' ? tag : tag.name) === selectedTag
              )
            )
          );
        }
        
        // 検索クエリで追加フィルタリング（タイトル、タグ、ユーザー名で検索）
        finalWorks = finalWorks.filter(work => {
          const titleMatch = matchesSearchQuery(work?.title, query);
          const authorMatch = matchesSearchQuery(work?.authorDisplayName, query) || 
                             matchesSearchQuery(work?.authorUsername, query);
          const tagMatch = (work?.tags || []).some((tag: any) => {
            const tagName = typeof tag === 'string' ? tag : tag?.name;
            return matchesSearchQuery(tagName, query);
          });
          
          return titleMatch || authorMatch || tagMatch;
        });
        
        setWorks(finalWorks);
      } else {
        // 検索クエリがない場合は通常の取得
        let result = await PostsService.getLatestPostsByCategory('manga', ITEMS_PER_PAGE);

        if (result?.error) {
          console.error('作品取得エラー:', result.error);
          setWorks([]);
        } else {
          const formattedWorks = (result?.posts || []).map((post: any) => 
            PostsService.formatPostForWorkCard(post)
          );
          
          // タグフィルタリング（OR条件：いずれかのタグを含む作品を表示）
          let finalWorks = formattedWorks;
          if (selectedTags.length > 0) {
            finalWorks = formattedWorks.filter(work =>
              selectedTags.some(selectedTag => 
                work.tags.some((tag: any) => 
                  (typeof tag === 'string' ? tag : tag.name) === selectedTag
                )
              )
            );
          }
          
          setWorks(finalWorks);
        }
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

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h1 className="text-4xl font-bold text-text-primary">マンガ</h1>
          </div>
        </div>
        
        {/* カテゴリタブ */}
        <div className="mb-6 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('latest')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'latest'
                ? 'bg-primary-500 text-white'
                : 'bg-bg-base text-text-primary hover:bg-bg-secondary'
            }`}
          >
            新着
          </button>
          <button
            onClick={() => setActiveCategory('ranking')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'ranking'
                ? 'bg-primary-500 text-white'
                : 'bg-bg-base text-text-primary hover:bg-bg-secondary'
            }`}
          >
            ランキング
          </button>
        </div>
        
      </div>

      {/* 人気タグ（新着とランキングで表示） */}
      {popularTags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Filter className="h-5 w-5 text-text-tertiary mr-2" />
            <span className="font-semibold text-text-primary">人気タグ</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags
              .filter(tag => 
                !searchQuery.trim() || 
                matchesSearchQuery(tag.name, searchQuery)
              )
              .map((tag) => (
              <button
                key={tag.name}
                onClick={() => {
                  if (activeCategory === 'ranking') {
                    // ランキングは単一選択
                    setSelectedRankingTag(selectedRankingTag === tag.name ? 'all' : tag.name);
                  } else {
                    // 新着は複数選択
                    handleTagClick(tag.name);
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  activeCategory === 'ranking'
                    ? selectedRankingTag === tag.name
                      ? 'bg-primary-500 text-white'
                      : 'bg-bg-secondary text-text-primary hover:bg-primary-50'
                    : selectedTags.includes(tag.name)
                      ? 'bg-primary-500 text-white'
                      : 'bg-bg-secondary text-text-primary hover:bg-primary-50'
                }`}
              >
                #{tag.name} ({tag.count})
              </button>
            ))}
          </div>
          {activeCategory !== 'ranking' && selectedTags.length > 0 && (
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
                className="text-sm text-text-tertiary hover:text-text-primary"
              >
                すべてクリア
              </button>
            </div>
          )}
        </div>
      )}

      {/* 検索バー */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="作品タイトル、タグ、ユーザー名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* ランキング表示 */}
      {activeCategory === 'ranking' ? (
        <div className="space-y-6">
          {/* ランキング説明 */}
          <div className="mb-6">
            <p className="text-gray-600">
              いいね数（×5pt）とPV数（×1pt）を合計したポイントでランキングを算出しています
            </p>
          </div>

          {/* タグ別ランキング表示 */}
          {rankingLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">ランキングを読み込み中...</p>
            </div>
          ) : rankingError ? (
            <div className="text-center py-12">
              <p className="text-red-600">エラー: {rankingError}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-3">
                {getTagRanking().map((work) => (
                  <div key={work.id} className="relative">
                    <div className={`absolute -top-2 -left-2 z-10 bg-yellow-400 text-white rounded-full flex items-center justify-center font-bold ${
                      work.rank <= 3 ? 'w-10 h-10 text-base' : work.rank <= 10 ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs'
                    }`}>
                      {work.rank}
                    </div>
                    <div className="bg-bg-base rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group">
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
                          <h3 className="font-semibold text-text-primary mb-2 line-clamp-2 hover:text-primary-500 transition-colors">
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
                  <h3 className="text-lg font-semibold text-text-primary mb-2">該当する作品がありません</h3>
                  <p className="text-gray-600">選択したタグの作品が見つかりませんでした。</p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* 通常の作品一覧 */
        <>
          {loading ? (
            <div className="grid gap-6 grid-cols-3">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <div key={index} className="bg-bg-base rounded-lg shadow-soft p-5 animate-pulse">
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
          ) : works.length > 0 ? (
            <div className="grid gap-6 grid-cols-3">
              {works.map((work) => (
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
                {'新着のマンガ作品がありません'}
              </h3>
              <p className="text-gray-500">まだ作品が投稿されていません</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MangaPage;
