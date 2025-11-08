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

          <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年11月8日</p>

          <div className="prose max-w-none">

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">販売事業者</h2>
              <p className="text-gray-700">合同会社LUMiTOON</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">運営責任者</h2>
              <p className="text-gray-700">秦　啓明</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">所在地</h2>
              <p className="text-gray-700">〒112-0015</p>
              <p className="text-gray-700">東京都文京区目白台1-21-2</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">お問い合わせ</h2>
              <p className="text-gray-700">（例）
                <Link to="/contact" className="text-cyan-600 hover:underline">
                  お問い合わせフォーム
                </Link>
                よりご連絡ください
              </p>
              <p className="text-gray-700">（例）Eメール:info@mangabirth.com</p>
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
                有料サービスを提供する場合は、各作品ページに表示します。
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">商品代金以外の必要料金</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>インターネット接続にかかる通信料金等はお客様のご負担となります</li>
                <li>銀行振込をご利用の場合は振込手数料</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">支払方法</h2>
              <p className="text-gray-700">
              クレジットカード決済／銀行振込／コンビニ決済／各種決済サービス（PayPay等）
              </p>
              <p className="text-gray-700">※導入している決済方法に応じて記載</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">支払時期</h2>
              <p className="text-gray-700">
                有料サービスを提供する場合に別途定めます。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>商品購入時に即時決済されます</li>
                <li>銀行振込の場合は前払いとなります</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">サービスの提供時期</h2>
              <p className="text-gray-700">
                アカウント登録後、即時ご利用いただけます。
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">商品の引き渡し時期</h2>
              <p className="text-gray-700">
                決済完了後、マイページまたは購入完了ページから即時閲覧・ダウンロードが可能です
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">返品・キャンセルについて</h2>
              <p className="text-gray-700">
                商品の性質上（デジタルコンテンツ）、購入後の返品・返金・キャンセルは原則としてお受けしておりません
              </p>
              <p className="text-gray-700 mt-2">
                ただし、閲覧不具合やダウンロード不能など、当方に原因がある場合は速やかに対応いたします
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
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>本サイトで提供する作品の著作権はすべて著作権者に帰属します</li>
                <li>無断転載、二次配布を禁止します</li>
                <li>サービスの詳細については、
                <Link to="/terms" className="text-cyan-600 hover:underline">利用規約</Link>
                をご確認ください。</li>
              </ul>
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
