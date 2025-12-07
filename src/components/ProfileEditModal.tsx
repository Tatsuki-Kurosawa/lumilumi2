import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User, GraduationCap, Edit3 } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabaseClient';
import { getUniversities } from '../lib/universityService';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    university: '',
    customUniversity: '',
    status: 'student' as 'student' | 'ob' | 'og',
    bio: '',
    avatar_url: '',
    cover_image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCustomUniversity, setShowCustomUniversity] = useState(false);
  const [universities, setUniversities] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const AVATAR_BUCKET = 'avatars';
  const MAX_FILE_SIZE_MB = 5;
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const updateAvatarPreview = (newPreview: string) => {
    setAvatarPreview(prev => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return newPreview;
    });
  };

  const updateCoverPreview = (newPreview: string) => {
    setCoverPreview(prev => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return newPreview;
    });
  };

  // 大学リストをuniversitiesテーブルから取得
  useEffect(() => {
    const fetchUniversities = async () => {
      const universityList = await getUniversities();
      setUniversities(universityList);
    };
    fetchUniversities();
  }, []);

  // プロフィールデータをフォームに設定（universitiesが読み込まれた後）
  useEffect(() => {
    if (profile && universities.length > 0) {
      const currentUniversity = profile.university || '';
      const isCustomUniversity = !universities.includes(currentUniversity) && currentUniversity !== '';
      
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        university: isCustomUniversity ? 'その他' : (profile.university || ''),
        customUniversity: isCustomUniversity ? currentUniversity : '',
        status: profile.status || 'student',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        cover_image_url: profile.cover_image_url || ''
      });
      setShowCustomUniversity(isCustomUniversity);
      updateAvatarPreview(profile.avatar_url || '');
      updateCoverPreview(profile.cover_image_url || '');
      setAvatarFile(null);
      setCoverFile(null);
    }
  }, [profile, universities]);

  useEffect(() => {
    if (!isOpen) {
      setAvatarFile(null);
      setCoverFile(null);
      updateAvatarPreview(profile?.avatar_url || '');
      updateCoverPreview(profile?.cover_image_url || '');
      setError(null);
      setSuccess(false);
      setShowCustomUniversity(false);
    } else {
      // モーダルが開かれたときに、プロフィールデータを再設定
      if (profile && universities.length > 0) {
        const currentUniversity = profile.university || '';
        const isCustomUniversity = !universities.includes(currentUniversity) && currentUniversity !== '';
        setShowCustomUniversity(isCustomUniversity);
      }
    }
  }, [isOpen, profile, universities, profile?.avatar_url, profile?.cover_image_url]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (coverPreview && coverPreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [avatarPreview, coverPreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 大学選択が「その他」の場合、カスタム入力フィールドを表示
    if (name === 'university') {
      setShowCustomUniversity(value === 'その他');
      if (value !== 'その他') {
        setFormData(prev => ({ ...prev, [name]: value, customUniversity: '' }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('対応している画像形式は JPEG / PNG / WEBP です');
      return;
    }

    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > MAX_FILE_SIZE_MB) {
      setError(`ファイルサイズは ${MAX_FILE_SIZE_MB}MB 以下にしてください`);
      return;
    }

    setAvatarFile(file);
    updateAvatarPreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const handleCoverButtonClick = () => {
    coverInputRef.current?.click();
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('対応している画像形式は JPEG / PNG / WEBP です');
      return;
    }

    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > MAX_FILE_SIZE_MB) {
      setError(`ファイルサイズは ${MAX_FILE_SIZE_MB}MB 以下にしてください`);
      return;
    }

    setCoverFile(file);
    updateCoverPreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const uploadAvatarIfNeeded = async (): Promise<string | null> => {
    if (!avatarFile) {
      return formData.avatar_url || null;
    }

    if (!profile?.id) {
      throw new Error('プロフィール情報が取得できませんでした。再度ログインしてください');
    }

    const fileExt = avatarFile.name.split('.').pop() || 'png';
    const fileName = `avatar-${Date.now()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, avatarFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: avatarFile.type
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error('アップロードした画像の公開URLを取得できませんでした');
    }

    return data.publicUrl;
  };

  const uploadCoverIfNeeded = async (): Promise<string | null> => {
    if (!coverFile) {
      return formData.cover_image_url || null;
    }

    if (!profile?.id) {
      throw new Error('プロフィール情報が取得できませんでした。再度ログインしてください');
    }

    const fileExt = coverFile.name.split('.').pop() || 'png';
    const fileName = `cover-${Date.now()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, coverFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: coverFile.type
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error('アップロードした画像の公開URLを取得できませんでした');
    }

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 大学名の決定
      const finalUniversity = formData.university === 'その他' && formData.customUniversity.trim() 
        ? formData.customUniversity.trim() 
        : formData.university;

      if (!finalUniversity || finalUniversity === 'その他' || finalUniversity === '') {
        setError('大学名を選択または入力してください');
        setLoading(false);
        return;
      }

      // カスタム大学名のバリデーション
      if (formData.university === 'その他') {
        if (!formData.customUniversity.trim()) {
          setError('「その他」を選択した場合は、大学名を入力してください');
          setLoading(false);
          return;
        }
        if (formData.customUniversity.trim().length < 2) {
          setError('大学名は2文字以上で入力してください');
          setLoading(false);
          return;
        }
        if (formData.customUniversity.trim().length > 100) {
          setError('大学名は100文字以内で入力してください');
          setLoading(false);
          return;
        }
      }

      const [uploadedAvatarUrl, uploadedCoverUrl] = await Promise.all([
        uploadAvatarIfNeeded(),
        uploadCoverIfNeeded()
      ]);

      const updates = {
        display_name: formData.display_name,
        username: formData.username,
        university: finalUniversity,
        status: formData.status,
        bio: formData.bio,
        avatar_url: uploadedAvatarUrl || '',
        cover_image_url: uploadedCoverUrl || ''
      };

      const { error } = await updateProfile(updates);
      
      if (error) {
        // エラーメッセージを詳細化
        let errorMessage = error.message;
        if (error.message.includes('university') || error.message.includes('大学名')) {
          errorMessage = `大学名の登録に失敗しました: ${error.message}\n\nもし「その他」から大学名を入力した場合、データベースの設定が必要な可能性があります。`;
        } else if (error.message.includes('RLS') || error.message.includes('policy')) {
          errorMessage = `データベースの権限設定に問題があります。管理者にお問い合わせください。\n\nエラー: ${error.message}`;
        }
        setError(errorMessage);
      } else {
        if (uploadedAvatarUrl) {
          setFormData(prev => ({ ...prev, avatar_url: uploadedAvatarUrl }));
          updateAvatarPreview(uploadedAvatarUrl);
        }
        if (uploadedCoverUrl) {
          setFormData(prev => ({ ...prev, cover_image_url: uploadedCoverUrl }));
          updateCoverPreview(uploadedCoverUrl);
        }
        setAvatarFile(null);
        setCoverFile(null);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'プロフィールの更新中にエラーが発生しました');
      } else {
        setError('プロフィールの更新中にエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">プロフィール編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ヘッダー画像 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ヘッダー画像
            </label>
            <div className="relative w-full h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg overflow-hidden mb-2">
              {coverPreview ? (
                <img 
                  src={coverPreview} 
                  alt="ヘッダー画像" 
                  className="w-full h-full object-cover" 
                />
              ) : null}
            </div>
            <button
              type="button"
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={handleCoverButtonClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              ヘッダー画像を変更
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleCoverChange}
            />
            <p className="text-xs text-gray-500 mt-1">JPEG / PNG / WEBP ・ {MAX_FILE_SIZE_MB}MB以内</p>
          </div>

          {/* アバター */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="アバター" 
                  className="w-24 h-24 rounded-full object-cover" 
                />
              ) : (
                <User className="h-12 w-12 text-white" />
              )}
            </div>
            <button
              type="button"
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={handleAvatarButtonClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              アバターを変更
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-gray-500">JPEG / PNG / WEBP ・ {MAX_FILE_SIZE_MB}MB以内</p>
          </div>

          {/* 表示名 */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
              表示名 *
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="表示名を入力"
            />
          </div>

          {/* ユーザー名 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名 *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ユーザー名を入力"
            />
          </div>

          {/* 大学 */}
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
              大学 *
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">大学を選択してください</option>
                {universities.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
            
            {/* カスタム大学入力フィールド */}
            {showCustomUniversity && (
              <div className="mt-3">
                <div className="relative">
                  <Edit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="customUniversity"
                    value={formData.customUniversity}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="大学名を入力してください（2-100文字）"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  入力した大学名はデータベースに追加され、他のユーザーも選択できるようになります。
                </p>
              </div>
            )}
          </div>

          {/* ステータス */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              ステータス *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="student">在学中</option>
              <option value="ob">OB</option>
              <option value="og">OG</option>
            </select>
          </div>

          {/* 自己紹介 */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              自己紹介
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="自己紹介を入力"
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 成功メッセージ */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600">プロフィールを更新しました</p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
