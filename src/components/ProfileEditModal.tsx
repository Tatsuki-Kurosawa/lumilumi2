import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User, GraduationCap, Edit3 } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabaseClient';

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

  // 大幅に拡充した大学リスト
  const universities = [
    // 関東地方
    '東京大学', '東京工業大学', '一橋大学', '東京医科歯科大学', '東京外国語大学',
    '東京芸術大学', '東京農工大学', '東京海洋大学', 'お茶の水女子大学', '電気通信大学',
    '東京学芸大学', '東京理科大学', '横浜国立大学', '千葉大学', '埼玉大学',
    '茨城大学', '群馬大学', '山梨大学', '慶應義塾大学', '早稲田大学',
    '上智大学', '明治大学', '青山学院大学', '立教大学', '中央大学',
    '法政大学', '学習院大学', '日本大学', '東洋大学', '駒澤大学',
    '専修大学', '國學院大學', '成蹊大学', '成城大学', '明治学院大学',
    '国際基督教大学', '津田塾大学', '東京女子大学', '日本女子大学', '聖心女子大学',
    '白百合女子大学', '清泉女子大学', '東洋英和女学院大学',
    
    // 中部地方
    '新潟大学', '富山大学', '金沢大学', '福井大学', '信州大学',
    '静岡大学', '浜松医科大学', '名古屋大学', '名古屋工業大学', '三重大学',
    '滋賀大学', '愛知県立大学',
    
    // 関西地方
    '京都大学', '大阪大学', '神戸大学', '京都府立大学', '大阪府立大学',
    '大阪市立大学', '奈良女子大学', '和歌山大学', '関西大学', '関西学院大学',
    '同志社大学', '立命館大学', '近畿大学', '甲南大学', '龍谷大学',
    '京都産業大学', '大阪経済大学', '大阪工業大学', '摂南大学', '追手門学院大学',
    '桃山学院大学', '京都女子大学', '同志社女子大学', '神戸女学院大学', '武庫川女子大学',
    '京都ノートルダム女子大学', '大阪女学院大学', '神戸松蔭女子学院大学', '甲南女子大学', '園田学園女子大学',
    '関西外国語大学', '京都外国語大学', '大阪国際大学', '大阪産業大学', '大阪商業大学',
    
    // 中国・四国地方
    '鳥取大学', '島根大学', '岡山大学', '広島大学', '山口大学',
    '徳島大学', '香川大学', '愛媛大学', '高知大学', '鳴門教育大学',
    '山口県立大学', '広島市立大学',
    
    // 九州・沖縄地方
    '福岡教育大学', '九州大学', '九州工業大学', '佐賀大学', '長崎大学',
    '熊本大学', '大分大学', '宮崎大学', '鹿児島大学', '琉球大学',
    '福岡大学', '西南学院大学', '久留米大学', '中村学園大学',
    
    // 東北・北海道地方
    '北海道大学', '北海道教育大学', '室蘭工業大学', '小樽商科大学', '帯広畜産大学',
    '旭川医科大学', '北見工業大学', '弘前大学', '岩手大学', '東北大学',
    '宮城教育大学', '秋田大学', '山形大学', '福島大学',
    
    // その他地方
    'その他'
  ];

  // プロフィールデータをフォームに設定
  useEffect(() => {
    if (profile) {
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
  }, [profile]);

  useEffect(() => {
    if (!isOpen) {
      setAvatarFile(null);
      setCoverFile(null);
      updateAvatarPreview(profile?.avatar_url || '');
      updateCoverPreview(profile?.cover_image_url || '');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, profile?.avatar_url, profile?.cover_image_url]);

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
                <optgroup label="関東地方">
                  {universities.slice(0, 33).map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </optgroup>
                <optgroup label="中部地方">
                  {universities.slice(33, 46).map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </optgroup>
                <optgroup label="関西地方">
                  {universities.slice(46, 79).map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </optgroup>
                <optgroup label="中国・四国地方">
                  {universities.slice(79, 91).map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </optgroup>
                <optgroup label="九州・沖縄地方">
                  {universities.slice(91, 105).map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </optgroup>
                <optgroup label="東北・北海道地方">
                  {universities.slice(105, 119).map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </optgroup>
                <optgroup label="その他">
                  {universities.slice(119).map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </optgroup>
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="大学名を入力してください"
                  />
                </div>
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
