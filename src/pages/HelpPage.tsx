import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronRight } from 'lucide-react';

const HelpPage: React.FC = () => {
  const faqs = [
    {
      category: "アカウント・登録",
      questions: [
        { q: "アカウント登録に必要なものは？", a: "メールアドレスとパスワードのみで登録できます。学生であることの確認は、大学メールアドレスまたは学生証の提示で行います。" },
        { q: "パスワードを忘れました", a: "ログイン画面の「パスワードを忘れた方」をクリックし、登録メールアドレスを入力してください。パスワードリセット用のメールが届きます。" },
        { q: "メールアドレスを変更したい", a: "マイページの設定から変更できます。変更後、新しいメールアドレスに確認メールが送信されます。" }
      ]
    },
    {
      category: "作品投稿",
      questions: [
        { q: "投稿できるファイル形式は？", a: "JPEG、PNGファイルに対応しています。1作品あたり最大50枚の画像を投稿できます。" },
        { q: "ファイルサイズの上限は？", a: "1ファイルあたり10MBまで投稿可能です。" },
        { q: "投稿した作品を削除できますか？", a: "はい、マイページの投稿一覧から削除できます。ただし、削除後は復元できませんのでご注意ください。" }
      ]
    },
    {
      category: "R-18コンテンツ",
      questions: [
        { q: "R-18作品を投稿できますか？", a: "18歳以上のユーザーであれば投稿可能です。投稿時にR-18フラグを必ず設定してください。" },
        { q: "R-18作品の閲覧について", a: "R-18作品は、18歳以上であることを確認したユーザーのみが閲覧できます。初回閲覧時に年齢確認が必要です。" }
      ]
    },
    {
      category: "その他",
      questions: [
        { q: "退会したい", a: "マイページの設定から退会手続きができます。退会すると、すべての投稿作品とアカウント情報が削除されます。" },
        { q: "不適切なコンテンツを見つけました", a: "各作品ページの報告ボタンから運営に報告してください。迅速に対応いたします。" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <HelpCircle className="h-8 w-8 text-cyan-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">ヘルプ・よくある質問</h1>
          </div>

          <p className="text-gray-600 mb-8">
            イラストーク大学の使い方や、よくある質問をまとめました。
            解決しない場合は<Link to="/contact" className="text-cyan-600 hover:underline">お問い合わせ</Link>ください。
          </p>

          <div className="space-y-8">
            {faqs.map((category, index) => (
              <div key={index}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-cyan-500">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-cyan-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Q: {faq.q}</h3>
                          <p className="text-gray-700 text-sm">A: {faq.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              お困りの内容が見つかりませんか？
              <Link to="/contact" className="text-cyan-600 hover:underline font-medium ml-1">
                お問い合わせフォーム
              </Link>
              からご連絡ください。
            </p>
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

export default HelpPage;
