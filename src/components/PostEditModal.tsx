import React, { useState, useEffect } from 'react';
import { X, Pin } from 'lucide-react';
import { PostWithDetails } from '../types';
import { PostsService } from '../lib/postsService';

interface PostEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostWithDetails | null;
  onUpdate: () => void;
}

export const PostEditModal: React.FC<PostEditModalProps> = ({
  isOpen,
  onClose,
  post,
  onUpdate
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setDescription(post.description || '');
      setTags(post.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || []);
      setIsPinned(post.is_pinned || false);
      setError(null);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const addTag = (tag?: string) => {
    const tagToAdd = tag || tagInput.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags(prev => [...prev, tagToAdd]);
      if (!tag) {
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setLoading(true);
    setError(null);

    try {
      const result = await PostsService.updatePost(post.id, post.author_id, {
        title: title.trim(),
        description: description.trim() || null,
        tags: tags,
        is_pinned: isPinned
      });

      if (result.error) {
        setError(result.error);
      } else {
        onUpdate();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const popularTags = [
    'オリジナル', 'ファンタジー', 'キャラクター', '背景', '水彩',
    'デジタル', 'アナログ', 'かわいい', 'クール', '風景',
    '学園', '4コマ', 'SF', '日常', 'ホラー'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">作品を編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* タイトル */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="作品のタイトルを入力"
              disabled={loading}
            />
          </div>

          {/* 説明 */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="作品の説明を入力（任意）"
              disabled={loading}
            />
          </div>

          {/* タグ */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="タグを入力"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => addTag()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading || !tagInput.trim()}
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 mr-2">人気タグ:</span>
              {popularTags
                .filter(tag => !tags.includes(tag))
                .slice(0, 10)
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    disabled={loading}
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>

          {/* 固定設定 */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="sr-only"
                  disabled={loading}
                />
                <div
                  className={`w-14 h-7 rounded-full transition-colors ${
                    isPinned ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                      isPinned ? 'translate-x-7' : 'translate-x-1'
                    } mt-0.5`}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Pin className={`h-5 w-5 ${isPinned ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700">
                  プロフィールページの上部に固定する
                </span>
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-20">
              固定された作品は、プロフィールページの上部に表示されます
            </p>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '更新中...' : '更新する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

