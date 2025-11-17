import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, BookOpen, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

          {/* SNS */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">SNS</h3>
            <p className="text-sm text-gray-400 mb-4">
              公式SNSで最新情報をチェック
            </p>
            <div className="flex space-x-4">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="X (Twitter)"
                title="X (Twitter)"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="Discord"
                title="Discord"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 法的情報 - コメントアウト */}
          {/*
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
          */}
        </div>

        {/* 下部 - コピーライト */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {currentYear} イラストーク大学. All rights reserved.
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
