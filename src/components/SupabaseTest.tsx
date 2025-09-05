import React, { useState } from 'react';
import { 
  testSupabaseConnection, 
  checkDatabaseSchema, 
  checkAuthStatus, 
  checkEnvironmentVariables,
  isSupabaseReady 
} from '../lib/supabaseClient';

const SupabaseTest: React.FC = () => {
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [schemaResult, setSchemaResult] = useState<any>(null);
  const [authResult, setAuthResult] = useState<any>(null);
  const [envResult, setEnvResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectionTest = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionResult(result);
      console.log('接続テスト結果:', result);
    } catch (error) {
      console.error('接続テスト中にエラーが発生:', error);
      setConnectionResult({ success: false, error: 'テスト実行中にエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchemaCheck = async () => {
    setIsLoading(true);
    try {
      const result = await checkDatabaseSchema();
      setSchemaResult(result);
      console.log('スキーマ確認結果:', result);
    } catch (error) {
      console.error('スキーマ確認中にエラーが発生:', error);
      setSchemaResult({ success: false, error: 'スキーマ確認中にエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCheck = async () => {
    setIsLoading(true);
    try {
      const result = await checkAuthStatus();
      setAuthResult(result);
      console.log('認証状態確認結果:', result);
    } catch (error) {
      console.error('認証状態確認中にエラーが発生:', error);
      setAuthResult({ success: false, error: '認証状態確認中にエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnvCheck = () => {
    const result = checkEnvironmentVariables();
    setEnvResult(result);
    console.log('環境変数確認結果:', result);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 環境変数確認 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">環境変数確認</h2>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleEnvCheck}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              環境変数確認
            </button>
          </div>

          {envResult && (
            <div className={`p-4 rounded-lg ${
              envResult.isReady 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <h3 className="font-semibold mb-2">
                {envResult.isReady ? '✅ 環境変数設定完了' : '❌ 環境変数設定不足'}
              </h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(envResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Supabase接続テスト */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Supabase接続テスト</h2>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleConnectionTest}
              disabled={isLoading || !isSupabaseReady()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'テスト中...' : '接続テスト実行'}
            </button>
          </div>

          {connectionResult && (
            <div className={`p-4 rounded-lg ${
              connectionResult.success 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <h3 className="font-semibold mb-2">
                {connectionResult.success ? '✅ 接続成功' : '❌ 接続失敗'}
              </h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(connectionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* データベーススキーマ確認 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">データベーススキーマ確認</h2>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleSchemaCheck}
              disabled={isLoading || !isSupabaseReady()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '確認中...' : 'スキーマ確認実行'}
            </button>
          </div>

          {schemaResult && (
            <div className={`p-4 rounded-lg ${
              schemaResult.success 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <h3 className="font-semibold mb-2">
                {schemaResult.success ? '✅ スキーマ確認完了' : '❌ スキーマ確認失敗'}
              </h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(schemaResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 認証状態確認 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">認証状態確認</h2>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleAuthCheck}
              disabled={isLoading || !isSupabaseReady()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '確認中...' : '認証状態確認'}
            </button>
          </div>

          {authResult && (
            <div className={`p-4 rounded-lg ${
              authResult.success 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <h3 className="font-semibold mb-2">
                {authResult.success ? '✅ 認証状態確認完了' : '❌ 認証状態確認失敗'}
              </h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(authResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 診断結果と対処法 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">診断結果と対処法</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>環境変数確認</strong>: .env.localファイルの設定状況を確認</li>
          <li>• <strong>接続テスト</strong>: Supabaseとの通信が正常に動作するか確認</li>
          <li>• <strong>スキーマ確認</strong>: 必要なテーブルが存在し、アクセス権限があるか確認</li>
          <li>• <strong>認証状態確認</strong>: 認証機能が正常に動作するか確認</li>
          <li>• ブラウザの開発者ツール（F12）のコンソールタブで詳細なログを確認できます</li>
          <li>• エラーが発生した場合は、各項目の対処法に従って設定を確認してください</li>
        </ul>
      </div>

      {/* 新規登録時の問題診断 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">新規登録時の問題診断</h3>
        <ul className="text-yellow-800 space-y-1 text-sm">
          <li>• <strong>500エラーが発生する場合</strong>: 環境変数とSupabase接続を確認</li>
          <li>• <strong>テーブルが見つからない場合</strong>: データベーススキーマを確認</li>
          <li>• <strong>認証エラーが発生する場合</strong>: RLSポリシーとテーブル権限を確認</li>
          <li>• <strong>プロフィール作成エラー</strong>: profilesテーブルの構造と制約を確認</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseTest;
