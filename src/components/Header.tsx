import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, Upload, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => location.pathname === path;

  // 6パターンのページかどうかを判定
  const isMainContentPage = ['/manga', '/illustrations', '/manga-ranking', '/illustration-ranking', '/direct-requests'].includes(location.pathname);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  const handleNavigation = (contentType: 'manga' | 'illustration', section: 'home' | 'requests' | 'ranking') => {
    setIsMenuOpen(false);
    
    if (contentType === 'manga') {
      switch (section) {
        case 'home':
          navigate('/manga');
          break;
        case 'requests':
          navigate('/direct-requests');
          break;
        case 'ranking':
          navigate('/manga-ranking');
          break;
      }
    } else {
      switch (section) {
        case 'home':
          navigate('/illustrations');
          break;
        case 'requests':
          navigate('/direct-requests');
          break;
        case 'ranking':
          navigate('/illustration-ranking');
          break;
      }
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
          </nav>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/upload"
                  className="hidden sm:flex items-center space-x-1 px-4 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>投稿</span>
                </Link>
                <Link to="/mypage" className="p-2 text-gray-700 hover:text-cyan-600 transition-colors">
                  <Heart className="h-5 w-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.displayName}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/mypage"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      マイページ
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition-colors"
              >
                ログイン
              </button>
            )}

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-cyan-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
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