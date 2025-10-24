import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const GuidelinesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <BookOpen className="h-8 w-8 text-cyan-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">投稿ガイドライン</h1>
          </div>

          <p className="text-gray-600 mb-8">
            イラストーク大学は、クリエイターが安心して作品を発表できる場を目指しています。
            以下のガイドラインを守って、楽しく創作活動を行いましょう。
          </p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">投稿可能な作品</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>自作のマンガ、イラスト作品</li>
                <li>二次創作作品（著作権者が認めている範囲内）</li>
                <li>オリジナル作品</li>
                <li>習作、落書きなども歓迎します</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">投稿禁止事項</h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="font-medium text-red-800 mb-2">以下の内容を含む作品は投稿できません</p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>他者の著作権、肖像権、プライバシーを侵害するもの</li>
                <li>第三者の作品を無断転載したもの</li>
                <li>公序良俗に反するもの</li>
                <li>過度に暴力的、グロテスクな表現を含むもの</li>
                <li>特定の個人、団体への誹謗中傷を含むもの</li>
                <li>差別的な表現を含むもの</li>
                <li>犯罪行為を助長するもの</li>
                <li>商用広告、宣伝目的のもの</li>
                <li>実在の未成年者を性的対象としたもの</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">R-18作品について</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                <p className="font-medium text-yellow-800 mb-2">R-18作品を投稿する場合の注意事項</p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>投稿時に必ずR-18フラグを設定してください</li>
                <li>サムネイル画像に過激な表現を含めないでください</li>
                <li>18歳未満のキャラクターを性的対象とした作品は禁止です</li>
                <li>実在の人物を性的対象とした作品は禁止です</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">二次創作について</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>原作の著作権者が二次創作を認めている作品のみ投稿可能です</li>
                <li>二次創作ガイドラインがある場合は、それに従ってください</li>
                <li>作品タイトルまたは説明文に原作名を明記してください</li>
                <li>二次創作であることを明示してください</li>
                <li>商用利用が禁止されている作品の二次創作で収益化しないでください</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">コメント・コミュニケーション</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>他のクリエイターの作品には敬意を持ってコメントしましょう</li>
                <li>建設的な批評は歓迎しますが、誹謗中傷は禁止です</li>
                <li>作者の意図を尊重しましょう</li>
                <li>スパム、宣伝目的のコメントは禁止です</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">違反を見つけた場合</h2>
              <p className="text-gray-700 mb-4">
                ガイドラインに違反する作品やコメントを見つけた場合は、作品ページの報告ボタンから運営にご連絡ください。
                運営チームが内容を確認し、適切に対応いたします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">違反時の対応</h2>
              <p className="text-gray-700 mb-4">
                ガイドラインに違反した場合、以下の対応を行う場合があります：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>作品の非公開化または削除</li>
                <li>アカウントの一時停止</li>
                <li>アカウントの永久停止</li>
                <li>法的措置（悪質な場合）</li>
              </ul>
            </section>

            <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 mt-8">
              <p className="text-cyan-900">
                <strong>最後に:</strong> イラストーク大学は、クリエイター同士が互いに尊重し合い、
                成長できるコミュニティを目指しています。皆さんのご協力をお願いいたします。
              </p>
            </div>
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

export default GuidelinesPage;
