import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-cyan-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">利用規約</h1>
          </div>

          <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年1月1日</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
              <p className="text-gray-700 mb-4">
                本規約は、イラストーク大学（以下「当サービス」）の利用に関する条件を、
                ユーザーと当サービス運営者との間で定めるものです。
              </p>
              <p className="text-gray-700 mb-4">
                ユーザーは、本規約に同意した上で当サービスを利用するものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第2条（定義）</h2>
              <p className="text-gray-700 mb-4">本規約において、以下の用語は以下の意味で使用します：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>「ユーザー」: 当サービスを利用する全ての個人</li>
                <li>「登録ユーザー」: 当サービスにアカウントを登録したユーザー</li>
                <li>「コンテンツ」: ユーザーが投稿した作品、コメント、その他の情報</li>
                <li>「知的財産権」: 著作権、特許権、実用新案権、商標権、意匠権その他の知的財産権</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条（登録）</h2>
              <p className="text-gray-700 mb-4">
                ユーザーは、当サービスの定める方法により登録を申請し、当サービスが承認することにより登録が完了します。
              </p>
              <p className="text-gray-700 mb-4">以下のいずれかに該当する場合、登録を承認しないことがあります：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>虚偽の情報を登録した場合</li>
                <li>過去に利用規約違反により登録を抹消されたことがある場合</li>
                <li>その他、当サービスが不適切と判断した場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第4条（アカウント管理）</h2>
              <p className="text-gray-700 mb-4">
                登録ユーザーは、自己の責任においてアカウント情報を管理するものとします。
                アカウント情報の管理不十分により生じた損害について、当サービスは一切責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第5条（コンテンツの投稿）</h2>
              <p className="text-gray-700 mb-4">ユーザーは、以下の内容を含むコンテンツを投稿してはなりません：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>第三者の知的財産権を侵害するもの</li>
                <li>第三者の名誉・プライバシーを侵害するもの</li>
                <li>わいせつ、暴力的、または差別的な表現を含むもの</li>
                <li>犯罪行為に関連するもの</li>
                <li>公序良俗に反するもの</li>
                <li>虚偽または誤解を招く情報</li>
                <li>スパムまたは勧誘目的のもの</li>
                <li>その他、当サービスが不適切と判断するもの</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第6条（知的財産権）</h2>
              <p className="text-gray-700 mb-4">
                ユーザーが投稿したコンテンツの知的財産権は、投稿したユーザーに帰属します。
              </p>
              <p className="text-gray-700 mb-4">
                ただし、ユーザーは当サービスに対し、投稿したコンテンツを当サービスの運営、
                プロモーション、改善等の目的で使用する非独占的な権利を許諾するものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第7条（禁止事項）</h2>
              <p className="text-gray-700 mb-4">ユーザーは、以下の行為を行ってはなりません：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>法令または本規約に違反する行為</li>
                <li>他のユーザーまたは第三者の権利を侵害する行為</li>
                <li>当サービスの運営を妨害する行為</li>
                <li>不正アクセスまたはこれに類する行為</li>
                <li>当サービスの信用を毀損する行為</li>
                <li>他のユーザーの情報を無断で収集する行為</li>
                <li>複数のアカウントを不正に作成する行為</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第8条（サービスの変更・停止）</h2>
              <p className="text-gray-700 mb-4">
                当サービスは、事前の予告なくサービスの内容を変更、または提供を停止することがあります。
                これにより生じた損害について、当サービスは一切責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第9条（免責事項）</h2>
              <p className="text-gray-700 mb-4">
                当サービスは、サービスの内容、ユーザーが投稿したコンテンツ、その他当サービスに関連する事項について、
                明示または黙示を問わず、いかなる保証も行いません。
              </p>
              <p className="text-gray-700 mb-4">
                当サービスの利用により生じた損害について、当サービスは一切責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第10条（規約の変更）</h2>
              <p className="text-gray-700 mb-4">
                当サービスは、必要に応じて本規約を変更することがあります。
                変更後の規約は、当サイトに掲載した時点で効力を生じるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第11条（準拠法および管轄裁判所）</h2>
              <p className="text-gray-700 mb-4">
                本規約の準拠法は日本法とし、本規約に関する紛争については、
                東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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

export default TermsOfServicePage;
