import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const CompanyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Building2 className="h-8 w-8 text-cyan-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">運営会社</h1>
          </div>

          <div className="prose max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <p className="text-sm text-blue-800">
                <strong>注意:</strong> 以下は参考例です。実際の運営情報に置き換えてください。
              </p>
            </div>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">サービス名</h2>
              <p className="text-gray-700">イラストーク大学 (LumiLumi)</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">運営組織</h2>
              <p className="text-gray-700">イラストーク大学運営事務局</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">設立</h2>
              <p className="text-gray-700">2025年</p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">事業内容</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>学生クリエイター向け作品投稿プラットフォームの運営</li>
                <li>クリエイター支援サービスの提供</li>
                <li>創作活動に関するコミュニティの運営</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">お問い合わせ</h2>
              <p className="text-gray-700">
                <Link to="/contact" className="text-cyan-600 hover:underline">
                  お問い合わせフォーム
                </Link>
                よりご連絡ください
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">ミッション</h2>
              <p className="text-gray-700">
                学生クリエイターが安心して作品を発表し、成長できる場を提供することで、
                次世代のクリエイティブ文化を育成します。
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

export default CompanyPage;
