import React, { useState } from 'react';
import { testSupabaseConnection, checkDatabaseSchema } from '../lib/supabaseClient';

const SupabaseTest: React.FC = () => {
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [schemaResult, setSchemaResult] = useState<any>(null);
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Supabase接続テスト</h2>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleConnectionTest}
              disabled={isLoading}
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">データベーススキーマ確認</h2>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleSchemaCheck}
              disabled={isLoading}
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">テスト結果の確認方法</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• ブラウザの開発者ツール（F12）のコンソールタブで詳細なログを確認できます</li>
          <li>• 接続テストが成功したら、データベースとの通信が正常に動作しています</li>
          <li>• スキーマ確認で各テーブルの存在とアクセス権限を確認できます</li>
          <li>• エラーが発生した場合は、環境変数とSupabaseプロジェクトの設定を確認してください</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseTest;
