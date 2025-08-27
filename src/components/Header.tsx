import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, Upload, Menu, X } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface HeaderProps {
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { user, profile, signOut } = useSupabaseAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => location.pathname === path;
  const isMainContentPage = ['/manga', '/illustrations', '/works', '/contests', '/direct-requests'].includes(location.pathname);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavigation = (type: string, action: string) => {
    setIsMenuOpen(false);
    switch (action) {
      case 'home':
        navigate(type === 'manga' ? '/manga' : '/illustrations');
        break;
      case 'requests':
        navigate('/direct-requests');
        break;
      case 'ranking':
        navigate(type === 'manga' ? '/manga-ranking' : '/illustration-ranking');
        break;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">MangaHub</span>
          </Link>

          {/* 検索バー */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="作品やユーザーを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
          </div>

          {/* ナビゲーション */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              to="/manga"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/manga')
                  ? 'text-cyan-600 bg-cyan-50'
                  : 'text-gray-700 hover:text-cyan-600 hover:bg-gray-50'
              }`}
            >
              マンガ
            </Link>
            <Link
              to="/illustrations"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/illustrations')
                  ? 'text-cyan-600 bg-cyan-50'
                  : 'text-gray-700 hover:text-cyan-600 hover:bg-gray-50'
              }`}
            >
              イラスト
            </Link>
            <Link
              to="/works"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/works')
                  ? 'text-cyan-600 bg-cyan-50'
                  : 'text-gray-700 hover:text-cyan-600 hover:bg-gray-50'
              }`}
            >
              作品一覧
            </Link>
            <Link
              to="/contests"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/contests')
                  ? 'text-cyan-600 bg-cyan-50'
                  : 'text-gray-700 hover:text-cyan-600 hover:bg-gray-50'
              }`}
            >
              コンテスト
            </Link>
            <Link
              to="/r18"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors bg-red-50 text-red-600 hover:bg-red-100 ${
                isActive('/r18') ? 'bg-red-100' : ''
              }`}
            >
              R-18
            </Link>
            <Link
              to="/supabase-test"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/supabase-test')
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              DBテスト
            </Link>
          </nav>

          {/* 右側のボタン群 */}
          <div className="flex items-center space-x-4">
            {/* ハンバーガーメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-cyan-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* ユーザーメニュー */}
            {user && profile ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/my-page"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-cyan-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">{profile.display_name}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                ログイン
              </button>
            )}
          </div>
        </div>

        {/* 下段ヘッダー（デスクトップ） */}
        <div className="hidden lg:block border-t border-gray-200">
          <div className="flex items-center justify-between py-3">
            {/* 左側: マンガ */}
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium text-gray-600 mr-3">マンガ</span>
              <button
                onClick={() => navigate('/manga')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isMainContentPage && isActive('/manga')
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                ホーム
              </button>
              <button
                onClick={() => navigate('/direct-requests')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isMainContentPage && isActive('/direct-requests')
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                依頼
              </button>
              <button
                onClick={() => navigate('/manga-ranking')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isMainContentPage && isActive('/manga-ranking')
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                ランキング
              </button>
            </div>

            {/* 右側: イラスト */}
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium text-gray-600 mr-3">イラスト</span>
              <button
                onClick={() => navigate('/illustrations')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isMainContentPage && isActive('/illustrations')
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                ホーム
              </button>
              <button
                onClick={() => navigate('/direct-requests')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isMainContentPage && isActive('/direct-requests')
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                依頼
              </button>
              <button
                onClick={() => navigate('/illustration-ranking')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isMainContentPage && isActive('/illustration-ranking')
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                ランキング
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/manga"
                className="px-3 py-2 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                マンガ
              </Link>
              <Link
                to="/illustrations"
                className="px-3 py-2 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                イラスト
              </Link>
              <Link
                to="/works"
                className="px-3 py-2 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                作品一覧
              </Link>
              <Link
                to="/contests"
                className="px-3 py-2 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                コンテスト
              </Link>
              <Link
                to="/r18"
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                R-18
              </Link>
              <Link
                to="/supabase-test"
                className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                DBテスト
              </Link>
              
              {/* ナビゲーション */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="px-3 py-2 text-sm font-medium text-gray-500">ナビゲーション</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {/* マンガ */}
                  <div>
                    <h4 className="px-3 py-1 text-sm font-medium text-gray-700">マンガ</h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavigation('manga', 'home')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"
                      >
                        ホーム
                      </button>
                      <button
                        onClick={() => handleNavigation('manga', 'requests')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"
                      >
                        依頼
                      </button>
                      <button
                        onClick={() => handleNavigation('manga', 'ranking')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"
                      >
                        ランキング
                      </button>
                    </div>
                  </div>
                  
                  {/* イラスト */}
                  <div>
                    <h4 className="px-3 py-1 text-sm font-medium text-gray-700">イラスト</h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavigation('illustration', 'home')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"
                      >
                        ホーム
                      </button>
                      <button
                        onClick={() => handleNavigation('illustration', 'requests')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"
                      >
                        依頼
                      </button>
                      <button
                        onClick={() => handleNavigation('illustration', 'ranking')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"
                      >
                        ランキング
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* モバイル検索 */}
            <div className="mt-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="作品やユーザーを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;