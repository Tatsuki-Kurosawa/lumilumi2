import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import WorkCard from '../components/WorkCard';

const R18Page: React.FC = () => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(true);

  // ダミーデータ（R-18作品）
  const r18Works = [
    {
      id: 'r18-1',
      title: 'アート作品 1',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'アーティスト@東京大学',
      likes: 89,
      views: 456,
      tags: ['アート', '成人向け'],
    },
    {
      id: 'r18-2',
      title: 'アート作品 2',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'クリエイター@京都大学og',
      likes: 67,
      views: 234,
      tags: ['イラスト', '成人向け'],
    },
  ];

  const handleAgeConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      setAgeConfirmed(true);
      setShowConfirmation(false);
    } else {
      // 18歳未満の場合は前のページに戻る
      window.history.back();
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">年齢確認</h1>
          
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-3">
              このページには18歳以上の方のみアクセスできるコンテンツが含まれています。
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 18歳未満の方はアクセスできません</li>
              <li>• 成人向けコンテンツが含まれます</li>
              <li>• 適切な環境でご利用ください</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleAgeConfirmation(true)}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              18歳以上です
            </button>
            <button
              onClick={() => handleAgeConfirmation(false)}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              18歳未満です
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            このサイトを利用することで、利用規約に同意したものとみなされます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 警告ヘッダー */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-red-800">R-18コンテンツ</h2>
            <p className="text-sm text-red-700">
              このページには18歳以上の方向けのコンテンツが含まれています。適切な環境でご利用ください。
            </p>
          </div>
          <button
            onClick={() => setShowConfirmation(true)}
            className="ml-auto p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
          >
            <EyeOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">R-18作品</h1>
        <p className="text-gray-600">
          18歳以上の方向けの創作作品を掲載しています。
        </p>
      </div>

      {/* フィルター */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="R-18作品を検索..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <Eye className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center space-x-4">
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
            <option value="latest">新着順</option>
            <option value="popular">人気順</option>
            <option value="likes">いいね順</option>
          </select>
        </div>
      </div>

      {/* 作品一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {r18Works.map((work) => (
          <div key={work.id} className="relative">
            {/* ぼかしオーバーレイ */}
            <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center group hover:bg-opacity-10 hover:backdrop-blur-none transition-all duration-200">
              <div className="text-white text-center group-hover:opacity-0 transition-opacity">
                <Eye className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">クリックして表示</p>
              </div>
            </div>
            <WorkCard work={work} />
          </div>
        ))}
      </div>

      {/* 空の状態 */}
      {r18Works.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">R-18作品がありません</h3>
          <p className="text-gray-600">現在、R-18作品は投稿されていません。</p>
        </div>
      )}

      {/* フッター注意書き */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>このページのコンテンツは18歳以上の方向けです。</p>
        <p>不適切なコンテンツを発見した場合は、運営までご報告ください。</p>
      </div>
    </div>
  );
};

export default R18Page;