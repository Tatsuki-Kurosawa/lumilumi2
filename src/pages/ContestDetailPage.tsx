import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Gift, Clock, Star, ArrowLeft, Upload } from 'lucide-react';

const ContestDetailPage: React.FC = () => {
  const { id } = useParams();
  const [isParticipating, setIsParticipating] = useState(false);

  // ダミーデータ
  const contest = {
    id: id || '1',
    title: '夏のイラストコンテスト2024',
    description: '夏をテーマにしたオリジナルイラストを募集中！海、祭り、花火、かき氷など、夏を感じさせる要素を含んだオリジナルイラストを描いてください。デジタル・アナログ問わず、あなたの夏の思い出や想像する夏の風景を自由に表現してください。',
    thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800',
    prize: '最優秀賞：10万円、優秀賞：3万円、入選：1万円',
    deadline: '2024-08-31',
    participants: 156,
    status: 'ongoing',
    organizer: '運営事務局',
    tags: ['イラスト', '夏', 'オリジナル'],
    rules: [
      'オリジナル作品に限ります',
      '夏をテーマにした内容であること',
      '一人3作品まで応募可能',
      '他のコンテストとの重複応募は禁止',
      '商用利用可能な作品であること'
    ],
    judges: [
      { name: '田中先生', title: 'イラストレーター', avatar: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { name: '佐藤先生', title: 'アートディレクター', avatar: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=100' },
    ]
  };

  const submissions = [
    {
      id: '1',
      title: '夏祭りの夜',
      thumbnail: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=300',
      author: '太郎@東京大学',
      likes: 45,
    },
    {
      id: '2',
      title: '海辺の少女',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=300',
      author: '花子@京都大学og',
      likes: 32,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 戻るボタン */}
      <Link
        to="/contests"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        コンテスト一覧に戻る
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          {/* ヘッダー画像 */}
          <div className="relative mb-6">
            <img
              src={contest.thumbnail}
              alt={contest.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              開催中
            </div>
          </div>

          {/* タイトルと説明 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{contest.title}</h1>
            <p className="text-gray-700 leading-relaxed">{contest.description}</p>
          </div>

          {/* 応募ルール */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">応募ルール</h2>
            <ul className="space-y-2">
              {contest.rules.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 審査員 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">審査員</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contest.judges.map((judge, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={judge.avatar}
                    alt={judge.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{judge.name}</h3>
                    <p className="text-sm text-gray-600">{judge.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 応募作品 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">応募作品</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img
                    src={submission.thumbnail}
                    alt={submission.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{submission.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{submission.author}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>❤️ {submission.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* コンテスト情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">コンテスト情報</h2>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Gift className="h-4 w-4 mr-3 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">賞金</p>
                  <p className="text-gray-600">{contest.prize}</p>
                </div>
              </div>
              
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-3 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">締切</p>
                  <p className="text-gray-600">{contest.deadline}</p>
                </div>
              </div>
              
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-3 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">参加者数</p>
                  <p className="text-gray-600">{contest.participants}名</p>
                </div>
              </div>
              
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 mr-3 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">主催</p>
                  <p className="text-gray-600">{contest.organizer}</p>
                </div>
              </div>
            </div>

            {/* タグ */}
            <div className="mt-4">
              <p className="font-medium text-gray-900 mb-2">タグ</p>
              <div className="flex flex-wrap gap-2">
                {contest.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 参加ボタン */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              onClick={() => setIsParticipating(!isParticipating)}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                isParticipating
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              {isParticipating ? '作品を投稿' : 'コンテストに参加'}
            </button>
            
            {isParticipating && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                参加登録完了！作品を投稿してください
              </p>
            )}
          </div>

          {/* シェア */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-medium text-gray-900 mb-3">このコンテストをシェア</h3>
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                Twitter
              </button>
              <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                LINE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetailPage;