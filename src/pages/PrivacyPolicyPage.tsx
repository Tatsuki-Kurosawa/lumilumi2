import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-cyan-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">プライバシーポリシー</h1>
          </div>

          <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年1月1日</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. はじめに</h2>
              <p className="text-gray-700 mb-4">
                イラストーク大学（以下「当サービス」）は、ユーザーの皆様の個人情報の保護を重要な責務と認識し、
                個人情報保護法その他の関連法令を遵守し、適切に取り扱います。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 収集する情報</h2>
              <p className="text-gray-700 mb-4">当サービスでは、以下の情報を収集します：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>アカウント情報（メールアドレス、ユーザー名、表示名）</li>
                <li>大学名、学年などのプロフィール情報</li>
                <li>投稿した作品およびコメント</li>
                <li>アクセスログ、IPアドレス、デバイス情報</li>
                <li>Cookie等の技術を用いて収集される情報</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 情報の利用目的</h2>
              <p className="text-gray-700 mb-4">収集した個人情報は、以下の目的で利用します：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>サービスの提供、維持、改善</li>
                <li>ユーザー認証およびアカウント管理</li>
                <li>コンテンツのパーソナライズ</li>
                <li>不正利用の防止およびセキュリティの確保</li>
                <li>お問い合わせへの対応</li>
                <li>利用規約違反への対応</li>
                <li>サービス改善のための統計データの作成</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 情報の第三者提供</h2>
              <p className="text-gray-700 mb-4">
                当サービスは、以下の場合を除き、ユーザーの同意なく第三者に個人情報を提供しません：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookie等の利用</h2>
              <p className="text-gray-700 mb-4">
                当サービスでは、ユーザーエクスペリエンスの向上、アクセス解析、広告配信のためにCookieおよび類似の技術を使用します。
                ブラウザの設定によりCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. セキュリティ</h2>
              <p className="text-gray-700 mb-4">
                当サービスは、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のため、
                適切な安全対策を講じます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. 個人情報の開示・訂正・削除</h2>
              <p className="text-gray-700 mb-4">
                ユーザーは、自己の個人情報について、開示、訂正、削除を求めることができます。
                これらのご請求については、<Link to="/contact" className="text-cyan-600 hover:underline">お問い合わせフォーム</Link>よりご連絡ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. プライバシーポリシーの変更</h2>
              <p className="text-gray-700 mb-4">
                当サービスは、必要に応じて本プライバシーポリシーの内容を変更することがあります。
                変更後のプライバシーポリシーは、当サイトに掲載した時点で効力を生じるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. お問い合わせ</h2>
              <p className="text-gray-700 mb-4">
                本プライバシーポリシーに関するお問い合わせは、
                <Link to="/contact" className="text-cyan-600 hover:underline">お問い合わせフォーム</Link>よりご連絡ください。
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

export default PrivacyPolicyPage;
