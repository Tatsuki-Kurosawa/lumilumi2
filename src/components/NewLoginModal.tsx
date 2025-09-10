import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface NewLoginModalProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const NewLoginModal: React.FC<NewLoginModalProps> = ({ onClose, onSwitchToSignUp }) => {
  const { signIn, resetPassword } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const { error, success } = await signIn(formData.email, formData.password);
      
      if (error) {
        if (error.message.includes('Invalid login')) {
          setError('メールアドレスまたはパスワードが正しくありません。');
        } else if (error.message.includes('Email not confirmed')) {
          setError('メールアドレスが確認されていません。確認メールをチェックしてください。');
        } else if (error.message.includes('Too many requests')) {
          setError('ログイン試行回数が多すぎます。しばらく時間をおいてから再度お試しください。');
        } else {
          setError(error.message);
        }
      } else if (success) {
        console.log('✅ ログイン成功');
        onClose();
      }
    } catch (err) {
      console.error('ログインエラー:', err);
      setError('予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!formData.email) {
      setError('メールアドレスを入力してください。');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await resetPassword(formData.email);
      
      if (error) {
        setError('パスワードリセットメールの送信に失敗しました。メールアドレスを確認してください。');
      } else {
        setSuccessMessage(`${formData.email} にパスワードリセットメールを送信しました。`);
        setIsResetMode(false);
      }
    } catch (err) {
      console.error('パスワードリセットエラー:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {successMessage}
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <button
            type="button"
            onClick={() => setIsResetMode(true)}
            className="text-sm text-cyan-600 hover:text-cyan-700"
          >
            パスワードを忘れた方
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="パスワードを入力"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
            ログイン中...
          </div>
        ) : (
          'ログイン'
        )}
      </button>
    </form>
  );

  const renderResetForm = () => (
    <form onSubmit={handlePasswordReset} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-4">
        登録されたメールアドレスを入力してください。パスワードリセット用のメールをお送りします。
      </div>

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

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => {
            setIsResetMode(false);
            setError(null);
            setSuccessMessage(null);
          }}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
        >
          戻る
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              送信中...
            </div>
          ) : (
            'リセット'
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isResetMode ? 'パスワードリセット' : 'ログイン'}
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
          {isResetMode ? renderResetForm() : renderLoginForm()}
        </div>

        {/* フッター */}
        {!isResetMode && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <button
              onClick={onSwitchToSignUp}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              アカウントをお持ちでない方はこちら
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewLoginModal;