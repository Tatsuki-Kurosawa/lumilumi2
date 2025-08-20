import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, Upload, Menu, X, Trophy, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onLoginClick: () => void;
  activeContentType: 'manga' | 'illustration';
  onContentTypeChange: (type: 'manga' | 'illustration') => void;
  activeSection: 'home' | 'requests' | 'ranking';
  onSectionChange: (section: 'home' | 'requests' | 'ranking') => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onLoginClick, 
  activeContentType, 
  onContentTypeChange,
  activeSection,
  onSectionChange
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  const handleContentTypeChange = (type: 'manga' | 'illustration') => {
    onContentTypeChange(type);
    // メインページに移動
    if (location.pathname !== '/main') {
      navigate('/main');
    }
  };

  const handleSectionChange = (section: 'home' | 'requests' | 'ranking') => {
    onSectionChange(section);
    // メインページに移動
    if (location.pathname !== '/main') {
      navigate('/main');
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      {/* 上段ヘッダー */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* ロゴ */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">MangaHub</span>
            </Link>

            {/* 右側メニュー */}
            <div className="flex items-center space-x-4">
              {/* 検索 */}
              <div className="hidden md:block">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                </form>
              </div>

              {/* 投稿 */}
              {isAuthenticated && (
                <Link
                  to="/upload"
                  className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition-colors text-sm"
                >
                  <Upload className="h-4 w-4" />
                  <span>投稿</span>
                </Link>
              )}

              {/* コンテスト */}
              <Link
                to="/contests"
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors text-sm"
              >
                <Trophy className="h-4 w-4" />
                <span>コンテスト</span>
              </Link>

              {/* R-18 */}
              <Link
                to="/r18"
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full transition-colors text-sm"
              >
                <Eye className="h-4 w-4" />
                <span>R-18</span>
              </Link>

              {/* ユーザーメニュー */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center">
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
              ) : (
                <button
                  onClick={onLoginClick}
                  className="px-4 py-1.5 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition-colors text-sm"
                >
                  ログイン
                </button>
              )}

              {/* モバイルメニューボタン */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 text-gray-700 hover:text-yellow-600 transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 下段ヘッダー（常に表示） */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* デスクトップ表示 */}
          <div className="hidden sm:flex items-center justify-between h-14">
            {/* 左側: コンテンツタイプ切り替え */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleContentTypeChange('manga')}
                className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                  activeContentType === 'manga'
                    ? 'bg-yellow-400 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200'
                }`}
              >
                マンガ
              </button>
              <button
                onClick={() => handleContentTypeChange('illustration')}
                className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                  activeContentType === 'illustration'
                    ? 'bg-yellow-400 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200'
                }`}
              >
                イラスト
              </button>
            </div>

            {/* 右側: セクション切り替え */}
            <div className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => handleSectionChange('home')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeSection === 'home'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-cyan-600 hover:bg-cyan-50'
                }`}
              >
                ホーム
              </button>
              <button
                onClick={() => handleSectionChange('requests')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeSection === 'requests'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-cyan-600 hover:bg-cyan-50'
                }`}
              >
                依頼
              </button>
              <button
                onClick={() => handleSectionChange('ranking')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeSection === 'ranking'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-cyan-600 hover:bg-cyan-50'
                }`}
              >
                ランキング
              </button>
            </div>
          </div>

          {/* モバイル表示 */}
          <div className="sm:hidden py-3">
            <div className="grid grid-cols-2 gap-2">
              {/* マンガセクション */}
              <div className="space-y-2">
                <div className="text-center">
                  <button
                    onClick={() => handleContentTypeChange('manga')}
                    className={`w-full px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      activeContentType === 'manga'
                        ? 'bg-yellow-400 text-white'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    マンガ
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleContentTypeChange('manga');
                      handleSectionChange('home');
                    }}
                    className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                      activeContentType === 'manga' && activeSection === 'home'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-cyan-50'
                    }`}
                  >
                    ホーム
                  </button>
                  <button
                    onClick={() => {
                      handleContentTypeChange('manga');
                      handleSectionChange('requests');
                    }}
                    className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                      activeContentType === 'manga' && activeSection === 'requests'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-cyan-50'
                    }`}
                  >
                    依頼
                  </button>
                  <button
                    onClick={() => {
                      handleContentTypeChange('manga');
                      handleSectionChange('ranking');
                    }}
                    className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                      activeContentType === 'manga' && activeSection === 'ranking'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-cyan-50'
                    }`}
                  >
                    ランキング
                  </button>
                </div>
              </div>

              {/* イラストセクション */}
              <div className="space-y-2">
                <div className="text-center">
                  <button
                    onClick={() => handleContentTypeChange('illustration')}
                    className={`w-full px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      activeContentType === 'illustration'
                        ? 'bg-yellow-400 text-white'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    イラスト
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleContentTypeChange('illustration');
                      handleSectionChange('home');
                    }}
                    className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                      activeContentType === 'illustration' && activeSection === 'home'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-cyan-50'
                    }`}
                  >
                    ホーム
                  </button>
                  <button
                    onClick={() => {
                      handleContentTypeChange('illustration');
                      handleSectionChange('requests');
                    }}
                    className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                      activeContentType === 'illustration' && activeSection === 'requests'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-cyan-50'
                    }`}
                  >
                    依頼
                  </button>
                  <button
                    onClick={() => {
                      handleContentTypeChange('illustration');
                      handleSectionChange('ranking');
                    }}
                    className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                      activeContentType === 'illustration' && activeSection === 'ranking'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-cyan-50'
                    }`}
                  >
                    ランキング
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* モバイルメニュー（上段の追加メニュー） */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 py-4 bg-white">
          <div className="flex flex-col space-y-2 px-4">
            <Link
              to="/upload"
              className="px-3 py-2 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              投稿
            </Link>
            <Link
              to="/contests"
              className="px-3 py-2 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-md"
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
          </div>
          {/* モバイル検索 */}
          <div className="mt-4 px-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;