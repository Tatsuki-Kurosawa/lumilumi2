import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { User, GraduationCap, Edit3, FileText, CheckCircle } from 'lucide-react';

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, registerProfile } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomUniversity, setShowCustomUniversity] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    university: '',
    customUniversity: '',
    status: 'student' as 'student' | 'ob' | 'og',
    bio: '',
    isCreator: false
  });

  // 既にプロフィールが完成している場合は、ホームページにリダイレクト
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (profile && profile.username && profile.university) {
      // プロフィールが既に存在する場合
      navigate('/');
      return;
    }

    // 既存のプロフィール情報があれば初期値に設定
    if (profile) {
      setFormData({
        username: profile.username || '',
        displayName: profile.display_name || '',
        university: profile.university || '',
        customUniversity: '',
        status: profile.status || 'student',
        bio: profile.bio || '',
        isCreator: profile.is_creator || false
      });
    }
  }, [user, profile, navigate]);

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
    '国際基督教大学', '津田塾大学', '東京女子大学', '日本女子大学',
    
    // 関西地方
    '京都大学', '京都工芸繊維大学', '京都教育大学', '大阪大学', '神戸大学',
    '立命館大学', '関西大学', '関西学院大学', '同志社大学', '近畿大学',
    '武庫川女子大学', '京都女子大学', '同志社女子大学',
    
    // 中部地方
    '名古屋大学', '名古屋工業大学', '信州大学', '静岡大学', '金沢大学',
    '新潟大学', '富山大学', '福井大学',
    
    // その他地方
    '東北大学', '北海道大学', '九州大学', '広島大学', '岡山大学',
    '熊本大学', '鹿児島大学', '琉球大学',
    
    'その他'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // 大学選択が「その他」の場合、カスタム入力フィールドを表示
      if (name === 'university') {
        setShowCustomUniversity(value === 'その他');
        if (value !== 'その他') {
          setFormData(prev => ({ ...prev, customUniversity: '' }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // バリデーション
      if (!formData.username.trim()) {
        setError('ユーザー名を入力してください');
        setIsLoading(false);
        return;
      }

      if (formData.username.length < 2 || formData.username.length > 20) {
        setError('ユーザー名は2-20文字で入力してください');
        setIsLoading(false);
        return;
      }

      // 大学名の決定
      const finalUniversity = formData.university === 'その他' && formData.customUniversity.trim() 
        ? formData.customUniversity.trim() 
        : formData.university;

      if (!finalUniversity || finalUniversity === 'その他' || finalUniversity === '') {
        setError('大学名を選択または入力してください');
        setIsLoading(false);
        return;
      }

      // ここに試しにinsertの処理を入れてみる
      const insertData = {
        id: user?.id,
        username: formData.username.trim(),
        display_name: formData.displayName.trim() || formData.username.trim(),
        university: finalUniversity,
        status: formData.status,
        bio: formData.bio.trim(),
        is_creator: formData.isCreator
      };

      const { error } = await registerProfile(insertData);

      // プロフィール更新
      // const updateData = {
      //   username: formData.username.trim(),
      //   display_name: formData.displayName.trim() || formData.username.trim(),
      //   university: finalUniversity,
      //   status: formData.status,
      //   bio: formData.bio.trim(),
      //   is_creator: formData.isCreator
      // };

      // const { error } = await updateProfile(updateData);
      
      if (error) {
        if (error.message.includes('username')) {
          setError('このユーザー名は既に使用されています。別のユーザー名を選択してください。');
        } else {
          setError(`プロフィール更新エラー: ${error.message}`);
        }
        setIsLoading(false);
        return;
      }

      // 成功
      setStep('success');
      
      // 3秒後にホームページにリダイレクト
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      console.error('プロフィール設定エラー:', err);
      setError('予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">プロフィール設定</h1>
        <p className="text-gray-600">あなたのプロフィール情報を入力してください</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* ユーザー名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ユーザー名 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              minLength={2}
              maxLength={20}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="2-20文字で入力"
            />
          </div>
        </div>

        {/* 表示名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            表示名
          </label>
          <div className="relative">
            <Edit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              maxLength={30}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="未入力の場合はユーザー名と同じになります"
            />
          </div>
        </div>

        {/* 大学選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            大学 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <select
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="大学名を入力してください"
                />
              </div>
            </div>
          )}
        </div>

        {/* ステータス */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ステータス
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['student', 'ob', 'og'] as const).map(status => (
              <label 
                key={status} 
                className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors ${
                  formData.status === status 
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="font-medium">
                  {status === 'student' ? '学生' : status === 'ob' ? 'OB' : 'OG'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 自己紹介 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            自己紹介
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              maxLength={200}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              placeholder="自己紹介を入力（任意、200文字以内）"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formData.bio.length}/200
          </p>
        </div>

        {/* クリエイター希望 */}
        <div className="bg-gray-50 p-4 rounded-md">
          <label className="flex items-start">
            <input
              type="checkbox"
              name="isCreator"
              checked={formData.isCreator}
              onChange={handleInputChange}
              className="mt-1 mr-3"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                クリエイターとして活動したい
              </span>
              <p className="text-xs text-gray-500 mt-1">
                チェックすると、作品の投稿や依頼の受付ができるようになります
              </p>
            </div>
          </label>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-4 rounded-md hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              プロフィール作成中...
            </div>
          ) : (
            'プロフィールを作成'
          )}
        </button>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">プロフィール作成完了！</h2>
      <p className="text-gray-600 mb-6">
        ようこそ、LumiLumiへ！<br />
        プロフィールの設定が完了しました。
      </p>
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <p className="text-green-700 text-sm">
          🎉 登録完了しました！<br />
          まもなくホームページにリダイレクトします...
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-6 rounded-md hover:from-cyan-700 hover:to-blue-700 transition-all font-medium"
      >
        ホームページへ
      </button>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {step === 'form' ? renderForm() : renderSuccess()}
    </div>
  );
};

export default ProfileSetupPage;