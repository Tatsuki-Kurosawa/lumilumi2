import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, FileText, Shield, BookOpen, HelpCircle, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* サービス情報 */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">イラストーク大学について</h3>
            <p className="text-sm text-gray-400 mb-4">
              学生クリエイターのための漫画・イラスト投稿プラットフォーム。あなたの創作活動を応援します。
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* サービス */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">サービス</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors">
                  イラストーク大学について
                </Link>
              </li>
              <li>
                <Link to="/manga" className="hover:text-cyan-400 transition-colors">
                  マンガ
                </Link>
              </li>
              <li>
                <Link to="/illustrations" className="hover:text-cyan-400 transition-colors">
                  イラスト
                </Link>
              </li>
              <li>
                <Link to="/works" className="hover:text-cyan-400 transition-colors">
                  作品一覧
                </Link>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">
                  コンテスト（近日公開）
                </span>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">サポート</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="flex items-center hover:text-cyan-400 transition-colors">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  ヘルプ・よくある質問
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="flex items-center hover:text-cyan-400 transition-colors">
                  <BookOpen className="h-4 w-4 mr-2" />
                  投稿ガイドライン
                </Link>
              </li>
              <li>
                <Link to="/contact" className="flex items-center hover:text-cyan-400 transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">法的情報</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="flex items-center hover:text-cyan-400 transition-colors">
                  <FileText className="h-4 w-4 mr-2" />
                  利用規約
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="flex items-center hover:text-cyan-400 transition-colors">
                  <Shield className="h-4 w-4 mr-2" />
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link to="/commercial-transactions" className="flex items-center hover:text-cyan-400 transition-colors">
                  <FileText className="h-4 w-4 mr-2" />
                  特定商取引法に基づく表記
                </Link>
              </li>
              <li>
                <Link to="/company" className="hover:text-cyan-400 transition-colors">
                  運営会社
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 下部 - コピーライト */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {currentYear} イラストーク大学 (LumiLumi). All rights reserved.
            </p>
            <p className="text-xs text-gray-600 mt-2 md:mt-0">
              学生クリエイターの創作活動を支援するプラットフォーム
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
