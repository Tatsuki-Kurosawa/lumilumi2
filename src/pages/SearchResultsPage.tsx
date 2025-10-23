import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, User, Tag, FileText } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import { supabase } from '../lib/supabaseClient';

interface Post {
  id: string;
  title: string;
  thumbnail: string;
  authorDisplayName: string;
  authorUsername: string;
  tags: string[];
  likes: number;
  views: number;
  type: string;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  display_name: string;
  university: string;
  avatar_url?: string;
  bio?: string;
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'users' | 'tags'>('all');

  useEffect(() => {
    if (query) {
      searchAll(query);
    }
  }, [query]);

  const searchAll = async (searchQuery: string) => {
    setLoading(true);
    try {
      await Promise.all([
        searchPosts(searchQuery),
        searchProfiles(searchQuery),
        searchTags(searchQuery)
      ]);
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPosts = async (searchQuery: string) => {
    try {
      // 作品タイトルでの検索
      const { data: postsByTitle, error: titleError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          thumbnail_url,
          type,
          created_at,
          profiles:author_id (
            display_name,
            username,
            university
          )
        `)
        .ilike('title', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (titleError) throw titleError;

      // タグでの検索
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('id')
        .ilike('name', `%${searchQuery}%`);

      if (tagError) throw tagError;

      let postsByTag: any[] = [];
      if (tagData && tagData.length > 0) {
        const tagIds = tagData.map((tag: any) => tag.id);

        const { data: postTagData, error: postTagError } = await supabase
          .from('post_tags')
          .select(`
            posts:post_id (
              id,
              title,
              thumbnail_url,
              type,
              created_at,
              profiles:author_id (
                display_name,
                username,
                university
              )
            )
          `)
          .in('tag_id', tagIds);

        if (postTagError) throw postTagError;

        if (postTagData) {
          postsByTag = postTagData
            .map((item: any) => item.posts)
            .filter((post: any) => post !== null);
        }
      }

      // 重複を除去してマージ
      const allPosts = [...(postsByTitle || []), ...postsByTag];
      const uniquePosts = Array.from(
        new Map(allPosts.map((post: any) => [post.id, post])).values()
      );

      // いいね数と閲覧数を取得
      const postsWithStats = await Promise.all(
        uniquePosts.map(async (post: any) => {
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          const { data: viewData } = await supabase
            .from('post_view_counts')
            .select('total_views')
            .eq('post_id', post.id)
            .single();

          // タグを取得
          const { data: postTags } = await supabase
            .from('post_tags')
            .select('tags:tag_id(name)')
            .eq('post_id', post.id);

          const tags = postTags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [];

          return {
            id: post.id.toString(),
            title: post.title,
            thumbnail: post.thumbnail_url,
            authorDisplayName: `${post.profiles?.display_name}@${post.profiles?.university}`,
            authorUsername: post.profiles?.username || '',
            likes: likesCount || 0,
            views: viewData?.total_views || 0,
            tags: tags,
            type: post.type,
            created_at: post.created_at
          };
        })
      );

      setPosts(postsWithStats as any);
    } catch (error) {
      console.error('作品検索エラー:', error);
      setPosts([]);
    }
  };

  const searchProfiles = async (searchQuery: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, university, avatar_url, bio')
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('ユーザー検索エラー:', error);
      setProfiles([]);
    }
  };

  const searchTags = async (searchQuery: string) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('name')
        .ilike('name', `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setTags(data?.map((tag: any) => tag.name) || []);
    } catch (error) {
      console.error('タグ検索エラー:', error);
      setTags([]);
    }
  };

  const filteredResults = () => {
    switch (activeTab) {
      case 'posts':
        return { posts, profiles: [], tags: [] };
      case 'users':
        return { posts: [], profiles, tags: [] };
      case 'tags':
        return { posts: [], profiles: [], tags };
      default:
        return { posts, profiles, tags };
    }
  };

  const results = filteredResults();
  const totalResults = posts.length + profiles.length + tags.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-6 w-6 text-gray-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              検索結果: "{query}"
            </h1>
          </div>
          <p className="text-gray-600">
            {loading ? '検索中...' : `${totalResults}件の結果が見つかりました`}
          </p>
        </div>

        {/* タブ */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>すべて ({totalResults})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'posts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>作品 ({posts.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>ユーザー ({profiles.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tags'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>タグ ({tags.length})</span>
              </div>
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 作品結果 */}
            {results.posts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  作品 ({posts.length})
                </h2>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.posts.map((work) => (
                    <WorkCard key={work.id} work={work} />
                  ))}
                </div>
              </div>
            )}

            {/* ユーザー結果 */}
            {results.profiles.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  ユーザー ({profiles.length})
                </h2>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {results.profiles.map((profile) => (
                    <Link
                      key={profile.id}
                      to={`/user/${profile.username}`}
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow block"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {profile.display_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{profile.display_name}</h3>
                          <p className="text-sm text-gray-500">@{profile.username}</p>
                          <p className="text-sm text-gray-500">{profile.university}</p>
                        </div>
                      </div>
                      {profile.bio && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* タグ結果 */}
            {results.tags.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  タグ ({tags.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.tags.map((tag) => (
                    <button
                      key={tag}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                      onClick={() => {
                        // タグをクリックしたら、そのタグで再検索
                        window.location.href = `/search?q=${encodeURIComponent(tag)}`;
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 結果なし */}
            {totalResults === 0 && !loading && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  検索結果が見つかりませんでした
                </h3>
                <p className="text-gray-500">
                  別のキーワードで検索してみてください
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
