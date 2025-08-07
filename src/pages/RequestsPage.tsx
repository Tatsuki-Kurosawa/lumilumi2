import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Clock, DollarSign, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RequestsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-requests' | 'my-offers'>('browse');
  const [requestType, setRequestType] = useState<'all' | 'correction' | 'commission'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ダミーデータ
  const requests = [
    {
      id: '1',
      type: 'correction',
      title: 'キャラクターイラストの添削をお願いします',
      description: '初心者です。人物の描き方について具体的なアドバイスをいただけると嬉しいです。',
      budget: 1000,
      deadline: '2024-02-15',
      requester: '初心者@東京大学',
      status: 'open',
      applicants: 3,
      tags: ['添削', 'キャラクター', '初心者'],
    },
    {
      id: '2',
      type: 'commission',
      title: 'サークルのロゴデザイン制作依頼',
      description: '大学のイラストサークルのロゴを制作していただける方を募集しています。',
      budget: 5000,
      deadline: '2024-02-20',
      requester: '部長@京都大学',
      status: 'open',
      applicants: 7,
      tags: ['ロゴ', 'デザイン', 'サークル'],
    },
    {
      id: '3',
      type: 'commission',
      title: '漫画の背景イラスト制作',
      description: '学園もののWebマンガ用の背景イラストを数点お願いしたいです。',
      budget: 8000,
      deadline: '2024-03-01',
      requester: '漫画家@大阪大学',
      status: 'in_progress',
      applicants: 12,
      tags: ['背景', '漫画', '学園'],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">募集中</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">進行中</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">完了</span>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'correction':
        return '添削依頼';
      case 'commission':
        return '制作依頼';
      default:
        return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'correction':
        return 'bg-orange-100 text-orange-800';
      case 'commission':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">依頼・添削</h1>
          <p className="text-gray-600">作品の添削依頼や制作依頼を投稿・受注できます</p>
        </div>
        {isAuthenticated && (
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            依頼を投稿
          </button>
        )}
      </div>

      {/* タブ */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'browse'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          依頼を探す
        </button>
        {isAuthenticated && (
          <>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'my-requests'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              投稿した依頼
            </button>
            <button
              onClick={() => setActiveTab('my-offers')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'my-offers'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              応募した依頼
            </button>
          </>
        )}
      </div>

      {/* フィルター */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="依頼を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="correction">添削依頼</option>
            <option value="commission">制作依頼</option>
          </select>
          
          <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5 mr-2" />
            詳細フィルター
          </button>
        </div>
      </div>

      {/* 依頼一覧 */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(request.type)}`}>
                  {getTypeLabel(request.type)}
                </span>
                {getStatusBadge(request.status)}
              </div>
              <div className="text-right">
                <div className="flex items-center text-lg font-bold text-green-600 mb-1">
                  <DollarSign className="h-5 w-5 mr-1" />
                  ¥{request.budget.toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {request.deadline}まで
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
              {request.title}
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {request.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {request.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                <span>{request.requester}</span>
                <MessageSquare className="h-4 w-4 ml-4 mr-1" />
                <span>{request.applicants}件の応募</span>
              </div>
              
              <div className="flex space-x-3">
                <Link
                  to={`/requests/${request.id}`}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  詳細を見る
                </Link>
                {request.status === 'open' && isAuthenticated && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    応募する
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空の状態 */}
      {!isAuthenticated && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ログインして依頼に参加しよう</h3>
          <p className="text-gray-600 mb-4">
            ログインすると依頼の投稿や応募ができるようになります
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ログイン
          </button>
        </div>
      )}

      {/* ページネーション */}
      <div className="mt-8 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            前へ
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`px-3 py-2 rounded-md transition-colors ${
                page === 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            次へ
          </button>
        </nav>
      </div>
    </div>
  );
};

export default RequestsPage;