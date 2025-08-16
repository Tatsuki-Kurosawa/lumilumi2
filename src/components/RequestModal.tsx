import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  onSubmit: (requestData: any) => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, creatorName, onSubmit }) => {
  const [formData, setFormData] = useState({
    genre: '',
    amount: '',
    content: '',
    recipientName: '',
    responseDeadline: '',
    paymentMethod: '',
  });

  const genres = [
    'イラスト',
    'キャラクターデザイン',
    'マンガ',
    '4コマ漫画',
    'ロゴデザイン',
    'バナーデザイン',
    'その他',
  ];

  const responseDeadlines = [
    '1日以内',
    '3日以内',
    '1週間以内',
    '2週間以内',
    '1ヶ月以内',
  ];

  const paymentMethods = [
    'クレジットカード',
    '銀行振込',
    'PayPal',
    'その他',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // フォームをリセット
    setFormData({
      genre: '',
      amount: '',
      content: '',
      recipientName: '',
      responseDeadline: '',
      paymentMethod: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {creatorName}に依頼する
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ジャンル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ジャンル <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ジャンルを選択してください</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* 依頼金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              依頼金額 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1000"
                step="100"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10000"
              />
              <span className="absolute right-4 top-3.5 text-gray-500">円</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">最低金額: 1,000円</p>
          </div>

          {/* 依頼内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              依頼内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="依頼したい内容を詳しく記載してください。&#10;&#10;例：&#10;・キャラクターの特徴&#10;・イメージや参考資料&#10;・サイズや形式の指定&#10;・その他の要望"
              maxLength={2000}
            />
            <p className="text-sm text-gray-500 mt-1">{formData.content.length}/2000文字</p>
          </div>

          {/* 宛名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              宛名
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="作品に記載する宛名（任意）"
              maxLength={50}
            />
          </div>

          {/* 返答締め切り日数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              返答締め切り日数 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.responseDeadline}
              onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">返答期限を選択してください</option>
              {responseDeadlines.map((deadline) => (
                <option key={deadline} value={deadline}>{deadline}</option>
              ))}
            </select>
          </div>

          {/* 支払方法 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              支払方法 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">支払方法を選択してください</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">ご注意</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 依頼送信後のキャンセルはできません</li>
              <li>• クリエイターが承諾するまで料金は発生しません</li>
              <li>• 返答期限内にクリエイターから連絡がない場合、依頼は自動的にキャンセルされます</li>
              <li>• 作品の著作権は制作者に帰属します</li>
            </ul>
          </div>

          {/* 送信ボタン */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            
            <button
              type="submit"
              className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Send className="h-5 w-5 mr-2" />
              依頼を送信する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;