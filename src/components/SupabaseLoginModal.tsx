import React, { useState } from 'react';
import { X, Mail, Lock, User, GraduationCap, Eye, EyeOff, Plus, Edit3 } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface SupabaseLoginModalProps {
  onClose: () => void;
}

const SupabaseLoginModal: React.FC<SupabaseLoginModalProps> = ({ onClose }) => {
  const { signIn, signUp } = useSupabaseAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCustomUniversity, setShowCustomUniversity] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    university: '',
    customUniversity: '',
    status: 'student' as 'student' | 'ob' | 'og',
    bio: '',
    isCreator: false
  });

  // 大幅に拡充した大学リスト（地域別）
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
    '滋賀大学', '愛知県立大学', '名古屋市立大学',
    
    // 関西地方
    '京都大学', '京都工芸繊維大学', '京都教育大学', '京都府立医科大学', '大阪大学',
    '大阪市立大学', '大阪府立大学', '神戸大学', '兵庫県立大学', '奈良県立医科大学',
    '和歌山大学', '立命館大学', '関西大学', '関西学院大学', '同志社大学',
    '京都産業大学', '近畿大学', '甲南大学', '龍谷大学', '神戸学院大学',
    '武庫川女子大学', '京都女子大学', '同志社女子大学', '京都橘大学', '大阪経済大学',
    '大阪商業大学', '大阪産業大学', '桃山学院大学', '摂南大学', '帝塚山大学',
    '奈良大学', '天理大学', '佛教大学', '京都文教大学', '京都外国語大学',
    '京都精華大学', '京都造形芸術大学', '京都嵯峨芸術大学', '京都美術工芸大学',
    '京都薬科大学', '大阪薬科大学', '神戸薬科大学',
    
    // 中国・四国地方
    '鳥取大学', '島根大学', '岡山大学', '広島大学', '山口大学',
    '徳島大学', '香川大学', '愛媛大学', '高知大学', '岡山県立大学',
    '広島市立大学', '広島県立大学',
    
    // 九州・沖縄地方
    '九州大学', '佐賀大学', '長崎大学', '熊本大学', '大分大学',
    '宮崎大学', '鹿児島大学', '琉球大学', '福岡県立大学', '北九州市立大学',
    
    // 東北・北海道地方
    '東北大学', '北海道大学', '岩手大学', '宮城教育大学', '秋田大学',
    '山形大学', '福島大学', '弘前大学', '岩手県立大学', '宮城大学',
    '秋田県立大学', '山形県立米沢女子短期大学',
    
    // その他の大学
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
      if (isLogin) {
        // ログイン処理
        const { error, success } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else if (success) {
          console.log('✅ ログイン成功：画面を閉じます');
          onClose();
          // ログイン成功後の処理（必要に応じてリダイレクトなど）
        }
      } else {
        // サインアップ処理（いまここ）
        if (formData.password !== formData.confirmPassword) {
          setError('パスワードが一致しません');
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('パスワードは6文字以上で入力してください');
          setIsLoading(false);
          return;
        }

        if (!formData.username.trim()) {
          setError('ユーザー名を入力してください');
          setIsLoading(false);
          return;
        }

        // 大学名の決定（カスタム入力がある場合はそちらを使用）
        const finalUniversity = formData.university === 'その他' && formData.customUniversity.trim() 
          ? formData.customUniversity.trim() 
          : formData.university;

        if (!finalUniversity || finalUniversity === 'その他' || finalUniversity === '') {
          setError('大学名を選択または入力してください');
          setIsLoading(false);
          return;
        }

        const profileData = {
          username: formData.username.trim(),
          display_name: formData.username.trim(),
          university: finalUniversity,
          status: formData.status,
          bio: formData.bio.trim(),
          is_creator: formData.isCreator
        };

        const { error, autoLogin } = await signUp(formData.email, formData.password, profileData);
        console.log('error:', error);
        console.log('autoLogin:', autoLogin);
        if (error) {
          // エラーメッセージの詳細化
          if (error.message.includes('確認メール') || error.message.includes('rate limit')) {
            setError('アカウントが作成されました。ログインしてください。');
            setIsLogin(true);
          } else if (error.message.includes('already registered')) {
            setError('このメールアドレスは既に登録されています。ログインしてください。');
            setIsLogin(true);
          } else if (error.message.includes('password')) {
            setError('パスワードが弱すぎます。より強力なパスワードを設定してください。');
          } else if (error.message.includes('email')) {
            setError('有効なメールアドレスを入力してください。');
          } else {
            setError(`登録エラー: ${error.message}`);
          }
        } else {
          if (autoLogin) {
            // 自動ログインが完了した場合
            console.log('✅ 新規登録・自動ログイン完了：画面を閉じます');
            setError('アカウントが作成され、ログインしました！');
            setTimeout(() => {
              onClose();
            }, 2000);
          } else {
            // メール確認が必要な場合
            setError('アカウントが作成されました。メールを確認してログインしてください。');
            setIsLogin(true);
          }
        }
      }
    } catch (err) {
      console.error('認証エラー:', err);
      setError('予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      university: '',
      customUniversity: '',
      status: 'student',
      bio: '',
      isCreator: false
    });
    setShowCustomUniversity(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isLogin ? 'ログイン' : 'アカウント作成'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="6文字以上で入力"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">6文字以上で入力してください</p>
            )}
          </div>

          {/* サインアップ時のみ表示 */}
          {!isLogin && (
            <>
              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード確認
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="パスワードを再入力"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="2-20文字で入力"
                  />
                </div>
              </div>

              {/* 大学選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  大学 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                      {universities.slice(91, 100).map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </optgroup>
                    <optgroup label="東北・北海道地方">
                      {universities.slice(100, 112).map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </optgroup>
                    <optgroup label="その他">
                      {universities.slice(112).map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                
                {/* カスタム大学入力フィールド */}
                {showCustomUniversity && (
                  <div className="mt-2">
                    <div className="relative">
                      <Edit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="customUniversity"
                        value={formData.customUniversity}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="大学名を入力してください"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ステータス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'ob', 'og'] as const).map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={formData.status === status}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm">
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
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="自己紹介を入力（任意、200文字以内）"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {formData.bio.length}/200
                </p>
              </div>

              {/* クリエイター希望 */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isCreator"
                    checked={formData.isCreator}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    クリエイターとして活動したい
                  </span>
                </label>
              </div>
            </>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                処理中...
              </div>
            ) : (
              isLogin ? 'ログイン' : 'アカウント作成'
            )}
          </button>
        </form>

        {/* フッター */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <button
            onClick={toggleMode}
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
          >
            {isLogin ? 'アカウントをお持ちでない方はこちら' : '既にアカウントをお持ちの方はこちら'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseLoginModal;
