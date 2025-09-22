import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
// テスト
import { supabase } from '../lib/supabaseClient';

interface SignUpModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSwitchToLogin }) => {
  const { signUp } = useSupabaseAuth();
  const [step, setStep] = useState<'email' | 'success' | 'profile'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // フォームバリデーション
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

    try {
      // 最小限のプロフィールデータでサインアップ（メール認証後にプロフィールを完成）
      const { error } = await signUp(formData.email, formData.password);

      // 確認用
      console.log('error:', error);

      if (error) {
        if (error.message.includes('already registered')) {
          setError('このメールアドレスは既に登録されています。ログインしてください。');
        } else if (error.message.includes('email')) {
          setError('有効なメールアドレスを入力してください。');
        } else if (error.message.includes('Email confirmation')) {
          // メール確認が必要な場合
          setUserEmail(formData.email);
          setStep('success');
        } else {
          // これまでずっとここに入っていた
          setError(error.message);
        }
      } else {
        setUserEmail(formData.email);
        setStep('success');
      }
    } catch (err) {
      console.error('サインアップエラー:', err);
      setError('予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
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
        <p className="text-xs text-gray-500 mt-1">英字、数字、記号を含む8文字以上で入力してください</p>
      </div>

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
          '新規登録'
        )}
      </button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900">確認メールを送信しました</h3>
      <div className="space-y-2 text-gray-600">
        <p>{userEmail} に確認メールを送信しました。</p>
        <p className="text-sm">メールに記載されているリンクをクリックして、アカウントの確認を完了してください。</p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-700">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="font-medium mb-1">次の手順:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>メールボックスを確認してください</li>
              <li>「アカウント確認」メールを開いてください</li>
              <li>メール内の確認リンクをクリックしてください</li>
              <li>プロフィール情報を入力して登録完了です</li>
            </ol>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
      >
        閉じる
      </button>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'email':
        return renderEmailStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'success' ? '新規登録' : '新規登録'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {renderContent()}
        </div>

        {/* フッター */}
        {step === 'email' && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <button
              onClick={onSwitchToLogin}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              既にアカウントをお持ちの方はこちら
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpModal;