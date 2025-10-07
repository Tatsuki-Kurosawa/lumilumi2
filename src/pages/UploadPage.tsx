import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabaseClient';

const UploadPage: React.FC = () => {
  const { user, profile, session } = useSupabaseAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    category: 'illustration' as 'illustration' | 'manga',
    isR18: false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { value: 'illustration', label: 'イラスト' },
    { value: 'manga', label: 'マンガ' },
  ];

  const popularTags = [
    'オリジナル', 'ファンタジー', 'キャラクター', '背景', '水彩',
    'デジタル', 'アナログ', 'かわいい', 'クール', '風景'
  ];

  // 認証チェック
  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ログインが必要です</h3>
          <p className="text-gray-600 mb-4">作品を投稿するにはログインしてください</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );

    if (validFiles.length + images.length > 50) {
      alert('画像は最大50枚までアップロードできます');
      return;
    }

    setImages(prev => [...prev, ...validFiles]);

    // プレビュー生成
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = (tag?: string) => {
    const tagToAdd = tag || tagInput.trim();
    if (tagToAdd && !formData.tags.includes(tagToAdd)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd]
      }));
      if (!tag) {
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('画像を少なくとも1枚アップロードしてください');
      return;
    }

    // console.log('supabase', supabase);
    // console.log('session', session);

    setIsUploading(true);
    try {
      // 1. ユーザー情報を取得（既に認証チェック済みなので、profileから取得）
      if (!user || !profile) {
        alert('ログインが必要です。');
        setIsUploading(false);
        return;
      }

      // // 追加
      // const result = await supabase.storage.from('posts').upload(
      //   `test_${Date.now()}.txt`,
      //   new Blob(["hello"], { type: "text/plain" })
      // );
      
      // console.log("upload result:", result);

      // 2. 全ての画像を並行してSupabase Storageにアップロード
      const imageUploadPromises = images.map(file => {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        return supabase.storage.from('posts').upload(filePath, file); // 'posts'はあなたのバケット名
      });

      console.log("imageUploadPromises");
      console.log(imageUploadPromises);
      const isPromise = imageUploadPromises instanceof Promise;
      console.log(isPromise); // true なら Promise
      
      const uploadedImageResults = await Promise.all(imageUploadPromises);

      console.log("uploadedImageResults");
      console.log(uploadedImageResults);

      // アップロードエラーがないかチェック
      const uploadErrors = uploadedImageResults.filter(result => result.error);
      if (uploadErrors.length > 0) {
        console.error('画像アップロード中にエラー:', uploadErrors);
        throw new Error('画像アップロードに失敗しました。');
      }
      
      console.log("エラーなし");

      // 全画像の公開URLを取得
      const imageUrls = uploadedImageResults.map(result => {
          return supabase.storage.from('posts').getPublicUrl(result.data.path).data.publicUrl;
      });

      console.log("imageUrls");
      console.log(imageUrls);

      // 3. `posts`テーブルに基本情報を保存し、新しい投稿IDを取得
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          title: formData.title,
          description: formData.description || null,
          type: formData.category, // 'manga' or 'illustration'
          thumbnail_url: imageUrls[0], // 最初の画像をサムネイルとして使用
          is_r18: formData.isR18
        })
        .select('id')
        .single();
      
      if (postError) console.log("postsテーブル格納時にエラー発生");

      if (postError) throw postError;
      const newPostId = postData.id;

      // 4. `post_images`テーブルに画像情報を保存
      const imageRecords = imageUrls.map((url, index) => ({
          post_id: newPostId,
          image_url: url,
          display_order: index + 1
      }));
      const { error: imagesError } = await supabase.from('post_images').insert(imageRecords);

      if (imagesError) console.log("post_imagesテーブル格納時にエラー発生");

      if (imagesError) throw imagesError;

      // 5. タグ情報を処理 (upsertで重複を避けつつタグを作成し、中間テーブルに保存)
      if (formData.tags && formData.tags.length > 0) {
          // tagsテーブルにタグを保存（存在しない場合のみ作成）
          const { data: tagData, error: tagUpsertError } = await supabase
              .from('tags')
              .upsert(formData.tags.map((tag: string) => ({ name: tag })), { onConflict: 'name' })
              .select('id, name');

          if (tagUpsertError) throw tagUpsertError;

          // post_tags中間テーブルにレコードを保存
          const postTagRecords = tagData.map((tag: { id: number; name: string }) => ({
              post_id: newPostId,
              tag_id: tag.id
          }));
          const { error: postTagsError } = await supabase.from('post_tags').insert(postTagRecords);
          if (postTagsError) throw postTagsError;
      }

      // 6. 成功時の処理
      alert('投稿が完了しました！');
      navigate(`/`); // トップページへ遷移
      // navigate(`/works/${newPostId}`); // 作成した作品の詳細ページへ遷移

    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロード中にエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">作品を投稿</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="作品のタイトルを入力"
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="作品の説明を入力"
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'illustration' | 'manga' }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="タグを入力"
              />
              <button
                type="button"
                onClick={() => addTag()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                追加
              </button>
            </div>
            
            {/* 人気タグ */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">人気タグ:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => !formData.tags.includes(tag) && addTag(tag)}
                    disabled={formData.tags.includes(tag)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 選択されたタグ */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 text-xs bg-cyan-100 text-cyan-800 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-cyan-600 hover:text-cyan-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* R-18設定 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isR18}
                onChange={(e) => setFormData(prev => ({ ...prev, isR18: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">R-18作品</span>
            </label>
          </div>

          {/* 画像アップロード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像 *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {images.length === 0 ? (
                <div>
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    画像をドラッグ&ドロップするか、クリックして選択
                  </p>
                  <p className="text-sm text-gray-500">
                    JPEG, PNG形式、最大10MB、最大50枚
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                  >
                    画像を選択
                  </button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    さらに画像を追加
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/works')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isUploading || images.length === 0}
              className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'アップロード中...' : '投稿する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;