import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Users, Heart, Sparkles, BookOpen, TrendingUp } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-secondary py-16 relative overflow-hidden">
      {/* 背景アイコン */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/mangaumaretaro.jpg"
          alt="イラストーク大学"
          className="w-96 h-96 opacity-5 object-contain"
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="bg-bg-base rounded-lg shadow-medium p-10 md:p-12">
          {/* 新しい内容 */}
          <div className="prose max-w-none">
            {/* タイトル */}
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-16 leading-tight">
              ～若いクリエイターの才能を支え、社会を動かす～
            </h1>

            {/* イラストーク大学とは？ */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-text-primary mb-8">イラストーク大学とは？</h2>
              <div className="text-text-secondary leading-relaxed space-y-6 text-base">
                <p>
                  イラストーク大学は、学生を中心とした若きクリエイターを応援するコミュニティサイトです。
                </p>
                <p>
                  技術の進歩によって、AIが瞬時に"創作物"を生み出せる時代となり、均一化された、人の意志を持たない作品がインターネット上に溢れています。
                </p>
                <p>
                  そんな現代だからこそ、若きクリエイターの想像力にあふれた作品が埋もれることなく、社会に届く環境を作りたいとの思いから活動を開始しました。
                </p>
                <p>
                  現在はWEBでの作品の公開や、イラスト・漫画を中心としたクリエイター同士の交流支援、及び企業との協業も視野に入れた活動を行っております。
                </p>
                <p className="mt-8 text-lg font-medium">
                  皆様のご参加・ご支援をお待ちしております。
                </p>
              </div>
            </section>

            {/* 署名 */}
            <section className="mt-16 pt-10 border-t border-gray-200">
              <div className="text-text-secondary space-y-3 text-right font-medium">
                <p>東京大学　けい</p>
                <p>東京理科大学　ほり</p>
                <p>早稲田大学　ゆゆ</p>
              </div>
            </section>
          </div>

          {/* 元の内容（コメントアウト） */}
          {/*
          <div className="flex items-center mb-6">
            <Sparkles className="h-8 w-8 text-cyan-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">イラストーク大学について</h1>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">私たちのビジョン</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                イラストーク大学は、学生クリエイターのための創作プラットフォームです。
                あなたの描いた漫画・イラストを世界に発信し、同じ志を持つ仲間と繋がり、
                お互いに刺激し合いながら成長できる場所を目指しています。
              </p>
              <p className="text-gray-700 leading-relaxed">
                創作活動を通じて、学生時代にしかできない経験を積み、
                次世代のクリエイティブ文化を一緒に築いていきましょう。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">主な機能</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Palette className="h-6 w-6 text-cyan-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">簡単投稿</h3>
                    <p className="text-gray-700">
                      ドラッグ&ドロップで簡単に作品を投稿。マンガとイラストの両方に対応し、
                      タグ付けで作品を整理できます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-cyan-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">学生コミュニティ</h3>
                    <p className="text-gray-700">
                      同じ大学や他大学の学生クリエイターと繋がり、
                      お互いの作品にフィードバックを送り合えます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Heart className="h-6 w-6 text-cyan-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">いいね・評価機能</h3>
                    <p className="text-gray-700">
                      気に入った作品にいいねを送り、クリエイターを応援。
                      人気の作品はランキングに表示されます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-cyan-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">依頼システム</h3>
                    <p className="text-gray-700">
                      作品の添削依頼や新規制作依頼を通じて、
                      スキルアップと収益化の両方を実現できます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-cyan-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">ランキング機能</h3>
                    <p className="text-gray-700">
                      人気作品やトレンド作品をランキング形式で表示。
                      注目を集める作品を簡単に発見できます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-cyan-600 mt-1" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">安心・安全な環境</h3>
                    <p className="text-gray-700">
                      学生限定のコミュニティで、ガイドラインに基づいた
                      健全な創作活動をサポートします。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">対象ユーザー</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>漫画やイラストを描くのが好きな学生</li>
                <li>自分の作品を多くの人に見てもらいたい学生クリエイター</li>
                <li>同じ趣味を持つ仲間と繋がりたい方</li>
                <li>創作活動を通じてスキルアップしたい方</li>
                <li>将来クリエイターとして活動したい方</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">無料で始められます</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                イラストーク大学は完全無料でご利用いただけます。
                アカウント登録後、すぐに作品の投稿や閲覧が可能です。
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">お問い合わせ</h2>
              <p className="text-gray-700">
                ご質問やご要望がございましたら、
                <Link to="/contact" className="text-cyan-600 hover:underline mx-1">
                  お問い合わせフォーム
                </Link>
                よりご連絡ください。
              </p>
            </section>
          </div>
          */}

          <div className="mt-12 pt-10 border-t border-gray-200">
            <Link
              to="/"
              className="text-primary-500 hover:text-primary-600 font-semibold transition-colors inline-flex items-center"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
