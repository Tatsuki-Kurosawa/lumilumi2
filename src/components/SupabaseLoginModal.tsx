// 今は使われていない. 不要説.

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, GraduationCap, Eye, EyeOff, Plus, Edit3 } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { getUniversities } from '../lib/universityService';

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
  const [universities, setUniversities] = useState<string[]>([]);

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

  // 大学リストをuniversitiesテーブルから取得
  useEffect(() => {
    const fetchUniversities = async () => {
      const universityList = await getUniversities();
      setUniversities(universityList);
    };
    fetchUniversities();
  }, []);

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

        // パスワード強度チェック（英数記号8文字以上）
        if (formData.password.length < 8) {
          setError('パスワードは8文字以上で入力してください');
          setIsLoading(false);
          return;
        }

        const hasLetter = /[a-zA-Z]/.test(formData.password);
        const hasNumber = /[0-9]/.test(formData.password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);

        if (!hasLetter || !hasNumber || !hasSymbol) {
          setError('パスワードは英字、数字、記号をそれぞれ1文字以上含む必要があります');
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

        // カスタム大学名のバリデーション
        if (formData.university === 'その他') {
          if (!formData.customUniversity.trim()) {
            setError('「その他」を選択した場合は、大学名を入力してください');
            setIsLoading(false);
            return;
          }
          if (formData.customUniversity.trim().length < 2) {
            setError('大学名は2文字以上で入力してください');
            setIsLoading(false);
            return;
          }
          if (formData.customUniversity.trim().length > 100) {
            setError('大学名は100文字以内で入力してください');
            setIsLoading(false);
            return;
          }
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
                minLength={8}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="英数記号8文字以上で入力"
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
              <p className="text-xs text-gray-500 mt-1">英字、数字、記号を含む8文字以上で入力してください</p>
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
                    {universities.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
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
                        minLength={2}
                        maxLength={100}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
