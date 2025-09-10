import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAuthState } = useSupabaseAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      if (isProcessed) return; // 既に処理済みの場合は実行しない
      
      try {
        setIsProcessed(true);

        // URLフラグメント（#の後）もチェック
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');
        
        console.log('フラグメント - access_token:', hashAccessToken);
        console.log('フラグメント - refresh_token:', hashRefreshToken);
        console.log('フラグメント - type:', hashType);

        // Supabaseからのリダイレクトの場合
        if (hashAccessToken && hashRefreshToken) {
          console.log('✅ Supabaseからの認証リダイレクトを検出');
          
          // 認証状態を更新
          const result = await refreshAuthState();

          console.log('result:', result);
          console.log('result.success:', result.success);
          console.log('result.user:', result.user);

          if (result.success && result.user) {
            setStatus('success');
            setMessage('メール確認が完了しました！');
            
            // プロフィール情報が不完全な場合はプロフィール設定ページへ
            setTimeout(() => {
              navigate('/profile-setup');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('メール確認の処理中にエラーが発生しました。再度ログインをお試しください。');
          }
          return;
        }

        // // 従来のトークンベースの確認
        // if (!token || hashType !== 'signup') {
        //   setStatus('error');
        //   setMessage('無効な確認リンクです。');
        //   return;
        // }

        // // 認証状態を更新
        // const result = await refreshAuthState();
        
        // if (result.success && result.user) {
        //   setStatus('success');
        //   setMessage('メール確認が完了しました！');
          
        //   // プロフィール設定ページにリダイレクト
        //   setTimeout(() => {
        //     navigate('/profile-setup');
        //   }, 2000);
        // } else {
        //   setStatus('error');
        //   setMessage('メール確認の処理中にエラーが発生しました。再度ログインをお試しください。');
        // }
      } catch (error) {
        console.error('メール確認処理中にエラーが発生:', error);
        setStatus('error');
        setMessage('予期しないエラーが発生しました。再度ログインをお試しください。');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, refreshAuthState, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">メール確認中...</h2>
            <p className="text-gray-600">しばらくお待ちください</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">メール確認完了！</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">プロフィール設定ページに移動します...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                ホームページに戻る
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                ログインページに戻る
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
