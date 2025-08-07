import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  User, 
  MessageSquare, 
  Calendar,
  Tag,
  AlertCircle,
  Send,
  Star,
  Eye,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');

  // ダミーデータ
  const request = {
    id: id || '1',
    type: 'correction',
    title: 'キャラクターイラストの添削をお願いします',
    description: `初心者です。人物の描き方について具体的なアドバイスをいただけると嬉しいです。

特に以下の点について教えていただきたいです：
• 人体のバランスの取り方
• 顔の描き方のコツ
• 色塗りの基本的な手順
• 影の付け方

添削していただいた内容は今後の作品制作に活かしたいと思います。
よろしくお願いいたします。`,
    budget: 1000,
    deadline: '2024-02-15',
    createdAt: '2024-01-10',
    requester: {
      id: 'user1',
      name: '初心者@東京大学',
      avatar: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=100',
      worksCount: 3,
      rating: 4.8,
    },
    status: 'open',
    applicants: 3,
    tags: ['添削', 'キャラクター', '初心者', 'イラスト'],
    attachments: [
      {
        id: '1',
        name: 'character_sketch.jpg',
        url: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=400',
        type: 'image'
      }
    ]
  };

  const applications = [
    {
      id: '1',
      applicant: {
        id: 'artist1',
        name: 'プロ絵師@京都大学og',
        avatar: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4.9,
        completedRequests: 45,
      },
      message: 'キャラクターイラストの添削を得意としています。3年間の指導経験があり、初心者の方にも分かりやすく説明いたします。',
      proposedBudget: 1000,
      appliedAt: '2024-01-11',
      portfolio: [
        'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=200',
      ]
    },
    {
      id: '2',
      applicant: {
        id: 'artist2',
        name: 'イラスト先生@早稲田大学',
        avatar: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4.7,
        completedRequests: 23,
      },
      message: '人体デッサンを専門としています。基礎から丁寧に指導させていただきます。',
      proposedBudget: 800,
      appliedAt: '2024-01-12',
      portfolio: [
        'https://images.pexels.com/photos/1266807/pexels-photo-1266807.jpeg?auto=compress&cs=tinysrgb&w=200',
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full font-medium">募集中</span>;
      case 'in_progress':
        return <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">進行中</span>;
      case 'completed':
        return <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full font-medium">完了</span>;
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

  const handleApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    // 応募処理の実装
    console.log('Application submitted:', {
      message: applicationMessage,
      budget: proposedBudget
    });
    
    setShowApplicationForm(false);
    setApplicationMessage('');
    setProposedBudget('');
    alert('応募を送信しました！');
  };

  const isMyRequest = user?.id === request.requester.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 戻るボタン */}
      <div className="mb-6">
        <Link
          to="/requests"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          依頼一覧に戻る
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 依頼情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(request.type)}`}>
                  {getTypeLabel(request.type)}
                </span>
                {getStatusBadge(request.status)}
              </div>
              <div className="text-right">
                <div className="flex items-center text-2xl font-bold text-green-600 mb-1">
                  <DollarSign className="h-6 w-6 mr-1" />
                  ¥{request.budget.toLocaleString()}
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{request.title}</h1>

            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>締切: {request.deadline}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>投稿: {request.createdAt}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{request.applicants}件の応募</span>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">依頼内容</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {request.description}
              </div>
            </div>

            {/* 添付ファイル */}
            {request.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">添付ファイル</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {request.attachments.map((attachment) => (
                    <div key={attachment.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2">
                        <p className="text-sm text-gray-600 truncate">{attachment.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* タグ */}
            <div>
              <div className="flex items-center mb-3">
                <Tag className="h-4 w-4 mr-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">タグ</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {request.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 応募者一覧 */}
          {(isMyRequest || request.status !== 'open') && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">応募者一覧</h2>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={application.applicant.avatar}
                            alt={application.applicant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{application.applicant.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span>{application.applicant.rating}</span>
                            </div>
                            <span>•</span>
                            <span>{application.applicant.completedRequests}件完了</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ¥{application.proposedBudget.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{application.appliedAt}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{application.message}</p>
                    
                    {application.portfolio.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">ポートフォリオ</p>
                        <div className="flex space-x-2">
                          {application.portfolio.map((image, index) => (
                            <div key={index} className="w-16 h-16 rounded-lg overflow-hidden">
                              <img
                                src={image}
                                alt={`Portfolio ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {isMyRequest && request.status === 'open' && (
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          採用する
                        </button>
                        <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                          メッセージ
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 依頼者情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">依頼者</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={request.requester.avatar}
                  alt={request.requester.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{request.requester.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{request.requester.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{request.requester.worksCount}作品</span>
                </div>
              </div>
            </div>
            <Link
              to={`/user/${request.requester.id}`}
              className="block w-full px-4 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              プロフィールを見る
            </Link>
          </div>

          {/* 応募フォーム */}
          {isAuthenticated && !isMyRequest && request.status === 'open' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">この依頼に応募</h3>
              
              {!showApplicationForm ? (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  応募する
                </button>
              ) : (
                <form onSubmit={handleApplication} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      提案金額 (円)
                    </label>
                    <input
                      type="number"
                      required
                      value={proposedBudget}
                      onChange={(e) => setProposedBudget(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      応募メッセージ
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="自己紹介や提案内容を記入してください..."
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      送信
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ログインが必要 */}
          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">ログインが必要です</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    依頼に応募するにはログインしてください
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 注意事項 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">注意事項</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 応募前に依頼内容をよく確認してください</li>
              <li>• 納期は必ず守るようにしてください</li>
              <li>• 不明な点は事前に質問してください</li>
              <li>• 著作権に関する取り決めを確認してください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;