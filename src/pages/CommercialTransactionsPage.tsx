import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const CommercialTransactionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-cyan-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">特定商取引法に基づく表記</h1>
          </div>

          <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年1月1日</p>

          <div className="prose max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-sm text-yellow-800">
                <strong>注意:</strong> 以下は参考例です。実際の運営情報に置き換えてください。
              </p>
            </div>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">販売事業者</h2>
              <p className="text-gray-700">イラストーク大学運営事務局</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">運営責任者</h2>
              <p className="text-gray-700">[運営責任者名]</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">所在地</h2>
              <p className="text-gray-700">〒xxx-xxxx</p>
              <p className="text-gray-700">[住所]</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">お問い合わせ</h2>
              <p className="text-gray-700">
                <Link to="/contact" className="text-cyan-600 hover:underline">
                  お問い合わせフォーム
                </Link>
                よりご連絡ください
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ※電話でのお問い合わせは受け付けておりません
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">販売価格</h2>
              <p className="text-gray-700">
                当サービスは基本無料でご利用いただけます。
              </p>
              <p className="text-gray-700">
                有料サービスを提供する場合は、各サービスのページに表示します。
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">支払方法</h2>
              <p className="text-gray-700">
                有料サービスを提供する場合に別途定めます。
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">支払時期</h2>
              <p className="text-gray-700">
                有料サービスを提供する場合に別途定めます。
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">サービスの提供時期</h2>
              <p className="text-gray-700">
                アカウント登録後、即時ご利用いただけます。
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">返品・キャンセルについて</h2>
              <p className="text-gray-700">
                サービスの性質上、原則として返品・キャンセルはお受けできません。
              </p>
              <p className="text-gray-700 mt-2">
                ただし、有料サービスについては、各サービスの利用規約に従います。
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">動作環境</h2>
              <p className="text-gray-700 mb-2">以下の環境でのご利用を推奨します：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>最新バージョンのChrome、Firefox、Safari、Edge</li>
                <li>JavaScript有効</li>
                <li>Cookie有効</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">その他</h2>
              <p className="text-gray-700">
                サービスの詳細については、
                <Link to="/terms" className="text-cyan-600 hover:underline">利用規約</Link>
                をご確認ください。
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialTransactionsPage;
