import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Gift, Clock, Star } from 'lucide-react';

const ContestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'ended'>('ongoing');

  // ダミーデータ（コンテスト）
  const contests = [
    {
      id: '1',
      title: '夏のイラストコンテスト2024',
      description: '夏をテーマにしたオリジナルイラストを募集中！優秀作品には豪華賞品をプレゼント。',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
      prize: '最優秀賞：10万円',
      deadline: '2024-08-31',
      participants: 156,
      status: 'ongoing',
      organizer: '運営事務局',
      tags: ['イラスト', '夏', 'オリジナル'],
    },
    {
      id: '2',
      title: '4コマ漫画グランプリ',
      description: '笑いあり涙ありの4コマ漫画を大募集！テーマは自由です。',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
      prize: '最優秀賞：5万円',
      deadline: '2024-09-15',
      participants: 89,
      status: 'ongoing',
      organizer: '漫画研究会',
      tags: ['4コマ', '漫画', 'コメディ'],
    },
    {
      id: '3',
      title: 'キャラクターデザインコンペ',
      description: '新しいマスコットキャラクターのデザインを募集します。',
      thumbnail: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
      prize: '採用賞：20万円',
      deadline: '2024-10-01',
      participants: 234,
      status: 'upcoming',
      organizer: '株式会社クリエイト',
      tags: ['キャラデザ', 'マスコット', 'オリジナル'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return '開催中';
      case 'upcoming': return '開催予定';
      case 'ended': return '終了';
      default: return '不明';
    }
  };

  const filteredContests = contests.filter(contest => contest.status === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">開催中のコンテスト一覧！</h1>
        </div>
        <p className="text-gray-600">
          様々なテーマのコンテストに参加して、あなたの才能を発揮しましょう！
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'ongoing'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          開催中
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          開催予定
        </button>
        <button
          onClick={() => setActiveTab('ended')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'ended'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          終了
        </button>
      </div>

      {/* コンテスト一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContests.map((contest) => (
          <div key={contest.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={contest.thumbnail}
                alt={contest.title}
                className="w-full h-48 object-cover"
              />
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contest.status)}`}>
                {getStatusText(contest.status)}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{contest.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{contest.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Gift className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="font-medium">{contest.prize}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-red-500" />
                  <span>締切: {contest.deadline}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{contest.participants}名参加中</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 mr-2 text-purple-500" />
                  <span>主催: {contest.organizer}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {contest.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <Link
                  to={`/contests/${contest.id}`}
                  className="flex-1 px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  詳細を見る
                </Link>
                {contest.status === 'ongoing' && (
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                    参加する
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空の状態 */}
      {filteredContests.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'ongoing' && '現在開催中のコンテストはありません'}
            {activeTab === 'upcoming' && '開催予定のコンテストはありません'}
            {activeTab === 'ended' && '終了したコンテストはありません'}
          </h3>
          <p className="text-gray-600">新しいコンテストをお待ちください。</p>
        </div>
      )}

      {/* コンテスト開催のお知らせ */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">コンテストを開催しませんか？</h2>
        <p className="text-gray-600 mb-4">
          企業様や団体様向けのコンテスト開催サービスも承っております。
          詳細はお問い合わせください。
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          お問い合わせ
        </button>
      </div>
    </div>
  );
};

export default ContestsPage;